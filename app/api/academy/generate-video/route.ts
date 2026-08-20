import { NextRequest, NextResponse } from 'next/server';
import { aiRateLimiterNext, videoGuideCache, withTimeout } from '../../../../src/lib/serverSecurity.ts';
import { AcademyVideoSchema } from '../../../../src/lib/schemas.ts';
import { getOpenAI } from '../../../../src/lib/aiClients.ts';

export async function POST(req: NextRequest) {
  const limited = aiRateLimiterNext.check(req);
  if (limited) return limited;

  const body = await req.json().catch(() => ({}));
  const parseResult = AcademyVideoSchema.safeParse(body);
  const { topic = 'General Electronics Maintenance' } = parseResult.success ? parseResult.data : { topic: 'General Electronics Maintenance' };

  const cacheKey = `video_${topic.trim().toLowerCase()}`;
  const cachedVideo = videoGuideCache.get(cacheKey);
  if (cachedVideo) {
    return NextResponse.json({ success: true, video: cachedVideo, cached: true });
  }

  try {
    const openai = getOpenAI();
    if (openai) {
      try {
        const prompt = `
You are the Master Educational Director at D&CP Spokane Repair Academy.
Generate a structured, step-by-step video tutorial script and scene specification for a short DIY electronics repair tutorial on: "${topic}".

Return ONLY a valid JSON object strictly matching this format without markdown code blocks:
{
  "id": "vid-custom-1",
  "title": "Title of Tutorial",
  "category": "Display",
  "difficulty": "Beginner",
  "estimatedTime": "2 mins",
  "description": "Short 1-2 sentence overview of the tutorial.",
  "requiredTools": ["Tool 1", "Tool 2"],
  "safetyWarnings": ["Warning 1", "Warning 2"],
  "scenes": [
    {
      "stepNumber": 1,
      "title": "Scene Title",
      "narration": "Exact spoken voiceover narration script for this step.",
      "durationSeconds": 6,
      "visualPrompt": "Detailed visual description of the bench demonstration.",
      "graphicType": "warning",
      "highlightRegion": { "x": 50, "y": 50, "label": "Key Component" },
      "actionTip": "Pro technician tip for executing this step safely."
    }
  ]
}
Generate exactly 4-5 well-thought-out scenes.
          `;

        const aiPromise = openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are the Master Educational Director at D&CP Spokane Repair Academy. Return ONLY a valid JSON object strictly matching the tutorial schema.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3,
        });

        const response = await withTimeout(aiPromise, 6000, null);
        const replyText = (response as any)?.choices?.[0]?.message?.content;

        if (replyText) {
          const parsed = JSON.parse(replyText);
          videoGuideCache.set(cacheKey, parsed);
          return NextResponse.json({ success: true, video: parsed });
        }
      } catch (aiErr) {
        console.warn('OpenAI video generation failed, falling back to rule-based video generator:', aiErr);
      }
    }

    // Fallback AI video tutorial response if OPENAI_API_KEY is absent or failed
    const topicLower = topic.toLowerCase();
    let category = 'Cleanliness';
    if (topicLower.includes('display') || topicLower.includes('screen') || topicLower.includes('oled')) category = 'Display';
    if (topicLower.includes('battery') || topicLower.includes('power') || topicLower.includes('charge')) category = 'Power';
    if (topicLower.includes('static') || topicLower.includes('esd') || topicLower.includes('ground')) category = 'ESD';
    if (topicLower.includes('solder') || topicLower.includes('tool') || topicLower.includes('driver')) category = 'Tools';

    const fallbackVideo = {
      id: `vid-${Date.now()}`,
      title: `DIY Tutorial: ${topic}`,
      category,
      difficulty: 'Intermediate',
      estimatedTime: '2:30 mins',
      description: `Step-by-step technical guide for ${topic} formulated by D&CP Spokane Lab Engineers.`,
      requiredTools: ['99.9% Anhydrous Isopropyl Alcohol', 'Precision Microfiber Cloth', 'Anti-Static Nylon Spudger'],
      safetyWarnings: ['Ensure device is fully powered down before applying liquids.', 'Never apply alcohol directly to open speaker grilles.'],
      scenes: [
        {
          stepNumber: 1,
          title: 'Bench Environment & Power Down',
          narration: 'Before beginning any maintenance, power down the device completely and discharge static electricity using an ESD wrist strap.',
          durationSeconds: 5,
          visualPrompt: 'Technician grounding wrist strap and switching off device under ESD ring light.',
          graphicType: 'warning',
          highlightRegion: { x: 50, y: 30, label: 'Power Switch & ESD Strap' },
          actionTip: 'Touch a grounded metal surface before handling delicate circuitry.',
        },
        {
          stepNumber: 2,
          title: 'Applying Anhydrous Solvents',
          narration: 'Apply 2-3 drops of 99.9% Isopropyl Alcohol onto a lint-free microfiber cloth. Do NOT spray solvent directly onto display glass.',
          durationSeconds: 6,
          visualPrompt: 'Precision applicator dropping anhydrous IPA onto microfiber cloth weave.',
          graphicType: 'cleaning',
          highlightRegion: { x: 45, y: 55, label: 'Microfiber Applicator Zone' },
          actionTip: 'Higher water percentages in 70% alcohol can seep under display bezels and cause backlight staining.',
        },
        {
          stepNumber: 3,
          title: 'Circular Buffing & Debris Removal',
          narration: 'Gently wipe in small overlapping circular motions, working from the center outward to dissolve finger oils and adhesive residues.',
          durationSeconds: 7,
          visualPrompt: 'Magnified view of oleophobic layer restoration and oil residue breakdown.',
          graphicType: 'microscope',
          highlightRegion: { x: 50, y: 50, label: 'Display Surface Grid' },
          actionTip: 'Use uniform light pressure. Excess force can damage delicate anti-reflective coatings.',
        },
        {
          stepNumber: 4,
          title: 'Final Inspection under UV Telemetry',
          narration: 'Inspect the glass under angled LED lighting to ensure zero lint or streaks remain before re-engaging the device.',
          durationSeconds: 6,
          visualPrompt: 'Angled inspection light revealing pristine glass surface.',
          graphicType: 'tool',
          highlightRegion: { x: 60, y: 40, label: 'Inspection Angle' },
          actionTip: 'Check perimeter seals for any liquid ingress before powering back on.',
        },
      ],
    };

    videoGuideCache.set(cacheKey, fallbackVideo);
    return NextResponse.json({ success: true, video: fallbackVideo });
  } catch (error) {
    console.error('Academy video generator error:', error);
    return NextResponse.json({
      success: true,
      video: {
        id: `vid-${Date.now()}`,
        title: `Technical Guide: ${topic}`,
        category: 'Tools',
        difficulty: 'Beginner',
        estimatedTime: '2:00 mins',
        description: `Laboratory procedures for ${topic}.`,
        requiredTools: ['Precision Screwdriver Kit', 'Nylon Spudger'],
        safetyWarnings: ['Work in an ESD safe environment'],
        scenes: [
          {
            stepNumber: 1,
            title: 'Preparation & Inspection',
            narration: 'Ground yourself and inspect the device casing thoroughly.',
            durationSeconds: 5,
            visualPrompt: 'Technician performing preliminary examination.',
            graphicType: 'warning',
            highlightRegion: { x: 50, y: 50, label: 'Diagnostic Checkpoint' },
            actionTip: 'Document all pre-existing cosmetic wear.',
          },
        ],
      },
    });
  }
}
