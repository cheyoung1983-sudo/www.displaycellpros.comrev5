import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const { runSupportedDevicesIndexMigration } = await import('../../../../../src/lib/serverDb.ts');
    const result = await runSupportedDevicesIndexMigration();
    return NextResponse.json({ status: 'ok', ...result });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message || 'Migration execution failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { runSupportedDevicesIndexMigration, SUPPORTED_DEVICES_INDEX_MIGRATION_SQL } = await import(
      '../../../../../src/lib/serverDb.ts'
    );
    const result = await runSupportedDevicesIndexMigration();
    return NextResponse.json({
      status: 'ok',
      sql: SUPPORTED_DEVICES_INDEX_MIGRATION_SQL,
      ...result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message || 'Migration verification failed' },
      { status: 500 }
    );
  }
}
