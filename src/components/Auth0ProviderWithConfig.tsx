"use client";

import { ReactNode } from 'react';
import { useUser, getAccessToken } from '@auth0/nextjs-auth0/client';
import type { User } from '@auth0/nextjs-auth0/types';

const PROFILE_ROUTE = '/auth0/profile';
const ACCESS_TOKEN_ROUTE = '/auth0/access-token';

interface SafeAuth0Value {
  isConfigured: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  user?: User;
  loginWithRedirect: (options?: { returnTo?: string }) => Promise<void>;
  loginWithPopup: (options?: { returnTo?: string }) => Promise<void>;
  logout: (options?: { logoutParams?: { returnTo?: string } }) => Promise<void>;
  getAccessTokenSilently: (options?: { audience?: string; scope?: string }) => Promise<string>;
}

/**
 * Best-effort "has anyone set up Auth0 for this deployment" signal. The v4
 * SDK is server-side and doesn't need public env vars to function, but the
 * UI still uses this to decide whether to show a real login button or a
 * "not configured yet" state - it assumes ops sets the public and server
 * Auth0 env vars together.
 */
export function isAuth0Configured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_AUTH0_DOMAIN &&
    process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID
  );
}

function buildUrl(base: string, returnTo?: string): string {
  if (!returnTo) return base;
  return `${base}?returnTo=${encodeURIComponent(returnTo)}`;
}

export function Auth0ProviderWithConfig({ children }: { children: ReactNode }) {
  // The v4 SDK reads its session from an httpOnly cookie via /auth0/profile,
  // so unlike the old @auth0/auth0-react setup, no client-side context
  // provider is required here - useSafeAuth0() below talks to the SDK
  // directly through its client helpers.
  return <>{children}</>;
}

export function useSafeAuth0(): SafeAuth0Value {
  const { user, isLoading } = useUser({ route: PROFILE_ROUTE });
  const configured = isAuth0Configured();

  return {
    isConfigured: configured,
    isAuthenticated: Boolean(user),
    isLoading,
    user: user ?? undefined,
    loginWithRedirect: async (options) => {
      if (!configured) return;
      window.location.href = buildUrl('/auth0/login', options?.returnTo);
    },
    // v4 has no popup login mode; fall back to a full-page redirect.
    loginWithPopup: async (options) => {
      if (!configured) return;
      window.location.href = buildUrl('/auth0/login', options?.returnTo);
    },
    logout: async (options) => {
      if (!configured) return;
      window.location.href = buildUrl('/auth0/logout', options?.logoutParams?.returnTo);
    },
    getAccessTokenSilently: async (options) => {
      if (!configured) return '';
      return getAccessToken({
        route: ACCESS_TOKEN_ROUTE,
        audience: options?.audience,
        scope: options?.scope,
      });
    },
  };
}
