import { getAll } from 'convex-helpers/server/relationships';
import { partial } from 'convex-helpers/validators';
import { paginationOptsValidator } from 'convex/server';
import { v } from 'convex/values';
import { Id } from './_generated/dataModel';
import { query } from './_generated/server';
import { adminMutation } from './helper';

const productArgs = v.object({
  name: v.string(),
  price: v.float64(),
  image: v.string(),
  category: v.id('categories'),
});

const productUpdateArgs = v.object({
  id: v.id('products'),
  ...partial(productArgs.fields),
});

export const listProducts = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const productsResult = await ctx.db
      .query('products')
      .order('desc')
      .paginate(args.paginationOpts);

    const transformedPage = await Promise.all(
      productsResult.page.map(async (product) => {
        // Get image URL
        const imageUrl = await ctx.storage.getUrl(
          product.image as Id<'_storage'>,
        );

        // Get category document
        const categoryDoc = await ctx.db.get(product.category);
        // If category is null, handle gracefully
        const categoryName = categoryDoc ? categoryDoc.name : null;

        return {
          ...product,
          image: imageUrl,
          category: categoryName,
        };
      }),
    );

    return {
      ...productsResult,
      page: transformedPage,
    };
  },
});

export const addProduct = adminMutation({
  args: productArgs,
  handler: async (ctx, args) => {
    return await ctx.db.insert('products', args);
  },
});

export const searchProducts = query({
  args: {
    searchTerm: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { searchTerm, paginationOpts }) => {
    const results = await ctx.db
      .query('products')
      .withSearchIndex(
        'search_name',
        (q) => q.search('name', searchTerm), // uses built-in text index
      )
      .paginate(paginationOpts);

    // Resolve storage URLs
    const page = await Promise.all(
      results.page.map(async (p) => ({
        ...p,
        image: await ctx.storage.getUrl(p.image),
      })),
    );

    return { ...results, page };
  },
});

export const getByCategory = query({
  args: { categoryName: v.string() },
  handler: async (ctx, { categoryName }) => {
    // 1. Find the category document whose name matches (case-insensitive)
    const categoryDoc = await ctx.db
      .query('categories')
      .filter((q) => q.eq(q.field('name'), categoryName))
      .first();

    if (!categoryDoc) return [];

    // 2. Grab all products referencing that category id
    const products = await ctx.db
      .query('products')
      .withIndex('by_category', (q) => q.eq('category', categoryDoc._id))
      .collect();

    // 3. Resolve storage URLs exactly like listProducts / getById
    return Promise.all(
      products.map(async (p) => ({
        ...p,
        image: await ctx.storage.getUrl(p.image as Id<'_storage'>),
      })),
    );
  },
});

export const getByIds = query({
  args: { ids: v.array(v.id('products')) },
  handler: async (ctx, { ids }) => {
    if (ids.length === 0) return [];

    const products = await getAll(ctx.db, ids);

    // resolve storage URLs
    const withUrls = await Promise.all(
      products.map(async (p) => {
        const imageUrl = await ctx.storage.getUrl(p?.image as Id<'_storage'>);
        return { ...p, image: imageUrl };
      }),
    );

    return withUrls;
  },
});

export const getById = query({
  args: { id: v.id('products') },
  handler: async (ctx, { id }) => {
    const product = await ctx.db.get(id);
    if (!product) return null;

    const image = await ctx.storage.getUrl(product.image as Id<'_storage'>);
    return { ...product, image };
  },
});

export const updateProduct = adminMutation({
  args: productUpdateArgs,
  handler: async (ctx, args) => {
    const { id, ...update } = args;
    await ctx.db.patch(id, update);
  },
});

export const deleteProduct = adminMutation({
  args: { id: v.id('products') },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});
