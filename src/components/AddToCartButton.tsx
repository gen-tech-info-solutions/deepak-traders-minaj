import { ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';
import { useCart } from '@/hooks/useCart';
import { Id } from '@/_generated/dataModel';
import { toast } from 'sonner';

export function AddToCart({ id, qty }: { id: Id<'products'>; qty?: number }) {
  const { addItem } = useCart();

  const handleAdd = async () => {
  try {
    await addItem(id, qty);
    toast.success('Added to cart', {
  description: 'You can view it in your cart',
  icon: <ShoppingCart size={18} />,
});
  } catch (err) {
    toast.error('Failed to add item.');
  }
};


  return (
    <Button
      onClick={handleAdd}
      className='w-full flex items-center justify-center gap-2 bg-black text-white hover:text-black cursor-pointer'
      variant='secondary'
    >
      <ShoppingCart className='size-5' />
      Add to Cart
    </Button>
  );
}
