/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Shared handler for the GitHub OAuth popup-flow callback, ported from
 * server.ts's handleGithubCallback. Used by both /auth/github/callback
 * and /auth/callback route handlers.
 */
import type { NextRequest } from 'next/server';

function htmlResponse(html: string, status = 200) {
  return new Response(html, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

export async function handleGithubOAuthCallback(req: NextRequest): Promise<Response> {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (error || !code) {
    const errorMsg = errorDescription || error || 'Missing authorization code from GitHub';
    return htmlResponse(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>GitHub Authentication Failed</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .card { background: #1e293b; padding: 2rem; border-radius: 1rem; border: 1px solid #334155; text-align: center; max-width: 400px; }
            .error { color: #f87171; font-weight: bold; margin-bottom: 1rem; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="error">Authentication Failed</div>
            <p>${errorMsg}</p>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_ERROR', error: ${JSON.stringify(errorMsg)} }, '*');
                setTimeout(() => window.close(), 2500);
              }
            </script>
          </div>
        </body>
      </html>
    `);
  }

  try {
    const clientId = process.env.GITHUB_CLIENT_ID || 'Ov23lifKkuO7pQzIVrlG';
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!clientSecret) {
      throw new Error('GITHUB_CLIENT_SECRET is not configured on the server environment.');
    }

    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'DCP-Spokane-Lab-App',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    const tokenData = (await tokenResponse.json()) as any;

    if (tokenData.error || !tokenData.access_token) {
      throw new Error(tokenData.error_description || tokenData.error || 'Failed to exchange code for GitHub token');
    }

    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'DCP-Spokane-Lab-App',
      },
    });

    const userData = (await userResponse.json()) as any;

    const payload = {
      type: 'OAUTH_AUTH_SUCCESS',
      provider: 'github',
      accessToken: tokenData.access_token,
      tokenType: tokenData.token_type,
      scope: tokenData.scope,
      user: {
        id: userData.id,
        login: userData.login,
        name: userData.name || userData.login,
        avatar_url: userData.avatar_url,
        email: userData.email,
        bio: userData.bio,
        company: userData.company,
        location: userData.location,
        public_repos: userData.public_repos,
        html_url: userData.html_url,
      },
    };

    return htmlResponse(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>GitHub Authentication Successful</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .card { background: #1e293b; padding: 2rem; border-radius: 1rem; border: 1px solid #334155; text-align: center; max-width: 400px; box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.5); }
            .success { color: #34d399; font-weight: bold; font-size: 1.25rem; margin-bottom: 0.5rem; }
            .avatar { width: 64px; height: 64px; border-radius: 50%; border: 2px solid #34d399; margin: 0 auto 1rem; }
            .user { font-weight: 600; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="card">
            ${userData.avatar_url ? `<img class="avatar" src="${userData.avatar_url}" alt="${userData.login}" />` : ''}
            <div class="success">Connected to GitHub!</div>
            <div class="user">@${userData.login || 'cheyoung1983-sudo'}</div>
            <p style="font-size: 0.85rem; color: #64748b; margin-top: 1rem;">This window will close automatically...</p>
            <script>
              try {
                if (window.opener) {
                  window.opener.postMessage(${JSON.stringify(payload)}, '*');
                  setTimeout(() => window.close(), 1000);
                } else {
                  window.location.href = '/';
                }
              } catch (e) {
                console.error(e);
              }
            </script>
          </div>
        </body>
      </html>
    `);
  } catch (err: any) {
    console.error('GitHub OAuth Callback Error:', err);
    return htmlResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>OAuth Error</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .card { background: #1e293b; padding: 2rem; border-radius: 1rem; border: 1px solid #334155; text-align: center; max-width: 400px; }
            .error { color: #f87171; font-weight: bold; margin-bottom: 1rem; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="error">OAuth Token Exchange Failed</div>
            <p>${err.message || 'Unknown authentication failure'}</p>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_ERROR', error: ${JSON.stringify(err.message)} }, '*');
                setTimeout(() => window.close(), 3000);
              }
            </script>
          </div>
        </body>
      </html>
    `,
      500
    );
  }
}
