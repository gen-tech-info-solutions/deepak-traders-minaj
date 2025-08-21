import { api } from '@/_generated/api';
import { Id } from '@/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { useEffect, useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { useLocalStorage } from './useLocalStorage';
import { useUserInfo } from './useUserInfo';

export type CartItem = { productId: Id<'products'>; qty: number };

export function useCart() {
  const remote = useQuery(api.carts.getMine) ?? { items: [] };
  const setRemote = useMutation(api.carts.setMine);
  const { user } = useUserInfo();
  const prevUserId = useRef<string | null>(null);
  const [guest, setGuest] = useLocalStorage<CartItem[]>('guest-cart', []);

  const items = user?._id ? remote.items : guest;
  const debouncedSet = useDebouncedCallback(setRemote, 500);

  const merge = (
    a: CartItem[],
    b: CartItem[],
    mode: 'sum' | 'replace' = 'sum',
  ) => {
    const map = new Map<Id<'products'>, number>();
    for (const { productId, qty } of a) map.set(productId, qty);
    for (const { productId, qty } of b) {
      const cur = map.get(productId) ?? 0;
      map.set(productId, mode === 'sum' ? cur + qty : qty);
    }
    return Array.from(map, ([productId, qty]) => ({ productId, qty }));
  };

  const set = (updater: (prev: CartItem[]) => CartItem[]) => {
    const next = updater(items);
    if (user?._id) debouncedSet({ items: next });
    else setGuest(next);
  };

  const add = (pid: Id<'products'>, n = 1) =>
    set((prev) => {
      const copy = [...prev];
      const idx = copy.findIndex((i) => i.productId === pid);
      if (idx >= 0) copy[idx].qty = Math.min(copy[idx].qty + n, 99);
      else copy.push({ productId: pid, qty: Math.min(n, 99) });
      return copy;
    });

  const change = (pid: Id<'products'>, qty: number) =>
    set((prev) =>
      qty <= 0
        ? prev.filter((i) => i.productId !== pid)
        : prev.map((i) =>
            i.productId === pid ? { ...i, qty: Math.min(qty, 99) } : i,
          ),
    );

  const remove = (pid: Id<'products'>) =>
    set((prev) => prev.filter((i) => i.productId !== pid));

  // login / logout sync
  useEffect(() => {
    if (user?._id && !prevUserId.current && guest.length) {
      setRemote({ items: merge(guest, remote.items) });
      setGuest([]);
    } else if (!user?._id && prevUserId.current && remote.items.length) {
      setGuest(merge(remote.items, guest, 'replace'));
    }
    prevUserId.current = user?._id ?? null;
  }, [user?._id, guest, remote.items, setGuest, setRemote]);

  return {
    items,
    addItem: add,
    changeQty: change,
    removeItem: remove,
    clearCart: () => set(() => []),
    isEmpty: items.length === 0,
    isLoading: remote === undefined,
  };
}
