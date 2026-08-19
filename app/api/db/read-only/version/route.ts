import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { queryReadOnly } = await import('../../../../../src/lib/serverDb.ts');
    const result = await queryReadOnly('SELECT version() as version', []);
    return NextResponse.json({
      status: 'ok',
      version: result.rows[0]?.version,
      host: process.env.PGHOST_READ_ONLY || 'dcp-production-db.cluster-ro-cs7wcksg2js1.us-east-1.rds.amazonaws.com',
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message || 'Read-only database query error' },
      { status: 500 }
    );
  }
}
