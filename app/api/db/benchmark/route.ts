import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { query, queryReadOnly, getPoolMetrics } = await import('../../../../src/lib/serverDb.ts');

    const startPrimary = Date.now();
    let primaryLatency = -1;
    let roLatency = -1;

    try {
      await query('SELECT 1 as ping', []);
      primaryLatency = Date.now() - startPrimary;
    } catch {
      primaryLatency = -1;
    }

    const startRO = Date.now();
    try {
      await queryReadOnly('SELECT 1 as ping', []);
      roLatency = Date.now() - startRO;
    } catch {
      roLatency = -1;
    }

    return NextResponse.json({
      status: 'ok',
      benchmarkTimestamp: new Date().toISOString(),
      primaryCluster: {
        latencyMs: primaryLatency,
        status: primaryLatency >= 0 ? 'online' : 'unreachable',
      },
      readOnlyReplica: {
        latencyMs: roLatency,
        status: roLatency >= 0 ? 'online' : 'unreachable',
      },
      poolMetrics: getPoolMetrics(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message || 'Error executing database benchmark' },
      { status: 500 }
    );
  }
}
