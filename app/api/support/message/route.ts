import { NextRequest, NextResponse } from 'next/server';
import { formRateLimiterNext } from '../../../../src/lib/serverSecurity.ts';
import { SupportMessageSchema } from '../../../../src/lib/schemas.ts';

export async function POST(req: NextRequest) {
  const limited = formRateLimiterNext.check(req);
  if (limited) return limited;

  const body = await req.json().catch(() => ({}));
  const parseResult = SupportMessageSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { success: false, error: parseResult.error.issues[0]?.message || 'All fields are required and must be valid.' },
      { status: 400 }
    );
  }

  const { name, email, subject, message } = parseResult.data;
  console.log('Support message received:', { name, email, subject, messageLength: message.length });

  return NextResponse.json({
    success: true,
    messageId: `msg_${Math.random().toString(36).substring(2, 11)}`,
    status: 'Queued for Lab Review',
  });
}
