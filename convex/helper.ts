import {
  customCtx,
  customMutation,
  customQuery,
} from 'convex-helpers/server/customFunctions';
import { ConvexError } from 'convex/values';
import { Id } from './_generated/dataModel';
import { mutation, query, QueryCtx } from './_generated/server';
import { betterAuthComponent } from './auth';

async function requireAdmin(ctx: QueryCtx) {
  const userId = await betterAuthComponent.getAuthUserId(ctx);
  if (!userId) throw new ConvexError('Not authenticated');

  const user = await ctx.db.get(userId as Id<'users'>);

  if (!user || user.role !== 'admin') throw new ConvexError('Not an admin');

  return user;
}

export const adminQuery = customQuery(
  query,
  customCtx(async (ctx) => {
    const user = await requireAdmin(ctx);
    return { user };
  }),
);

export const adminMutation = customMutation(
  mutation,
  customCtx(async (ctx) => {
    const user = await requireAdmin(ctx);
    return { user };
  }),
);

async function requireMember(ctx: QueryCtx) {
  const userId = await betterAuthComponent.getAuthUserId(ctx);
  if (!userId) throw new ConvexError('Not authenticated');

  const user = await ctx.db.get(userId as Id<'users'>);

  if (!user || user.role !== 'member') throw new ConvexError('Not an member');

  return user;
}

export const authQuery = customQuery(
  query,
  customCtx(async (ctx) => {
    const user = await requireMember(ctx);
    return { user };
  }),
);

export const authMutation = customMutation(
  mutation,
  customCtx(async (ctx) => {
    const user = await requireMember(ctx);
    return { user };
  }),
);
