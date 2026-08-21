import { z } from 'zod';

// --- Triage AI (ElevenLabs conversational agent) tool schemas ---

export const RepairQuoteSchema = z.object({
  device_brand: z.enum(['Apple', 'Samsung', 'Google', 'Motorola', 'Other']),
  device_model: z.string().min(1).max(120),
  repair_type: z.enum(['screen_aftermarket', 'screen_oem', 'battery', 'charging_port', 'camera', 'back_glass']),
  is_b2b: z.boolean().optional().default(false),
  zip_code: z.string().regex(/^\d{5}$/, 'zip_code must be 5 digits').optional().default('99201'),
});

export const DispatchBookingLinkSchema = z.object({
  customer_name: z.string().min(1).max(200),
  customer_phone: z.string().regex(/^\+1\d{10}$/, 'customer_phone must be E.164 US format, e.g. +15095550199'),
  device_summary: z.string().min(1).max(500),
  quoted_price: z.number().min(0),
  service_tier: z.string().max(100).optional().default(''),
  location_address: z.string().max(300).optional().default(''),
});

export const EscalateTier3TicketSchema = z.object({
  customer_name: z.string().min(1).max(200),
  customer_phone: z.string().regex(/^\+1\d{10}$/, 'customer_phone must be E.164 US format, e.g. +15095550199'),
  device_model: z.string().min(1).max(120),
  failure_symptoms: z.string().min(1).max(2000),
  intake_notes: z.string().max(2000).optional().default(''),
});

export const TelemetrySchema = z.object({
  batteryHealthPercentage: z.number().min(0).max(100).optional().default(90),
  batteryTempCelsius: z.number().min(-50).max(150).optional().default(22),
  ammeterDrawAmps: z.number().min(0).max(50).optional().default(0),
  isShortToGround: z.boolean().optional().default(false),
}).optional();

export const DiagnoseSchema = z.object({
  deviceModel: z.string().max(120).optional().default('Client Unit'),
  customerReportedIssue: z.string().max(2000).optional().default(''),
  telemetry: TelemetrySchema,
});

export const SmartTriageSchema = z.object({
  deviceModel: z.string().max(120).optional().default('Unspecified Model'),
  symptomDescription: z.string().min(1, 'Symptom description is required').max(2500),
  retrievedContext: z.array(z.string().max(600)).max(5).optional().default([]),
});

export const DiagnosticPathSchema = z.object({
  deviceManufacturer: z.string().max(80).optional().default('Unknown'),
  deviceModel: z.string().max(120).optional().default('Device'),
  repairNotes: z.string().max(3000).optional().default(''),
  symptoms: z.array(z.string().max(150)).max(30).optional().default([]),
  telemetry: TelemetrySchema,
});

export const CalculateCompletionSchema = z.object({
  serviceTier: z.string().max(100).optional().default('Tier 2 (Display Renewal)'),
  currentStage: z.number().int().min(1).max(4).optional().default(1),
  queuePosition: z.number().int().min(0).max(100).optional().default(3),
  totalQueueJobs: z.number().int().min(0).max(500).optional().default(12),
  activeTechnicians: z.number().int().min(1).max(50).optional().default(3),
  partsInStock: z.boolean().optional().default(true),
  priorityExpress: z.enum(['standard', 'express', 'emergency']).optional().default('standard'),
});

export const BookingScheduleSchema = z.object({
  date: z.string().min(1, 'Date is required').max(50),
  timeSlot: z.string().min(1, 'Time slot is required').max(50),
  dropOffType: z.string().max(50).optional().default('in_person'),
  deviceCategory: z.string().max(80).optional().default('iPhone / iOS Device'),
  serviceTier: z.string().max(80).optional().default('tier2'),
  customerName: z.string().min(1, 'Customer name is required').max(150),
  customerEmail: z.string().email('Invalid email address').max(150),
  customerPhone: z.string().min(5, 'Valid phone number is required').max(50),
  notes: z.string().max(2000).optional().default(''),
});

export const SupportMessageSchema = z.object({
  name: z.string().min(1, 'Name is required').max(150),
  email: z.string().email('Invalid email address').max(150),
  subject: z.string().min(1, 'Subject is required').max(200),
  message: z.string().min(2, 'Message is required').max(4000),
});

export const AcademyVideoSchema = z.object({
  topic: z.string().min(1, 'Topic is required').max(200).optional().default('General Electronics Maintenance'),
});

export const SupportChatSchema = z.object({
  message: z.string().min(1, 'Message is required').max(2000),
  conversationHistory: z.array(z.object({
    sender: z.string(),
    text: z.string().max(3000),
  })).max(50).optional().default([]),
  ticketId: z.string().max(50).optional(),
});
