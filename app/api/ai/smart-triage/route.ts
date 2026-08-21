/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Route Handler for preliminary "Smart Triage" of hardware issues.
 * Provides quick fault categorization and DIY advice for customers or intake staff.
 */

import { NextRequest, NextResponse } from 'next/server';
import { aiRateLimiterNext, triageCache, withTimeout } from '../../../../src/lib/serverSecurity.ts';
import { SmartTriageSchema } from '../../../../src/lib/schemas.ts';
import { getOpenAI, getGemini } from '../../../../src/lib/aiClients.ts';

/**
 * POST /api/ai/smart-triage
 * Categorizes a hardware issue and suggests initial troubleshooting steps.
 *
 * @param req - The request object containing the device model and symptom description.
 * @returns A JSON response with the triage assessment.
 */
export async function POST(req: NextRequest) {
  const limited = aiRateLimiterNext.check(req);
  if (limited) return limited;

  const body = await req.json().catch(() => ({}));
  const parseResult = SmartTriageSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { success: false, error: parseResult.error.issues[0]?.message || 'Invalid triage input' },
      { status: 400 }
    );
  }

  const { deviceModel, symptomDescription, retrievedContext } = parseResult.data;
  const cacheKey = `triage_${deviceModel}_${symptomDescription.trim().toLowerCase()}`;
  const cachedTriage = triageCache.get(cacheKey);
  if (cachedTriage) {
    return NextResponse.json({ success: true, triage: cachedTriage, cached: true });
  }

  try {
    const knowledgeBaseSection = retrievedContext && retrievedContext.length > 0
      ? `\nRETRIEVED KNOWLEDGE BASE CONTEXT (from the on-file device/repair database, ranked by relevance to this query):\n${retrievedContext.map((c, i) => `${i + 1}. ${c}`).join('\n')}\nGround your diagnosis in this context when it matches the reported symptoms; do not invent device-specific facts that contradict it.\n`
      : '';

    const prompt = `
You are the Lead Hardware Triage Specialist at D&CP Spokane Lab.
Analyze the user's reported device symptoms and model to suggest likely issue categories, service tier, confidence score, and initial DIY troubleshooting steps.

Device Model: "${deviceModel || 'Unspecified Mobile/Computer Unit'}"
Symptom Description: "${symptomDescription}"
${knowledgeBaseSection}
Return ONLY a valid JSON object matching this schema (no markdown code fences):
{
  "suspectedFault": "Brief title of primary suspected fault",
  "recommendedTier": "TIER_1_POWER_PORT_REFRESH" | "TIER_2_DISPLAY_RENEWAL" | "TIER_3_MICRO_SOLDERING",
  "recommendedTierLabel": "Tier 1 (Power/Port Refresh)" | "Tier 2 (Display Renewal)" | "Tier 3 (Board Rework)",
  "confidenceScore": 88,
  "summary": "2-3 sentence technical diagnosis explaining why this fault is suspected and what bench tests will verify it.",
  "diyInitialSteps": [
    "Step 1: First non-destructive troubleshooting action",
    "Step 2: Second diagnostic check",
    "Step 3: Pre-intake safety precaution"
  ],
  "technicianChecklistAdvice": [
    "Checklist item 1 to inspect",
    "Checklist item 2 to measure"
  ]
}
          `;

    const gemini = getGemini();
    if (gemini) {
      try {
        const response = await withTimeout(
          gemini.models.generateContent({
            model: 'gemini-2.0-flash-exp',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
              responseMimeType: 'application/json',
            },
          }),
          6000,
          null
        );

        const replyText = response?.text;
        if (replyText) {
          const parsed = JSON.parse(replyText);
          triageCache.set(cacheKey, parsed);
          return NextResponse.json({ success: true, triage: parsed, modelUsed: 'gemini-2.0-flash-exp' });
        }
      } catch (geminiErr) {
        console.warn('Gemini smart-triage call failed, trying OpenAI:', geminiErr);
      }
    }

    const openai = getOpenAI();
    if (openai) {
      try {
        const aiPromise = openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are the Lead Hardware Triage Specialist at D&CP Spokane Lab. Output ONLY valid JSON matching the requested structure.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.2,
        });

        const response = await withTimeout(aiPromise, 6000, null);
        const replyText = (response as any)?.choices?.[0]?.message?.content;

        if (replyText) {
          const parsed = JSON.parse(replyText);
          triageCache.set(cacheKey, parsed);
          return NextResponse.json({ success: true, triage: parsed, modelUsed: 'gpt-4o-mini' });
        }
      } catch (aiErr) {
        console.warn('OpenAI smart-triage call failed, falling back to rule-based triage:', aiErr);
      }
    }

    // Fallback rule-based smart triage if OPENAI_API_KEY is not set or API failed
    const descLower = (symptomDescription || '').toLowerCase();
    let suspectedFault = 'Power Rail & Charge IC Interruption';
    let recommendedTier = 'TIER_1_POWER_PORT_REFRESH';
    let recommendedTierLabel = 'Tier 1 (Power/Port Refresh)';
    let confidenceScore = 85;
    let summary =
      'Analysis indicates power delivery or port contact impedance issue. Recommended bench current measurement to verify USB-C negotiation.';
    let diyInitialSteps = [
      'Power cycle the device while holding Force Reset keys for 15 seconds.',
      'Inspect the charge port under bright light for compressed lint or debris.',
      'Try an official high-wattage power adapter and cable.',
    ];
    let technicianChecklistAdvice = [
      'Verify DC Ammeter current draw under 5V and 20V negotiation.',
      'Test battery internal resistance and fuel gauge IC telemetry.',
    ];

    if (
      descLower.includes('screen') ||
      descLower.includes('display') ||
      descLower.includes('crack') ||
      descLower.includes('touch') ||
      descLower.includes('lines') ||
      descLower.includes('black')
    ) {
      suspectedFault = 'Display Digitizer & OLED Matrix Fault';
      recommendedTier = 'TIER_2_DISPLAY_RENEWAL';
      recommendedTierLabel = 'Tier 2 (Display Renewal)';
      confidenceScore = 92;
      summary =
        'Reported symptoms match display assembly or digitizer layer failure. Requires OEM glass replacement and touch grid recalibration.';
      diyInitialSteps = [
        'Check if the device still vibrates or emits sound when toggling mute or plugging into power.',
        'Shine a bright flashlight on the display to check if faint image is visible (backlight coil failure vs screen).',
        'Ensure no liquid or heavy pressure was applied recently.',
      ];
      technicianChecklistAdvice = [
        'Inspect FPC display connector pins for corrosion or bent pins.',
        'Test new OEM display assembly before final adhesive sealing.',
      ];
    } else if (
      descLower.includes('short') ||
      descLower.includes('water') ||
      descLower.includes('liquid') ||
      descLower.includes('heat') ||
      descLower.includes('dead') ||
      descLower.includes('solder') ||
      descLower.includes('bootloop')
    ) {
      suspectedFault = 'VDD_MAIN Logic Board Short / Component Short';
      recommendedTier = 'TIER_3_MICRO_SOLDERING';
      recommendedTierLabel = 'Tier 3 (Logic Board Rework)';
      confidenceScore = 94;
      summary =
        'Symptoms strongly suggest a primary rail short to ground (VDD_MAIN / VDD_BOOST). Requires thermal inspection, rosin cloud mapping, and micro-soldering BGA replacement.';
      diyInitialSteps = [
        'Do NOT attempt to plug the device into a charger to prevent copper trace delamination.',
        'If exposed to liquid, keep the device in an airtight container with desiccant gel.',
        'Backup any cloud-synced data if temporary power was active.',
      ];
      technicianChecklistAdvice = [
        'Connect to DC Bench Power Supply and observe short-circuit current draw.',
        'Apply Rosin flux / Thermal camera to identify blooming capacitor or PMIC.',
      ];
    }

    const triageResult = {
      suspectedFault,
      recommendedTier,
      recommendedTierLabel,
      confidenceScore,
      summary,
      diyInitialSteps,
      technicianChecklistAdvice,
    };

    triageCache.set(cacheKey, triageResult);
    return NextResponse.json({
      success: true,
      triage: triageResult,
    });
  } catch (error) {
    console.error('Smart Triage Error:', error);
    return NextResponse.json({
      success: true,
      triage: {
        suspectedFault: 'Hardware Diagnostic Required',
        recommendedTier: 'TIER_1_POWER_PORT_REFRESH',
        recommendedTierLabel: 'Tier 1 (Standard Triage)',
        confidenceScore: 80,
        summary: 'Intake registered for bench testing and hardware telemetry scan.',
        diyInitialSteps: ['Perform clean restart', 'Inspect ports for debris'],
        technicianChecklistAdvice: ['Measure DC ammeter load', 'Check battery health'],
      },
    });
  }
}
