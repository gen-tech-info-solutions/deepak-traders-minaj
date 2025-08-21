import { v } from 'convex/values';
import { Id } from './_generated/dataModel';
import { mutation, query } from './_generated/server';

export const getMine = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const userId = identity.subject as Id<'users'>;

    const cart = await ctx.db
      .query('carts')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();
    return cart ?? { items: [] };
  },
});

export const setMine = mutation({
  args: {
    items: v.array(v.object({ productId: v.id('products'), qty: v.number() })),
  },
  handler: async (ctx, { items }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Must be logged in');

    const userId = identity.subject as Id<'users'>;
    const existing = await ctx.db
      .query('carts')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { items });
    } else {
      await ctx.db.insert('carts', { userId, items });
    }
  },
});
