import { getAll } from 'convex-helpers/server/relationships';
import { v } from 'convex/values';
import { authMutation, authQuery } from './helper';
import { Id } from './_generated/dataModel';

const shippingAddressValidator = v.object({
  name: v.string(),
  email: v.string(),
  phone: v.string(),
  address: v.string(),
  city: v.string(),
  state: v.string(),
  zip: v.string(),
});

export const createOrder = authMutation({
  args: {
    items: v.array(v.object({ productId: v.id('products'), qty: v.number() })),
    shippingAddress: shippingAddressValidator,
  },
  handler: async (ctx, args) => {
    const ids = args.items.map((item) => item.productId);
    const products = await getAll(ctx.db, ids); // ← fetch first

    // Map id → product for O(1) look-ups
    const productMap = new Map(products.map((p) => [p?._id.toString(), p]));

    // Validate every requested product exists
    for (const item of args.items) {
      if (!productMap.has(item.productId.toString())) {
        throw new Error(`Product ${item.productId} not found`);
      }
    }

    const amount = args.items.reduce(
      (sum, item) =>
        sum + productMap.get(item.productId.toString())!.price * item.qty,
      0,
    );

    const orderId = await ctx.db.insert('orders', {
      userId: ctx.user._id,
      amount,
      currency: 'INR',
      status: 'pending',
      shippingAddress: args.shippingAddress,
      createdAt: Date.now(),
    });

    await Promise.all(
      args.items.map((item) => {
        const p = productMap.get(item.productId.toString())!;
        return ctx.db.insert('orderItems', {
          orderId,
          productId: item.productId,
          quantity: item.qty,
          price: p.price,
          name: p.name,
        });
      }),
    );

    return { orderId: orderId.toString(), amount };
  },
});

export const verifyPayment = authMutation({
  args: {
    orderId: v.id('orders'),
    razorpayOrderId: v.string(),
    razorpayPaymentId: v.string(),
    razorpaySignature: v.string(),
  },
  handler: async (ctx, { orderId, ...rest }) => {
    await ctx.db.patch(orderId, {
      status: 'paid',
      paidAt: Date.now(),
      ...rest,
    });
  },
});

export const listUserOrders = authQuery({
  args: { userId: v.id('users') },
  handler: async (ctx, { userId }) => {
    // 1. All orders for this user, newest first
    const orders = await ctx.db
      .query('orders')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .order('desc')
      .collect();

    // 2. Join line items + resolve product image
    const enriched = await Promise.all(
      orders.map(async (order) => {
        const items = await ctx.db
          .query('orderItems')
          .withIndex('by_orderId', (q) => q.eq('orderId', order._id))
          .collect();

        const itemsWithImages = await Promise.all(
          items.map(async (item) => {
            const product = await ctx.db.get(item.productId);
            const imageUrl = product
              ? await ctx.storage.getUrl(product.image as Id<'_storage'>)
              : null;
            return { ...item, image: imageUrl };
          }),
        );

        return { ...order, items: itemsWithImages };
      }),
    );

    return enriched;
  },
});
