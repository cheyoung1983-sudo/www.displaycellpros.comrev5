import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const { runCoreDataMigration } = await import('../../../../../src/lib/serverDb.ts');
    const result = await runCoreDataMigration();
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
    const { runCoreDataMigration, CORE_DATA_MIGRATION_SQL } = await import(
      '../../../../../src/lib/serverDb.ts'
    );
    const result = await runCoreDataMigration();
    return NextResponse.json({
      status: 'ok',
      sql: CORE_DATA_MIGRATION_SQL,
      ...result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message || 'Migration verification failed' },
      { status: 500 }
    );
  }
}
