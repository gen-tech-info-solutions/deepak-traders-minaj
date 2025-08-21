import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal('admin'), v.literal('member')),
  }).index('by_email', ['email']),

  categories: defineTable({
    name: v.string(),
  }),

  products: defineTable({
    name: v.string(),
    price: v.float64(),
    image: v.string(),
    category: v.id('categories'),
  })
    .index('by_category', ['category'])
    .searchIndex('search_name', { searchField: 'name' }),

  carts: defineTable({
    userId: v.id('users'),
    items: v.array(
      v.object({
        productId: v.id('products'),
        qty: v.number(),
      }),
    ),
  }).index('by_user', ['userId']),

  orders: defineTable({
    userId: v.id('users'),
    amount: v.float64(),
    currency: v.string(),
    status: v.union(
      v.literal('pending'),
      v.literal('paid'),
      v.literal('failed'),
    ),
    razorpayOrderId: v.optional(v.string()),
    razorpayPaymentId: v.optional(v.string()),
    razorpaySignature: v.optional(v.string()),
    receipt: v.optional(v.string()),
    notes: v.optional(v.any()),
    shippingAddress: v.object({
      name: v.string(),
      email: v.string(),
      phone: v.string(),
      address: v.string(),
      city: v.string(),
      state: v.string(),
      zip: v.string(),
    }),
    createdAt: v.number(), // epoch ms
    paidAt: v.optional(v.number()),
  })
    .index('by_userId', ['userId'])
    .index('by_razorpayOrderId', ['razorpayOrderId']),

  orderItems: defineTable({
    orderId: v.id('orders'),
    productId: v.id('products'),
    quantity: v.number(),
    price: v.float64(),
    name: v.string(),
  }).index('by_orderId', ['orderId']),
});
