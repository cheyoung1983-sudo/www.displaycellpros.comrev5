import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { query } = await import('../../../../src/lib/serverDb.ts');
    const result = await query('SELECT * FROM comments ORDER BY id DESC LIMIT 50', []);
    return NextResponse.json({ status: 'ok', comments: result.rows });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message || 'Database query error' },
      { status: 500 }
    );
  }
}
