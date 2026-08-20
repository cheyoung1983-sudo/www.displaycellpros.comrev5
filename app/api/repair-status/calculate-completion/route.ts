import { NextRequest, NextResponse } from 'next/server';
import { CalculateCompletionSchema } from '../../../../src/lib/schemas.ts';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parseResult = CalculateCompletionSchema.safeParse(body);
    const {
      serviceTier = 'Tier 2 (Display Renewal)',
      currentStage = 1,
      queuePosition = 3,
      totalQueueJobs = 12,
      activeTechnicians = 3,
      partsInStock = true,
      priorityExpress = 'standard',
    } = parseResult.success
      ? parseResult.data
      : {
          serviceTier: 'Tier 2 (Display Renewal)',
          currentStage: 1,
          queuePosition: 3,
          totalQueueJobs: 12,
          activeTechnicians: 3,
          partsInStock: true,
          priorityExpress: 'standard' as const,
        };

    // Base bench hours
    let baseBenchHours = 2.0;
    const tierLower = String(serviceTier).toLowerCase();
    if (tierLower.includes('tier 1') || tierLower.includes('power') || tierLower.includes('port')) {
      baseBenchHours = 1.2;
    } else if (tierLower.includes('tier 2') || tierLower.includes('display') || tierLower.includes('screen')) {
      baseBenchHours = 2.5;
    } else if (tierLower.includes('tier 3') || tierLower.includes('board') || tierLower.includes('soldering')) {
      baseBenchHours = 5.5;
    } else if (tierLower.includes('tier 4') || tierLower.includes('data')) {
      baseBenchHours = 12.0;
    }

    let stageMultiplier = 1.0;
    if (currentStage === 2) stageMultiplier = 0.85;
    if (currentStage === 3) stageMultiplier = 0.4;
    if (currentStage === 4) stageMultiplier = 0.1;

    const effectiveTechs = Math.max(1, Number(activeTechnicians) || 1);
    const queueJobsAhead = Math.max(0, (Number(queuePosition) || 1) - 1);
    let queueWaitHours = (queueJobsAhead * 0.75) / effectiveTechs;

    let partsDelayHours = 0;
    if (!partsInStock && currentStage < 3) {
      partsDelayHours = 24.0;
    }

    let priorityMultiplier = 1.0;
    if (priorityExpress === 'express') priorityMultiplier = 0.5;
    if (priorityExpress === 'emergency') priorityMultiplier = 0.25;

    const activeBenchHours = Number((baseBenchHours * stageMultiplier * priorityMultiplier).toFixed(1));
    const triageHours = currentStage === 1 ? 0.3 : 0;
    queueWaitHours = Number((queueWaitHours * priorityMultiplier).toFixed(1));
    const qaHours = tierLower.includes('tier 3') ? 1.5 : 0.75;

    const totalCalculatedHours = Number((triageHours + queueWaitHours + activeBenchHours + partsDelayHours + qaHours).toFixed(1));

    const now = new Date();
    const completionTimeMs = now.getTime() + totalCalculatedHours * 3600 * 1000;
    const estimatedCompletionDate = new Date(completionTimeMs);

    const formattedDate = estimatedCompletionDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    const formattedTime = estimatedCompletionDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return NextResponse.json({
      success: true,
      calculation: {
        formattedCompletionWindow: `${formattedDate} at ${formattedTime}`,
        totalCalculatedHours,
        baseBenchHours,
        queueWaitHours,
        partsDelayHours,
        qaHours,
        workloadLevel: totalQueueJobs > 15 ? 'Peak Queue Load' : totalQueueJobs < 6 ? 'Low Traffic' : 'Moderate Load',
      },
    });
  } catch (error) {
    console.error('Completion calculation error:', error);
    return NextResponse.json({ success: false, error: 'Calculation failed' }, { status: 500 });
  }
}
