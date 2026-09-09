import { describe, it, expect } from 'vitest';
import { findMatchingDevices, retrieveTriageContext, synthesizeOfflineTriage } from './triageKnowledgeBase.ts';

describe('findMatchingDevices', () => {
  it('matches a device by symptom keyword overlap', () => {
    const matches = findMatchingDevices('', 'device shows a short on VDD_MAIN and will not power on', 3);
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0].score).toBeGreaterThan(0);
  });

  it('returns no matches for symptoms with no keyword overlap', () => {
    const matches = findMatchingDevices('', 'zzzqqqxxx nonsense gibberish', 3);
    expect(matches).toHaveLength(0);
  });

  it('boosts score when the device model matches', () => {
    const withModel = findMatchingDevices('iPhone 15 Pro Max', 'short on VDD_MAIN', 3);
    const withoutModel = findMatchingDevices('', 'short on VDD_MAIN', 3);
    const matchedDevice = withModel.find((m) => m.device.modelName === 'iPhone 15 Pro Max');
    const unmatchedDevice = withoutModel.find((m) => m.device.modelName === 'iPhone 15 Pro Max');
    expect(matchedDevice?.score).toBeGreaterThan(unmatchedDevice?.score ?? 0);
  });
});

describe('retrieveTriageContext', () => {
  it('returns human-readable context strings grounded in real device data', () => {
    const context = retrieveTriageContext('', 'liquid damage, will not charge or turn on', 2);
    expect(Array.isArray(context)).toBe(true);
    for (const snippet of context) {
      expect(typeof snippet).toBe('string');
      expect(snippet.length).toBeGreaterThan(0);
    }
  });

  it('returns an empty array when nothing matches', () => {
    expect(retrieveTriageContext('', 'zzzqqqxxx nonsense gibberish', 3)).toEqual([]);
  });
});

describe('synthesizeOfflineTriage', () => {
  it('produces a full SmartTriageResult shape even with no match', () => {
    const result = synthesizeOfflineTriage('', 'zzzqqqxxx nonsense gibberish');
    expect(result.suspectedFault).toBeTruthy();
    expect(result.recommendedTier).toBeTruthy();
    expect(result.recommendedTierLabel).toBeTruthy();
    expect(typeof result.confidenceScore).toBe('number');
    expect(Array.isArray(result.diyInitialSteps)).toBe(true);
    expect(Array.isArray(result.technicianChecklistAdvice)).toBe(true);
  });

  it('grounds the result in the matched device when symptoms overlap', () => {
    const result = synthesizeOfflineTriage('', 'short on VDD_MAIN, dead board, no boot');
    expect(result.recommendedTier).toBe('TIER_3_MICRO_SOLDERING');
    expect(result.confidenceScore).toBeGreaterThanOrEqual(60);
  });
});
