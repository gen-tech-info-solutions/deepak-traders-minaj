/// <reference types="vite/client" />
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { authClient } from '@/lib/auth-client';
import { fetchSession, getCookieName } from '@/lib/server-auth-utils';
import { ConvexBetterAuthProvider } from '@convex-dev/better-auth/react';
import { ConvexQueryClient } from '@convex-dev/react-query';
import { QueryClient } from '@tanstack/react-query';
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
  useRouteContext,
} from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getCookie, getWebRequest } from '@tanstack/react-start/server';
import { ConvexReactClient } from 'convex/react';
import type { ReactNode } from 'react';

import { ThemeProvider, useTheme } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { getThemeServerFn } from '@/lib/theme';
import appCss from '../styles/app.css?url';


const fetchAuth = createServerFn({ method: 'GET' }).handler(async () => {
  const sessionCookieName = await getCookieName();
  const token = getCookie(sessionCookieName);
  const request = getWebRequest();
  const { session } = await fetchSession(request);

  return {
    userId: session?.user.id,
    token,
  };
});

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  convexClient: ConvexReactClient;
  convexQueryClient: ConvexQueryClient;
}>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Deepak Traders – Wholesale Beads & Jewelry Supplies',
      },
    ],
    scripts: [{ src: 'https://checkout.razorpay.com/v1/checkout.js' }],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  beforeLoad: async (ctx) => {
    // all queries, mutations and action made with TanStack Query will be
    // authenticated by an identity token.
    const auth = await fetchAuth();
    const { userId, token } = auth;

    // During SSR only (the only time serverHttpClient exists),
    // set the auth token for Convex to make HTTP queries with.
    if (token) {
      ctx.context.convexQueryClient.serverHttpClient?.setAuth(token);
    }

    return { userId, token };
  },
  component: RootComponent,
  loader: () => getThemeServerFn(),
});

function RootComponent() {
  const context = useRouteContext({ from: Route.id });
  const data = Route.useLoaderData();

  return (
    <ConvexBetterAuthProvider
      client={context.convexClient}
      authClient={authClient}
    >
      <ThemeProvider theme={data}>
        <RootDocument>
          <Header />
          <Outlet />
          <Footer />
          <Toaster richColors />
        </RootDocument>
      </ThemeProvider>
    </ConvexBetterAuthProvider>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  const { theme } = useTheme();

  return (
    <html lang='en' className={theme} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
