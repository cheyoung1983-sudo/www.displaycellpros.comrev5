// src/lib/vercelAuth.ts
/**
 * Exchange an Auth0 authorization code for a Vercel token.
 * @param code Authorization code received from Auth0.
 * @returns Access token string.
 */
export async function exchangeCodeForToken(code: string): Promise<any> {
  // Logic to exchange code for token via Vercel / Auth0
  // This usually involves a POST to /oauth/token
  const response = await fetch(`${process.env.AUTH0_ISSUER}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      client_id: process.env.AUTH0_CLIENT_ID,
      client_secret: process.env.AUTH0_CLIENT_SECRET,
      code,
      redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/vercel`,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange code: ${error}`);
  }

  return response.json();
}

/**
 * Refresh a Vercel token using the OIDC provider.
 * @param refreshToken Refresh token issued by Vercel OIDC.
 * @returns New access token string.
 */
export async function refreshVercelToken(refreshToken: string): Promise<any> {
    try {
      const response = await fetch(`${process.env.AUTH0_ISSUER}/oauth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grant_type: 'refresh_token',
          client_id: process.env.AUTH0_CLIENT_ID,
          client_secret: process.env.AUTH0_CLIENT_SECRET,
          refresh_token: refreshToken,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      return response.json();
    } catch (err) {
      console.error('Failed to refresh Vercel token:', err);
      throw err;
    }
}
