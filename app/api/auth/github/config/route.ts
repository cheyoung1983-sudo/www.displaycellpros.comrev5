import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.GITHUB_CLIENT_ID || 'Ov23lifKkuO7pQzIVrlG';
  const hasSecret = Boolean(process.env.GITHUB_CLIENT_SECRET);
  return NextResponse.json({
    status: 'ok',
    configured: hasSecret && Boolean(clientId),
    clientId,
    appName: 'Dcp',
    owner: 'cheyoung1983-sudo',
    scope: 'read:user user:email repo',
  });
}
