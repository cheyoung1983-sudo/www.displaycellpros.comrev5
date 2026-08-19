import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { query, getPoolMetrics } = await import('../../../../src/lib/serverDb.ts');
    const result = await query('SELECT NOW() as now, version() as version', []);
    return NextResponse.json({
      status: 'ok',
      timestamp: result.rows[0]?.now,
      version: result.rows[0]?.version,
      database: process.env.PGDATABASE || 'postgres',
      host: process.env.PGHOST || 'dcp-production-db.cluster-cs7wcksg2js1.us-east-1.rds.amazonaws.com',
      poolMetrics: getPoolMetrics(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message || 'Database connection error' },
      { status: 500 }
    );
  }
}
