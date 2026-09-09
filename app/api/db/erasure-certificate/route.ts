import { NextRequest, NextResponse } from 'next/server';
import { formRateLimiterNext } from '../../../../src/lib/serverSecurity.ts';
import { ErasureCertificateRequestSchema } from '../../../../src/lib/schemas.ts';

export async function POST(req: NextRequest) {
  const limited = formRateLimiterNext.check(req);
  if (limited) return limited;

  const body = await req.json().catch(() => ({}));
  const parsed = ErasureCertificateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message || 'Invalid erasure certificate request.' },
      { status: 400 }
    );
  }

  try {
    const { issueErasureCertificate } = await import('../../../../src/lib/erasureCertificate.ts');
    const cert = await issueErasureCertificate(parsed.data.deviceIdentifier, parsed.data.sanitizationType);
    return NextResponse.json({ success: true, certificate: cert });
  } catch (error: any) {
    console.error('Erasure certificate issuance failed:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Could not issue erasure certificate.' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const deviceIdentifier = req.nextUrl.searchParams.get('deviceIdentifier') || '';
  const sanitizationType = req.nextUrl.searchParams.get('sanitizationType') as 'Clear' | 'Purge' | null;
  const completedAt = req.nextUrl.searchParams.get('completedAt') || '';
  const hmacSignature = req.nextUrl.searchParams.get('hmacSignature') || '';

  if (!deviceIdentifier || !sanitizationType || !completedAt || !hmacSignature) {
    return NextResponse.json(
      { success: false, error: 'deviceIdentifier, sanitizationType, completedAt, and hmacSignature are all required to verify.' },
      { status: 400 }
    );
  }

  try {
    const { verifyErasureCertificate } = await import('../../../../src/lib/erasureCertificate.ts');
    const valid = verifyErasureCertificate(deviceIdentifier, sanitizationType, completedAt, hmacSignature);
    return NextResponse.json({ success: true, valid });
  } catch (error: any) {
    console.error('Erasure certificate verification failed:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Could not verify erasure certificate.' },
      { status: 500 }
    );
  }
}
