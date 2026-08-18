/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

export enum ServiceTier {
  TIER_1_POWER = 'TIER_1_POWER',
  TIER_2_DISPLAY = 'TIER_2_DISPLAY',
  TIER_3_BOARD = 'TIER_3_BOARD',
}

export enum Manufacturer {
  APPLE = 'APPLE',
  SAMSUNG = 'SAMSUNG',
  OTHER = 'OTHER',
}

export const TelemetrySchema = z.object({
  batteryHealthPercentage: z.number().min(0).max(100),
  batteryTempCelsius: z.number().max(45.0, 'Thermal lockout: Battery temperature exceeds 45.0°C safety threshold'),
  ammeterDrawAmps: z.number().min(0.0).max(10.0),
  isShortToGround: z.boolean(),
});

export type TelemetryData = z.infer<typeof TelemetrySchema>;

export const IntakeFormSchema = z.object({
  deviceManufacturer: z.nativeEnum(Manufacturer),
  deviceModel: z.string().min(2, 'Device model is required'),
  imei: z.string().regex(/^[0-9]{15}$/, 'IMEI must be exactly 15 numeric digits'),
  serviceTier: z.nativeEnum(ServiceTier),
  selectedVariantId: z.string().optional(),
  customerReportedIssue: z.string().min(10, 'Please provide a detailed description of the issue'),
  devicePasscode: z.string().optional(),
  telemetry: TelemetrySchema,
  waR2rPrivacyAcknowledged: z.boolean().refine(v => v === true, 'Privacy acknowledgement required'),
  waR2rDataBackupAcknowledged: z.boolean().refine(v => v === true, 'Data backup acknowledgement required'),
  waR2rPartsProvenanceAcknowledged: z.boolean().refine(v => v === true, 'Parts provenance acknowledgement required'),
  customerEmail: z.string().email('Valid email required'),
  customerName: z.string().min(2, 'Full name required'),
  customerPhone: z.string().min(10, 'Valid phone number required'),
  destinationZipCode: z.string().regex(/^[0-9]{5}$/, '5-digit Washington ZIP code required'),
});

export type IntakeFormData = z.infer<typeof IntakeFormSchema>;

export interface ShopifyResponse {
  success: boolean;
  draftOrderId?: string;
  invoiceUrl?: string;
  errors?: string[];
}

export interface CapturedPhoto {
  id: string;
  dataUrl: string;
  category: string;
  notes?: string;
  timestamp: string;
}

export type ServiceCategory = 'all' | 'micro-soldering' | 'high-velocity' | 'mobile-data-security' | 'federal-gsa' | 'board-diagnostics';

export interface ServiceItem {
  id: string;
  title: string;
  category: ServiceCategory;
  shortDescription: string;
  fullDescription: string;
  iconName: string;
  deliverables: string[];
  keyMetrics: { label: string; value: string }[];
  caseStudyRefId?: string;
  tags: string[];
  marginProfit?: string;
}

export type CaseStudyCategory = 'all' | 'micro-soldering' | 'data-recovery' | 'mobile-security' | 'federal-gsa';

export interface CaseStudy {
  id: string;
  title: string;
  clientName: string;
  industry: string;
  category: CaseStudyCategory;
  summary: string;
  challenge: string;
  solution: string;
  impactMetrics: { label: string; value: string; trend?: string }[];
  image: string;
  featured: boolean;
  year: string;
  testimonial?: {
    quote: string;
    author: string;
    role: string;
    company: string;
  };
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  bio: string;
  technicalBiography?: string;
  militaryService?: string;
  education?: string;
  researchExperience?: string;
  seattleExperience?: string;
  photo: string;
  linkedInUrl?: string;
  twitterUrl?: string;
  email: string;
  expertise: string[];
  location: string;
}

export type InsightCategory = 'all' | 'federal-compliance' | 'technical-micro-soldering' | 'tax-engineering' | 'operational-strategy';

export interface InsightPost {
  id: string;
  title: string;
  category: InsightCategory;
  excerpt: string;
  content: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  date: string;
  readTime: string;
  image: string;
  featured?: boolean;
  tags: string[];
}

export interface OfficeLocation {
  id: string;
  city: string;
  country: string;
  address: string;
  phone: string;
  email: string;
  tz: string;
  isHeadquarters?: boolean;
  coordinates: { lat: number; lng: number };
}

export interface FederalCredentials {
  uei: string;
  ein: string;
  ubi: string;
  naicsCode: string;
  naicsDescription: string;
  samStatus: string;
  demographics: string[];
  sbaStatus: string;
}

export interface InvestmentPayloadItem {
  category: string;
  allocation: number;
  title: string;
  purpose: string;
  keyAssets: string[];
}

export interface ClientProject {
  id: string;
  name: string;
  status: 'In Progress' | 'Inspection' | 'Completed' | 'Pending Board Audit';
  progress: number;
  leadPartner: string;
  nextMilestone: string;
  targetCompletion: string;
  recentDeliverable: string;
}

export interface ClientMessage {
  id: string;
  senderName: string;
  senderRole: string;
  timestamp: string;
  content: string;
  isFromClient: boolean;
}

