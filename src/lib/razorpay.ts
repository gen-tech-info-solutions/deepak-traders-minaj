import { createServerFn } from '@tanstack/react-start';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export const createRazorpayOrder = createServerFn({ method: 'POST' })
  .validator((d: { amount: number; receipt: string }) => d)
  .handler(async ({ data }) => {
    const order = await razorpay.orders.create({
      amount: Math.round(data.amount * 100),
      currency: 'INR',
      receipt: data.receipt,
    });
    return { orderId: order.id };
  });
