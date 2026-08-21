import { NextRequest, NextResponse } from 'next/server';
import { aiRateLimiterNext, withTimeout } from '../../../../src/lib/serverSecurity.ts';
import { DataExpertQuerySchema } from '../../../../src/lib/schemas.ts';

export async function POST(req: NextRequest) {
  const limited = aiRateLimiterNext.check(req);
  if (limited) return limited;

  const body = await req.json().catch(() => ({}));
  const parsed = DataExpertQuerySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message || 'A question is required.' },
      { status: 400 }
    );
  }

  try {
    const { dataExpertAgent } = await import('../../../../src/lib/agents/dataExpertAgent.ts');
    const result = await withTimeout(
      dataExpertAgent.generate({ prompt: parsed.data.question }),
      20000,
      null
    );

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'The Data Expert timed out. Please try again.' },
        { status: 504 }
      );
    }

    return NextResponse.json({ success: true, answer: result.text, steps: result.steps.length });
  } catch (error: any) {
    console.error('Data Expert agent error:', error);
    return NextResponse.json(
      { success: false, error: 'The Data Expert could not answer that right now.' },
      { status: 502 }
    );
  }
}
