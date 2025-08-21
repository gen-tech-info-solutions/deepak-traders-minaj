// src/components/cart/MiniCart.tsx
import { api } from '@/_generated/api';
import { useCart } from '@/hooks/useCart';
import { useQuery } from 'convex/react';
import { Button } from '../ui/button';
import { ShoppingBagIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Link } from '@tanstack/react-router';
import { useMemo } from 'react';

export function MiniCart() {
  const { items } = useCart();

  // Only ask for IDs when we actually have some
  const productIds = useMemo(
    () => (items.length ? items.map((i) => i.productId) : []),
    [items],
  );

  const products = useQuery(
    api.products.getByIds,
    productIds.length ? { ids: productIds } : 'skip',
  );

  const productMap = useMemo(() => {
    if (!products) return new Map();
    return new Map(products.filter(Boolean).map((p) => [p!._id, p!]));
  }, [products]);

  const total = useMemo(() => {
    return items.reduce((sum, i) => {
      const p = productMap.get(i.productId);
      return sum + (p?.price ?? 0) * i.qty;
    }, 0);
  }, [items, productMap]);

  const totalItemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.qty, 0),
    [items],
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='ghost' className='relative'>
          <ShoppingBagIcon className='h-5 w-5' />
          {totalItemCount > 0 && (
            <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center'>
              {totalItemCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className='w-80'>
        {items.length === 0 ? (
          <p className='text-sm text-muted-foreground'>Your cart is empty</p>
        ) : (
          <div className='space-y-2'>
            {!products ? (
              <p className='text-sm text-muted-foreground'>Loading…</p>
            ) : (
              <>
                {items.map((i) => {
                  const p = productMap.get(i.productId);
                  return p ? (
                    <div key={i.productId} className='flex gap-2'>
                      <img
                        src={p.image}
                        alt={p.name}
                        className='h-12 w-12 object-cover rounded'
                      />
                      <div className='flex-1'>
                        <p className='text-sm font-medium'>{p.name}</p>
                        <p className='text-xs text-muted-foreground'>
                          Qty {i.qty} × ${p.price}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div key={i.productId} className='flex gap-2'>
                      <div className='h-12 w-12 bg-gray-200 rounded' />
                      <div className='flex-1'>
                        <p className='text-sm font-medium text-muted-foreground'>
                          Product unavailable
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          Qty {i.qty}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <hr />
                <div className='flex justify-between font-bold'>
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <Button asChild className='w-full mt-2'>
                  <Link to='/cart'>Go to cart</Link>
                </Button>
              </>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
