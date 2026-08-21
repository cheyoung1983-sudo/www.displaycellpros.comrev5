import { Auth0Client } from '@auth0/nextjs-auth0/server';

/**
 * Whether the server-side Auth0 SDK has what it needs to run. When any of
 * these are unset, auth0.middleware() throws a DomainResolutionError on
 * every request (not just auth routes - the middleware matcher covers
 * virtually the whole app), which otherwise turns into a site-wide 500.
 * Callers must check this before invoking auth0.middleware()/getSession().
 */
export function isAuth0ServerConfigured(): boolean {
  return Boolean(
    process.env.AUTH0_DOMAIN &&
    process.env.AUTH0_CLIENT_ID &&
    process.env.AUTH0_SECRET
  );
}

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
