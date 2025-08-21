import { v } from 'convex/values';
import { query } from './_generated/server';
import { adminMutation } from './helper';
import { Id } from './_generated/dataModel';

export const listCategories = query({
  handler: async (ctx) => {
    return await ctx.db.query('categories').collect();
  },
});

export const addCategory = adminMutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.insert('categories', args);
  },
});

export const listCategoriesWithPreview = query({
  args: { limitPerCat: v.optional(v.number()) },
  handler: async (ctx, { limitPerCat = 3 }) => {
    const cats = await ctx.db.query('categories').collect();

    return Promise.all(
      cats.map(async (cat) => {
        const prods = await ctx.db
          .query('products')
          .withIndex('by_category', (q) => q.eq('category', cat._id))
          .order('desc')
          .take(limitPerCat);

        const previews = await Promise.all(
          prods.map(async (p) => ({
            _id: p._id,
            name: p.name,
            price: p.price,
            image: await ctx.storage.getUrl(p.image as Id<'_storage'>),
          })),
        );

        return { ...cat, previews };
      }),
    );
  },
});
