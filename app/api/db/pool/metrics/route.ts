import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { getPoolMetrics } = await import('../../../../../src/lib/serverDb.ts');
    return NextResponse.json(getPoolMetrics());
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message || 'Error fetching pool metrics' },
      { status: 500 }
    );
  }
}
