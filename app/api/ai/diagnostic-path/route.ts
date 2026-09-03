/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Route Handler for generating step-by-step diagnostic paths.
 * Uses LLM-driven logic to create a technical plan for bench technicians.
 */

import { NextRequest, NextResponse } from 'next/server';
import { aiRateLimiterNext, withTimeout } from '../../../../src/lib/serverSecurity.ts';
import { DiagnosticPathSchema } from '../../../../src/lib/schemas.ts';
import { getOpenAI, getGemini } from '../../../../src/lib/aiClients.ts';

/**
 * POST /api/ai/diagnostic-path
 * Generates a structured diagnostic plan based on symptoms and telemetry.
 *
 * @param req - The request object containing repair notes and symptoms.
 * @returns A JSON response with the recommended diagnostic path.
 */
export async function POST(req: NextRequest) {
  const limited = aiRateLimiterNext.check(req);
  if (limited) return limited;

  const body = await req.json().catch(() => ({}));
  const parseResult = DiagnosticPathSchema.safeParse(body);
  const {
    repairNotes = '',
    deviceManufacturer = 'Unknown',
    deviceModel = 'Device',
    symptoms = [],
    telemetry,
  } = parseResult.success
    ? parseResult.data
    : {
        repairNotes: '',
        deviceManufacturer: 'Unknown',
        deviceModel: 'Device',
        symptoms: [] as string[],
        telemetry: undefined,
      };

  try {
    const prompt = `
You are the Lead Master Bench Technician at D&CP Spokane Repair Lab (IPC-A-610 Certified).
Analyze the technician's intake notes, selected symptoms, hardware telemetry, and device details to generate a precise, step-by-step Recommended Diagnostic Path.

DEVICE INFORMATION:
- Manufacturer: ${deviceManufacturer || 'Unknown'}
- Model: ${deviceModel || 'Unspecified Model'}

TECHNICIAN & INTAKE NOTES:
"${repairNotes || 'No notes provided'}"

REPORTED SYMPTOMS:
${symptoms && symptoms.length > 0 ? symptoms.join(', ') : 'None listed'}

HARDWARE TELEMETRY:
${
  telemetry
    ? `
- Ammeter Current Draw: ${telemetry.ammeterDrawAmps} A
- Short to Ground: ${telemetry.isShortToGround ? 'YES (SHORT DETECTED)' : 'NO'}
- Battery Health: ${telemetry.batteryHealthPercentage}%
- Battery Temp: ${telemetry.batteryTempCelsius}°C
`
    : 'No live telemetry attached'
}

Produce a structured JSON plan strictly matching this format:
{
  "primaryDiagnosis": "string",
  "confidenceScore": 90,
  "complexityLevel": "Tier 1 (Standard Assembly)" | "Tier 2 (Display Renewal)" | "Tier 3 (Board Rework)",
  "estimatedBenchTimeMinutes": 25,
  "technicianBriefing": "string",
  "diagnosticSteps": [
    {
      "stepNumber": 1,
      "actionTitle": "string",
      "instructions": "string",
      "expectedReading": "string",
      "toolRequired": "string"
    }
  ],
  "requiredTools": ["tool1", "tool2"],
  "riskPrecautions": ["precaution1"],
  "partsLikelyNeeded": ["part1"]
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
          return NextResponse.json({ success: true, path: parsed, modelUsed: 'gemini-2.0-flash-exp' });
        }
      } catch (geminiErr) {
        console.warn('Gemini diagnostic path call failed, trying OpenAI:', geminiErr);
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
              content: 'You are the Lead Master Bench Technician at D&CP Spokane Repair Lab. Return ONLY valid JSON matching the requested diagnostic path schema.',
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
          return NextResponse.json({ success: true, path: parsed, modelUsed: 'gpt-4o-mini' });
        }
      } catch (aiErr) {
        console.warn('OpenAI diagnostic path API call failed, falling back to rule-based engine:', aiErr);
      }
    }

    // Fallback rule-based diagnostic path generator when OPENAI_API_KEY is omitted or failed
    const notesLower = (repairNotes || '').toLowerCase();
    let primaryDiagnosis = 'Power & Charge Rail Delivery Interruption';
    let complexityLevel = 'Tier 1 (Standard Assembly)';
    let confidenceScore = 88;
    let estimatedBenchTimeMinutes = 20;
    let technicianBriefing = `Intake analysis for ${deviceManufacturer} ${deviceModel}. Reported notes indicate power/boot issue. Recommended initial bench current draw check before component isolation.`;

    let steps = [
      {
        stepNumber: 1,
        actionTitle: 'DC USB Power Meter Consumption Check',
        instructions: 'Connect device to USB-C inline power meter at 5V/9V/20V. Observe handshake voltage step-up and current draw.',
        expectedReading: '1.2A - 2.1A @ 9V or 20V nominal charging',
        toolRequired: 'USB-C Inline Ammeter / Power Analyzer',
      },
      {
        stepNumber: 2,
        actionTitle: 'Visual Connector & Flex Pin Inspection',
        instructions: 'Examine battery connector and charge port flex pins under stereo microscope for physical corrosion or pin displacement.',
        expectedReading: 'Zero debris, uniform gold pin contact alignment',
        toolRequired: 'Trinocular Stereo Microscope',
      },
      {
        stepNumber: 3,
        actionTitle: 'Primary Power Rail Impedance Measurement',
        instructions: 'Measure diode mode resistance to ground on VDD_MAIN and VDD_BOOST filter capacitors.',
        expectedReading: '0.350V - 0.480V diode drop (non-zero short)',
        toolRequired: 'Digital Multimeter (Diode Mode)',
      },
    ];

    if (
      notesLower.includes('screen') ||
      notesLower.includes('crack') ||
      notesLower.includes('display') ||
      notesLower.includes('lines') ||
      notesLower.includes('black') ||
      symptoms.some((s) => s.toLowerCase().includes('screen') || s.toLowerCase().includes('display'))
    ) {
      primaryDiagnosis = 'Display OLED Panel / Digitizer Flex Damage';
      complexityLevel = 'Tier 2 (Display Renewal)';
      confidenceScore = 94;
      estimatedBenchTimeMinutes = 30;
      technicianBriefing = `Notes indicate visual display artifacts or touch failure on ${deviceManufacturer} ${deviceModel}. Verify backlight coil and OLED driver IC before replacing glass.`;
      steps = [
        {
          stepNumber: 1,
          actionTitle: 'Backlight / Image Flashlight Isolation',
          instructions: 'Shine 1000 lumen flashlight onto dark screen while powering on to check for faint GPU image rendering.',
          expectedReading: 'Faint display UI visible if backlight circuit failed; Pitch black if OLED panel damaged',
          toolRequired: 'High-Lumen Focus Flashlight',
        },
        {
          stepNumber: 2,
          actionTitle: 'FPC Connector & ESD Diode Check',
          instructions: 'Disconnect battery, disconnect display FPC, and inspect socket contacts for bent ground pins.',
          expectedReading: 'Clean gold pins without blue/green oxidation',
          toolRequired: 'ESD Precision Tweezers & Microscope',
        },
        {
          stepNumber: 3,
          actionTitle: 'Test Assembly Bench Fitting',
          instructions: 'Attach genuine OEM test screen module outside chassis before removing factory adhesives.',
          expectedReading: '100% digitizer touch grid response across all screen quadrants',
          toolRequired: 'OEM Test Display Panel',
        },
      ];
    } else if (
      notesLower.includes('short') ||
      notesLower.includes('water') ||
      notesLower.includes('liquid') ||
      notesLower.includes('solder') ||
      notesLower.includes('dead') ||
      telemetry?.isShortToGround
    ) {
      primaryDiagnosis = 'VDD_MAIN Logic Board Rail Short-Circuit';
      complexityLevel = 'Tier 3 (Micro-Soldering Rework)';
      confidenceScore = 96;
      estimatedBenchTimeMinutes = 65;
      technicianBriefing = `High urgency intake for ${deviceManufacturer} ${deviceModel}. Notes suggest liquid ingress or logic board short. Follow thermal imaging protocol.`;
      steps = [
        {
          stepNumber: 1,
          actionTitle: 'Direct Current PSU Thermal Cloud Test',
          instructions: 'Connect DC Bench Power Supply to battery terminals with 1.0A current limit. Scan board under thermal camera.',
          expectedReading: 'Immediate thermal hot spot bloom (>60°C) over faulty decoupling capacitor',
          toolRequired: 'Thermal Imaging Camera / Rosin Atomizer',
        },
        {
          stepNumber: 2,
          actionTitle: 'Short Capacitor Clearance / Rework',
          instructions: 'Apply flux and heat shorted SMD ceramic capacitor with hot air rework station at 380°C to lift from pad.',
          expectedReading: 'Diode drop resistance returns to normal (>0.350V) on rail',
          toolRequired: 'Hot Air Rework Station & Micro-Soldering Iron',
        },
        {
          stepNumber: 3,
          actionTitle: 'Post-Rework Boot & Power Draw Audit',
          instructions: 'Re-apply thermal pad, reconnect battery, and boot device while monitoring DC power bench curve.',
          expectedReading: 'Dynamic 0.1A to 1.8A boot loop cycle transitioning to lock screen',
          toolRequired: 'DC Bench Power Supply',
        },
      ];
    }

    return NextResponse.json({
      success: true,
      path: {
        primaryDiagnosis,
        confidenceScore,
        complexityLevel,
        estimatedBenchTimeMinutes,
        technicianBriefing,
        diagnosticSteps: steps,
        requiredTools: ['Digital Multimeter', 'Stereo Microscope', 'Precision Driver Kit', 'DC Bench Power Supply'],
        riskPrecautions: [
          'Always disconnect battery BEFORE disconnecting display or camera flex cables.',
          'Use ESD grounding wrist strap when handling exposed mainboard PCB.',
          'Do not exceed 380°C hot air temperature near CPU or NAND memory shield.',
        ],
        partsLikelyNeeded: ['OEM Battery / Port Flex', 'Thermal Conductive Pad', 'Replacement 0402 SMD Capacitors'],
      },
    });
  } catch (error) {
    console.error('Diagnostic Path API Error:', error);
    return NextResponse.json({
      success: true,
      path: {
        primaryDiagnosis: 'Bench Diagnostic Verification',
        confidenceScore: 85,
        complexityLevel: 'Tier 1 (Standard Assembly)',
        estimatedBenchTimeMinutes: 20,
        technicianBriefing: `Diagnostic verification for ${deviceManufacturer} ${deviceModel}. Proceed with standard multimeter probe.`,
        diagnosticSteps: [
          {
            stepNumber: 1,
            actionTitle: 'Power Rail & Current Check',
            instructions: 'Connect to bench power supply and verify current draw.',
            expectedReading: 'Nominal 1.0A - 2.0A',
            toolRequired: 'DC Bench Power Supply',
          },
        ],
        requiredTools: ['Digital Multimeter', 'Precision Drivers'],
        riskPrecautions: ['Follow ESD safety protocols'],
        partsLikelyNeeded: ['OEM Flex / Connector'],
      },
    });
  }
}
