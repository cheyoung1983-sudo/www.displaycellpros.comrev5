// Deterministic fault triangulation over telemetry readings. Mirrors the
// backlight/Tristar/VDD_MAIN failure modes in hardwareFailureKnowledge.ts.
// This is pure signal-threshold logic, not an LLM call — it runs on every
// ingested telemetry sample and only writes a fault_records row when a
// threshold is actually crossed.

export const THERMAL_LOCKOUT_THRESHOLD_C = 45;

export interface TelemetryReading {
  deviceId: string;
  vTerm: number;
  currentDraw: number;
  thermalReading: number;
}

export interface TriangulatedFault {
  faultCode: string;
  logicChain: Record<string, unknown>;
  isIsolated: boolean;
}

export function isThermalLockoutTriggered(thermalReading: number): boolean {
  return thermalReading >= THERMAL_LOCKOUT_THRESHOLD_C;
}

/**
 * Runs deterministic threshold checks against a telemetry reading. Returns
 * zero or more triangulated faults — this never calls a model, so it has no
 * hallucination risk, but the thresholds themselves are heuristics and are
 * not a substitute for bench diode-mode verification.
 */
export function triangulateFaults(reading: TelemetryReading): TriangulatedFault[] {
  const faults: TriangulatedFault[] = [];

  // VDD_MAIN short-circuit: elevated current draw on the primary rail facing
  // the charger, per the "Never the Coil" / VDD_MAIN triage sequence.
  if (reading.currentDraw > 5.0) {
    faults.push({
      faultCode: 'VDD_MAIN_SHORT',
      logicChain: {
        signal: 'currentDraw',
        value: reading.currentDraw,
        threshold: 5.0,
        note: 'High draw on primary power rail facing the charger — isolate VDD_MAIN short per bench triage sequence before assuming logic-gate failure.',
      },
      isIsolated: false,
    });
  }

  // Tristar/U2 handshake failure ("fake charging"): UI reports a charging
  // state but current draw is ~0 on a nominal-voltage rail.
  if (reading.vTerm >= 4.5 && reading.vTerm <= 5.5 && reading.currentDraw <= 0.05) {
    faults.push({
      faultCode: 'TRISTAR_U2_HANDSHAKE_FAIL',
      logicChain: {
        signal: 'vTerm+currentDraw',
        vTerm: reading.vTerm,
        currentDraw: reading.currentDraw,
        note: '~0.00A draw on a ~5V rail despite an apparent charging state — handshake failure between the charging IC and negotiator chip, not a dead battery.',
      },
      isIsolated: false,
    });
  }

  return faults;
}
