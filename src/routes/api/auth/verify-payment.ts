import { json } from '@tanstack/react-start';
import {
  createServerFileRoute,
  setResponseStatus,
} from '@tanstack/react-start/server';
import crypto from 'node:crypto';

export const ServerRoute = createServerFileRoute(
  '/api/auth/verify-payment',
).methods({
  POST: async ({ request }) => {
    const body = await request.json();

    // 1. Validate the payload shape
    if (
      typeof body.razorpay_order_id !== 'string' ||
      typeof body.razorpay_payment_id !== 'string' ||
      typeof body.razorpay_signature !== 'string'
    ) {
      setResponseStatus(400);
      return json({ error: 'Missing or invalid fields' });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      // Never leak the raw error to the client in production
      console.error('RAZORPAY_KEY_SECRET is not configured');
      setResponseStatus(500);
      return json({ error: 'Server misconfiguration' });
    }

    // 2. Compute expected signature
    const hmac = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    // 3. Compare signatures
    if (hmac !== razorpay_signature) {
      setResponseStatus(400);
      return json({ error: 'Invalid signature' });
    }

    // 4. Success: return a concise 200 OK
    return json({ ok: true });
  },
});
