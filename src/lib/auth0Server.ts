import { Auth0Client } from '@auth0/nextjs-auth0/server';

/**
 * Custom route prefix (/auth0/*) so the SDK's mounted routes never collide
 * with the existing GitHub OAuth popup callback at /auth/callback and
 * /auth/github/callback (see src/lib/githubOAuthCallback.ts) - those are an
 * unrelated integration that already owns the /auth/* namespace.
 */
export const auth0 = new Auth0Client({
  routes: {
    login: '/auth0/login',
    logout: '/auth0/logout',
    callback: '/auth0/callback',
    profile: '/auth0/profile',
    accessToken: '/auth0/access-token',
    backChannelLogout: '/auth0/backchannel-logout',
  },
  authorizationParameters: {
    scope: 'openid profile email offline_access read:repairs write:repairs',
    ...(process.env.AUTH0_AUDIENCE ? { audience: process.env.AUTH0_AUDIENCE } : {}),
  },
});
