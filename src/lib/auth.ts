import { type GenericCtx } from '@/_generated/server';
import { betterAuth } from 'better-auth';
import { convexAdapter } from '@convex-dev/better-auth';
import { convex } from '@convex-dev/better-auth/plugins';
import { betterAuthComponent } from '@/auth';

const siteUrl = 'http://localhost:3000';

export const createAuth = (ctx: GenericCtx) =>
  betterAuth({
    baseURL: siteUrl,
    database: convexAdapter(ctx, betterAuthComponent),

    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },

    plugins: [convex()],
  });
