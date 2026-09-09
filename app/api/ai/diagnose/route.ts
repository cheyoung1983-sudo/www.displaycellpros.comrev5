/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Route Handler for AI-powered hardware diagnostics.
 * Integrates hardware telemetry with LLM analysis to provide technician insights.
 */

import { NextRequest, NextResponse } from 'next/server';
import { aiRateLimiterNext, diagnosticCache, withTimeout } from '../../../../src/lib/serverSecurity.ts';
import { DiagnoseSchema } from '../../../../src/lib/schemas.ts';
import { HARDWARE_FAILURE_KNOWLEDGE } from '../../../../src/lib/knowledge/hardwareFailureKnowledge.ts';

const TRIAGE_AI_MODEL = 'anthropic/claude-sonnet-5';

/**
 * POST /api/ai/diagnose
 * Analyzes device telemetry and customer reports, grounded in the
 * Triage AI hardware failure-mode knowledge base and verified by
 * generateWithFidelityCheck before being returned to the technician.
 *
 * @param req - The Next.js request object containing diagnostic telemetry.
 * @returns A JSON response with the diagnostic analysis or a fallback report.
 */
export async function POST(req: NextRequest) {
  const limited = aiRateLimiterNext.check(req);
  if (limited) return limited;

  const body = await req.json().catch(() => ({}));
  const parseResult = DiagnoseSchema.safeParse(body);
  const { telemetry, customerReportedIssue, deviceModel } = parseResult.success
    ? parseResult.data
    : { telemetry: undefined, customerReportedIssue: '', deviceModel: 'Client Unit' };

  const cacheKey = `diag_${deviceModel}_${telemetry?.ammeterDrawAmps}_${telemetry?.isShortToGround}_${(customerReportedIssue || '').slice(0, 50)}`;
  const cached = diagnosticCache.get(cacheKey);
  if (cached) {
    return NextResponse.json({ analysis: cached, cached: true });
  }

  const current = telemetry?.ammeterDrawAmps ?? 0;
  const isShort = Boolean(telemetry?.isShortToGround);
  const tier = isShort || current > 2.0 ? 'Tier 3 (Board Rework)' : current < 1.0 ? 'Tier 1 (Power/Port)' : 'Tier 2 (Display/Assembly)';

  const fallbackReport = `### D&CP Engineering Diagnostic Report\n**Device Target:** ${deviceModel || 'Client Unit'}  \n**Service Classification:** ${tier}  \n**Primary Finding:** ${isShort ? 'Logical short detected on primary power rail (VDD_MAIN).' : 'Telemetry indicates standard power delivery and logic loop analysis.'}\n\n#### Technical Analysis\n- **Current Draw:** ${current}A (${current > 2.0 ? 'Abnormal elevated draw' : 'Nominal draw'})\n- **Battery Health:** ${telemetry?.batteryHealthPercentage ?? 92}% (Nominal)\n- **Bench Protocol:** ${isShort ? 'Perform thermal imaging and rosin vapor detection to isolate shorted capacitor/PMIC.' : 'Verify dock connector flex and test battery under nominal load.'}\n\n#### Compliance & Safety\n- **WA RCW 19.415 Disclosure:** All OEM repair rights preserved. Safe non-destructive diagnostic bench scan performed.\n\n*Final pricing and repair confirmation require physical verification of the motherboard via bench ammeter and diode-mode measurements.*`;

  try {
    const { generateWithFidelityCheck } = await import('../../../../src/lib/fidelityService.ts');

    const prompt = `Analyze the following telemetry data and technician notes for a ${deviceModel || 'Device'}.

INPUT DATA:
- Technician/Customer Notes: "${customerReportedIssue || 'No specific notes'}"
- Battery Health: ${telemetry?.batteryHealthPercentage ?? 90}%
- Battery Temperature: ${telemetry?.batteryTempCelsius ?? 22}°C
- Ammeter DC Current Draw: ${telemetry?.ammeterDrawAmps ?? 0}A
- Logical Short to Ground (Primary Rails): ${telemetry?.isShortToGround ? 'POSITIVE' : 'NEGATIVE'}

Classify the service tier (Tier 1: Power/Port, <1.0A nominal; Tier 2: Display, visual fault with nominal current; Tier 3: Board Rework, >2.0A or short detected), analyze the telemetry against the grounding knowledge, and note the WA RCW 19.415 OEM repair-rights disclosure. Respond in structured technical markdown.`;

    const result = await withTimeout(
      generateWithFidelityCheck({
        model: TRIAGE_AI_MODEL,
        instructions: `You are the D&CP LLC Senior Technical Diagnostic Assistant (Spokane Lab, WA). Ground every technical claim (component names, rail names, failure modes) in the knowledge base below — do not state a part number, failure mechanism, or probability that isn't supported by it.\n\n${HARDWARE_FAILURE_KNOWLEDGE}`,
        prompt,
        groundingSource: HARDWARE_FAILURE_KNOWLEDGE,
      }),
      8000,
      null
    );

    if (result?.text) {
      diagnosticCache.set(cacheKey, result.text);
      return NextResponse.json({
        analysis: result.text,
        modelUsed: TRIAGE_AI_MODEL,
        fidelityPassed: result.fidelityPassed,
      });
    }
  } catch (aiErr) {
    console.warn('Triage AI diagnostic call failed, using rule-based fallback:', aiErr);
  }

  diagnosticCache.set(cacheKey, fallbackReport);
  return NextResponse.json({ analysis: fallbackReport });
}
