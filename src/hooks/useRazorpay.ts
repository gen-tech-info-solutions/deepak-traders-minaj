import { api } from '@/_generated/api';
import { Id } from '@/_generated/dataModel';
import { createRazorpayOrder } from '@/lib/razorpay';
import { useConvexMutation } from '@convex-dev/react-query';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { useCart } from './useCart';

type Item = { productId: Id<'products'>; qty: number };
type Address = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
};

export function useRazorpay() {
  const navigate = useNavigate();
  const createOrder = useMutation({
    mutationFn: useConvexMutation(api.orders.createOrder),
  });
  const verifyPayment = useMutation({
    mutationFn: useConvexMutation(api.orders.verifyPayment),
  });
  const _createRazorpayOrder = useServerFn(createRazorpayOrder);
  const { clearCart } = useCart();

  const openCheckout = async (items: Item[], shipping: Address) => {
    const { orderId, amount } = await createOrder.mutateAsync({
      items,
      shippingAddress: shipping,
    });

    const { orderId: razorpayOrderId } = await _createRazorpayOrder({
      data: { amount, receipt: orderId },
    });

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: Math.round(amount * 100),
      currency: 'INR',
      name: 'Deepak Traders',
      description: `Order #${orderId}`,
      order_id: razorpayOrderId,
      prefill: {
        name: shipping.name,
        email: shipping.email,
        contact: shipping.phone,
      },
      handler: async (response: any) => {
        verifyPayment.mutate({
          orderId: orderId as Id<'orders'>,
          razorpayOrderId,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        });
        clearCart();
        navigate({ from: '/orders' });
      },
    };

    // @ts-ignore
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return { openCheckout };
}
