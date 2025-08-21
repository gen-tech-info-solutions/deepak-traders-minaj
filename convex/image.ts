import { v } from 'convex/values';
import { adminMutation } from './helper';

export const generateUploadUrl = adminMutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const deleteImageById = adminMutation({
  args: { storageId: v.id('_storage') },
  handler: async (ctx, args) => {
    return await ctx.storage.delete(args.storageId);
  },
});
