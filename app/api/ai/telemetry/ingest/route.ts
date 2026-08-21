import { NextRequest, NextResponse } from 'next/server';
import { aiRateLimiterNext } from '../../../../../src/lib/serverSecurity.ts';
import { TelemetryIngestSchema } from '../../../../../src/lib/schemas.ts';
import { isThermalLockoutTriggered, triangulateFaults } from '../../../../../src/lib/faultTriangulation.ts';

/**
 * POST /api/ai/telemetry/ingest
 *
 * Server-side half of the telemetry pipeline: persists a reading, runs
 * deterministic fault triangulation, and reports whether the 45C thermal
 * lockout threshold was crossed.
 *
 * IMPORTANT: this route only evaluates the lockout condition — it does not
 * and cannot cut power itself. The client holding the WebUSB/WebSerial
 * connection is responsible for aborting its read loop (AbortController) and
 * issuing the hardware kill-signal to cut VBUS the moment `lockout: true`
 * comes back. That client-side hardware loop has not been verified against
 * physical bench equipment from this session.
 */
export async function POST(req: NextRequest) {
  const limited = aiRateLimiterNext.check(req);
  if (limited) return limited;

  const body = await req.json().catch(() => ({}));
  const parsed = TelemetryIngestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message || 'Invalid telemetry reading.' },
      { status: 400 }
    );
  }

  const { deviceId, vTerm, currentDraw, thermalReading } = parsed.data;
  const lockout = isThermalLockoutTriggered(thermalReading);

  try {
    const { query } = await import('../../../../../src/lib/serverDb.ts');

    await query(
      `INSERT INTO telemetry_logs (device_id, v_term, current_draw, thermal_reading) VALUES ($1, $2, $3, $4)`,
      [deviceId, vTerm, currentDraw, thermalReading]
    );

    if (lockout) {
      await query(
        `INSERT INTO incident_tracking (device_id, v_term_at_lockout, draw_at_lockout, thermal_reading, reason)
         VALUES ($1, $2, $3, $4, 'thermal_lockout')`,
        [deviceId, vTerm, currentDraw, thermalReading]
      );
      return NextResponse.json({
        success: true,
        lockout: true,
        reason: 'thermal_lockout',
        message: `Thermal reading ${thermalReading}C exceeds the 45C safety threshold. Abort the diagnostic loop and cut VBUS immediately.`,
      });
    }

    const faults = triangulateFaults({ deviceId, vTerm, currentDraw, thermalReading });
    for (const fault of faults) {
      await query(
        `INSERT INTO fault_records (device_id, fault_code, logic_chain, is_isolated) VALUES ($1, $2, $3, $4)`,
        [deviceId, fault.faultCode, JSON.stringify(fault.logicChain), fault.isIsolated]
      );
    }

    return NextResponse.json({ success: true, lockout: false, faults });
  } catch (error: any) {
    console.error('Telemetry ingestion failed:', error);
    return NextResponse.json(
      { success: false, error: 'Telemetry ingestion failed.' },
      { status: 500 }
    );
  }
}
