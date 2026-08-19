import { NextRequest, NextResponse } from 'next/server';
import { getToken, getTokenResponse } from '@vercel/connect';
import { VERCEL_CONNECT_RESOURCE, handleVercelConnectError } from '../../../../../src/utils/vercelConnect.ts';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      subjectType = 'app',
      userId = 'usr_123',
      scopes = ['openid', 'email', 'profile', 'offline_access'],
      externalSubject = 'external-subject-123',
      fullResponse = false,
    } = body || {};

    let params: any = { subject: { type: 'app' } };
    if (subjectType === 'user') {
      params = { subject: { type: 'user', id: userId }, scopes };
    } else if (subjectType === 'jwt-bearer') {
      params = { subject: { type: 'jwt-bearer', sub: externalSubject }, scopes };
    }

    if (fullResponse) {
      const response = await getTokenResponse(VERCEL_CONNECT_RESOURCE, params);
      return NextResponse.json({ status: 'ok', resource: VERCEL_CONNECT_RESOURCE, data: response });
    }

    const token = await getToken(VERCEL_CONNECT_RESOURCE, params);
    return NextResponse.json({ status: 'ok', resource: VERCEL_CONNECT_RESOURCE, token });
  } catch (error: any) {
    const handled = handleVercelConnectError(error);
    return NextResponse.json(
      { status: 'error', resource: VERCEL_CONNECT_RESOURCE, ...handled },
      { status: 500 }
    );
  }
}
