/**
 * Local-first retrieval layer for Smart Triage.
 *
 * Scores SUPPORTED_DEVICES_DATABASE entries against a symptom description
 * using simple keyword overlap (no embeddings, no network, no vector DB) so
 * it runs entirely client-side and works offline. Two consumers:
 *  - Online: retrieveTriageContext() output is sent to /api/ai/smart-triage
 *    as grounding context for the LLM prompt (the "retrieval" half of RAG).
 *  - Offline: synthesizeOfflineTriage() builds a full triage result directly
 *    from the retrieved matches, no LLM call required.
 */
import { SUPPORTED_DEVICES_DATABASE, SupportedDeviceModel, BoardRepairCapability } from '../data/supportedDevicesData.ts';
import type { SmartTriageResult } from '../components/SmartTriageChat.tsx';

const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'to', 'of',
  'in', 'on', 'at', 'it', 'my', 'me', 'i', 'with', 'for', 'this', 'that', 'has',
  'have', 'had', 'be', 'been', 'not', 'no', 'when', 'while', 'still', 'just',
]);

function tokenize(text: string): string[] {
  return (text.toLowerCase().match(/[a-z0-9]+/g) || []).filter(
    (t) => t.length > 2 && !STOPWORDS.has(t)
  );
}

export interface DeviceMatch {
  device: SupportedDeviceModel;
  matchedSymptoms: string[];
  bestRepair: BoardRepairCapability;
  score: number;
}

/**
 * Scores every device in the catalog against the query tokens and returns
 * the top matches, ranked by symptom keyword overlap (with a boost for an
 * explicit device-model match).
 */
export function findMatchingDevices(
  deviceModel: string,
  symptomDescription: string,
  limit = 3
): DeviceMatch[] {
  const queryTokens = tokenize(symptomDescription);
  const modelTokens = new Set(tokenize(deviceModel));

  const matches: DeviceMatch[] = [];

  for (const device of SUPPORTED_DEVICES_DATABASE) {
    let score = 0;
    const matchedSymptoms: string[] = [];

    const deviceModelTokens = tokenize(device.modelName);
    if (modelTokens.size > 0 && deviceModelTokens.some((t) => modelTokens.has(t))) {
      score += 5;
    }

    for (const symptom of device.commonSymptoms) {
      const symptomTokens = tokenize(symptom);
      const overlap = symptomTokens.filter((t) => queryTokens.includes(t)).length;
      if (overlap > 0) {
        score += overlap;
        matchedSymptoms.push(symptom);
      }
    }

    if (score > 0 && device.supportedRepairs.length > 0) {
      const bestRepair = [...device.supportedRepairs].sort(
        (a, b) => b.typicalSuccessRate - a.typicalSuccessRate
      )[0];
      matches.push({ device, matchedSymptoms, bestRepair, score });
    }
  }

  return matches.sort((a, b) => b.score - a.score).slice(0, limit);
}

/**
 * Renders device matches as short text snippets suitable for splicing into
 * an LLM prompt as grounding context.
 */
export function retrieveTriageContext(
  deviceModel: string,
  symptomDescription: string,
  limit = 3
): string[] {
  return findMatchingDevices(deviceModel, symptomDescription, limit).map((match) => {
    const symptomList = match.matchedSymptoms.length > 0
      ? match.matchedSymptoms.join('; ')
      : match.device.commonSymptoms.slice(0, 2).join('; ');
    return `${match.device.manufacturer} ${match.device.modelName} (${match.device.chipset}): known symptoms matching this report include "${symptomList}". Bench repair on file: ${match.bestRepair.name} — ${match.bestRepair.description} (${match.bestRepair.tier}, ${match.bestRepair.typicalSuccessRate}% typical success rate, ${match.bestRepair.averageTurnaroundDays} turnaround). Donor board availability: ${match.device.donorBoardStock}.`;
  });
}

function classifyTierFromRepairTier(repairTier: BoardRepairCapability['tier']): {
  recommendedTier: string;
  recommendedTierLabel: string;
} {
  switch (repairTier) {
    case 'Port & FPC Rework':
      return { recommendedTier: 'TIER_1_POWER_PORT_REFRESH', recommendedTierLabel: 'Tier 1 (Power/Port Refresh)' };
    case 'Tier 3 Micro-Soldering':
    case 'Tier 4 BGA Reballing':
    case 'Forensic Data Recovery':
    case 'Ultrasonic Water Recovery':
    default:
      return { recommendedTier: 'TIER_3_MICRO_SOLDERING', recommendedTierLabel: 'Tier 3 (Board Rework)' };
  }
}

/**
 * Builds a full SmartTriageResult purely from local retrieval, with no LLM
 * call. Used when offline or when the online API request fails.
 */
export function synthesizeOfflineTriage(
  deviceModel: string,
  symptomDescription: string
): SmartTriageResult {
  const matches = findMatchingDevices(deviceModel, symptomDescription, 1);
  const top = matches[0];

  if (!top) {
    return {
      suspectedFault: 'General Hardware Fault (Offline Estimate)',
      recommendedTier: 'TIER_1_POWER_PORT_REFRESH',
      recommendedTierLabel: 'Tier 1 (Power/Port Refresh)',
      confidenceScore: 40,
      summary:
        'No local knowledge-base match was found for this device/symptom combination while offline. This is a generic placeholder — connect to the network to get a full AI-grounded diagnosis.',
      diyInitialSteps: ['Power cycle the device.', 'Check charge port for debris.'],
      technicianChecklistAdvice: ['Run a full bench diagnostic once online triage is available.'],
    };
  }

  const { recommendedTier, recommendedTierLabel } = classifyTierFromRepairTier(top.bestRepair.tier);
  const matchedSymptomText = top.matchedSymptoms[0] || top.device.commonSymptoms[0];

  return {
    suspectedFault: `${matchedSymptomText} (offline local match: ${top.device.modelName})`,
    recommendedTier,
    recommendedTierLabel,
    confidenceScore: Math.min(60 + top.score * 5, 85),
    summary: `Offline estimate from the local device knowledge base for ${top.device.manufacturer} ${top.device.modelName}: symptoms match "${matchedSymptomText}", most commonly resolved via ${top.bestRepair.name} (${top.bestRepair.typicalSuccessRate}% typical success rate). This result was generated locally without a network connection — reconnect for a full AI-grounded diagnosis.`,
    diyInitialSteps: [
      'Power cycle the device and note any change in behavior.',
      'Avoid charging the device if a short or liquid exposure is suspected.',
    ],
    technicianChecklistAdvice: [
      `Verify against on-file repair: ${top.bestRepair.name} (${top.bestRepair.tier}).`,
      `Donor board availability: ${top.device.donorBoardStock}.`,
    ],
  };
}
