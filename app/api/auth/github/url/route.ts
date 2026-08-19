import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const clientId = process.env.GITHUB_CLIENT_ID || 'Ov23lifKkuO7pQzIVrlG';
  const redirectUri =
    req.nextUrl.searchParams.get('redirect_uri') ||
    (process.env.APP_URL
      ? `${process.env.APP_URL}/auth/github/callback`
      : `${req.nextUrl.origin}/auth/github/callback`);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'read:user user:email repo',
    allow_signup: 'true',
  });

  const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;
  return NextResponse.json({ url: authUrl, redirectUri });
}
