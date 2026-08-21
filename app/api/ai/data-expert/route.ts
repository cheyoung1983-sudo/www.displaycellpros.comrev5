import { NextRequest, NextResponse } from 'next/server';
import { aiRateLimiterNext, withTimeout } from '../../../../src/lib/serverSecurity.ts';
import { DataExpertQuerySchema } from '../../../../src/lib/schemas.ts';

export async function POST(req: NextRequest) {
  const limited = aiRateLimiterNext.check(req);
  if (limited) return limited;

  const { auth0 } = await import('../../../../src/lib/auth0Server.ts');
  const session = await auth0.getSession(req);
  if (!session?.user?.email) {
    return NextResponse.json(
      { success: false, error: 'Sign in required to use the Data Expert.' },
      { status: 401 }
    );
  }

  const { evaluateUserRbac } = await import('../../../../src/lib/auth0Rbac.ts');
  const rbac = evaluateUserRbac(session.user);
  const isTechnician = rbac.isSuperAdmin || rbac.hasDcpPermission;
  const callerEmail = session.user.email;

  const body = await req.json().catch(() => ({}));
  const parsed = DataExpertQuerySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message || 'A question is required.' },
      { status: 400 }
    );
  }

  try {
    const { createDataExpertAgent } = await import('../../../../src/lib/agents/dataExpertAgent.ts');
    const dataExpertAgent = createDataExpertAgent({ callerEmail, isTechnician });

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
