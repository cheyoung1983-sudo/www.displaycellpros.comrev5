import { describe, it, expect } from 'vitest';
import type { VoiceIntakeTicket } from './VoiceIntakeModal.tsx';

describe('VoiceIntake Data Model', () => {
  it('correctly structures voice intake ticket payload', () => {
    const mockTicket: VoiceIntakeTicket = {
      ticketNumber: 'DCP-V2C-7842',
      intakeSource: 'ELEVENLABS_VOICE_STUDIO',
      createdAt: new Date().toISOString(),
      customerName: 'Che Young',
      customerEmail: 'cheyoung1983@gmail.com',
      deviceManufacturer: 'Apple',
      deviceModel: 'iPhone 15 Pro Max',
      issueTranscript: 'Phone was dropped in water and now shows boot loop with logic board overheating.',
      suspectedFault: 'Primary Power Rail VDD_MAIN Short / Corrosion Bridge',
      serviceTier: 'TIER_3_MICRO_SOLDERING',
      serviceTierLabel: 'Tier 3 (Logic Board Micro-Soldering)',
      estimatedPriceRange: '$195 – $345',
      confidenceScore: 95,
      symptoms: ['Liquid Intrusion', 'VDD_MAIN Short to Ground', 'Thermal Inrush'],
      triageSummary: 'Critical hardware short detected on primary logic plane.',
      recommendedAction: 'Isolate battery immediately. Ultrasonic chemical bath and Rosin thermal imaging inspection.',
      status: 'pending_bench_staging',
      benchLocation: 'Spokane Lab Intake Queue Bin 1'
    };

    expect(mockTicket.ticketNumber).toMatch(/^DCP-V2C-\d+$/);
    expect(mockTicket.intakeSource).toBe('ELEVENLABS_VOICE_STUDIO');
    expect(mockTicket.deviceManufacturer).toBe('Apple');
    expect(mockTicket.symptoms).toContain('Liquid Intrusion');
    expect(mockTicket.confidenceScore).toBeGreaterThanOrEqual(90);
  });
});
