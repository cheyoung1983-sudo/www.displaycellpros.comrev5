import { describe, it, expect } from 'vitest';
import {
  TelemetrySchema,
  DiagnoseSchema,
  SmartTriageSchema,
  CalculateCompletionSchema,
  BookingScheduleSchema,
  SupportMessageSchema,
} from './schemas.ts';

describe('Zod Validation Schemas', () => {
  it('validates TelemetrySchema with default values', () => {
    const parsed = TelemetrySchema.parse({});
    expect(parsed?.batteryHealthPercentage).toBe(90);
    expect(parsed?.batteryTempCelsius).toBe(22);
    expect(parsed?.ammeterDrawAmps).toBe(0);
    expect(parsed?.isShortToGround).toBe(false);
  });

  it('validates SmartTriageSchema rejecting empty descriptions', () => {
    const valid = SmartTriageSchema.safeParse({
      deviceModel: 'iPhone 14',
      symptomDescription: 'Cracked screen and touch unresponsive',
    });
    expect(valid.success).toBe(true);

    const invalid = SmartTriageSchema.safeParse({
      deviceModel: 'iPhone 14',
      symptomDescription: '',
    });
    expect(invalid.success).toBe(false);
  });

  it('validates CalculateCompletionSchema priority modes', () => {
    const validStandard = CalculateCompletionSchema.safeParse({
      priorityExpress: 'standard',
    });
    expect(validStandard.success).toBe(true);

    const validEmergency = CalculateCompletionSchema.safeParse({
      priorityExpress: 'emergency',
    });
    expect(validEmergency.success).toBe(true);

    const invalidPriority = CalculateCompletionSchema.safeParse({
      priorityExpress: 'instant',
    });
    expect(invalidPriority.success).toBe(false);
  });

  it('validates BookingScheduleSchema email and phone constraints', () => {
    const valid = BookingScheduleSchema.safeParse({
      date: '2026-08-20',
      timeSlot: '10:00 AM',
      customerName: 'Jane Doe',
      customerEmail: 'jane@example.com',
      customerPhone: '509-555-0199',
    });
    expect(valid.success).toBe(true);

    const invalidEmail = BookingScheduleSchema.safeParse({
      date: '2026-08-20',
      timeSlot: '10:00 AM',
      customerName: 'Jane Doe',
      customerEmail: 'not-an-email',
      customerPhone: '509-555-0199',
    });
    expect(invalidEmail.success).toBe(false);
  });

  it('validates SupportMessageSchema requirements', () => {
    const valid = SupportMessageSchema.safeParse({
      name: 'John Smith',
      email: 'john@example.com',
      subject: 'Question on board repair',
      message: 'Can you rework BGA chips on MacBook M2 logic boards?',
    });
    expect(valid.success).toBe(true);

    const missingSubject = SupportMessageSchema.safeParse({
      name: 'John Smith',
      email: 'john@example.com',
      subject: '',
      message: 'Help needed',
    });
    expect(missingSubject.success).toBe(false);
  });
});
