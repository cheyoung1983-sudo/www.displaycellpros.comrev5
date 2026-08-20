import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { query } = await import('../../../../src/lib/serverDb.ts');
    const result = await query('SELECT version() as version', []);
    return NextResponse.json({ status: 'ok', version: result.rows[0]?.version });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message || 'Database query error' },
      { status: 500 }
    );
  }
}
