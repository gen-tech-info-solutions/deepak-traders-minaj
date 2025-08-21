import {
  type AuthFunctions,
  BetterAuth,
  type PublicAuthFunctions,
} from '@convex-dev/better-auth';
import { api, components, internal } from './_generated/api';
import { DataModel, Id } from './_generated/dataModel';
import { query } from './_generated/server';

const authFunctions: AuthFunctions = internal.auth;
const publicAuthFunctions: PublicAuthFunctions = api.auth;

export const betterAuthComponent = new BetterAuth(components.betterAuth, {
  authFunctions,
  publicAuthFunctions,
});

export const {
  createUser,
  updateUser,
  deleteUser,
  createSession,
  isAuthenticated,
} = betterAuthComponent.createAuthFunctions<DataModel>({
  onCreateUser: async (ctx, user) => {
    const existing = await ctx.db
      .query('users')
      .withIndex('by_email')
      .collect();

    const role = existing.length === 0 ? 'admin' : 'member';

    return ctx.db.insert('users', {
      email: user.email,
      name: user.name,
      role,
    });
  },

  onDeleteUser: async (ctx, userId) => {
    await ctx.db.delete(userId as Id<'users'>);
  },
});

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    // Get user data from Better Auth - email, name, image, etc.
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);
    if (!userMetadata) {
      return null;
    }
    const user = await ctx.db.get(userMetadata.userId as Id<'users'>);
    return {
      ...user,
      ...userMetadata,
    };
  },
});
