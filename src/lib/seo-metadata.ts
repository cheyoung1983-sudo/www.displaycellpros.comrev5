import type { Metadata } from 'next';

export type RouteKey =
  | 'home'
  | 'enterprise'
  | 'intake'
  | 'hardware-diagnostics'
  | 'voice-ai-studio'
  | 'voice-ai-procedures'
  | 'voice-ai-conversation-flow'
  | 'voice-ai-dictionaries'
  | 'voice-ai-v2c-hub'
  | 'voice-ai-agent-inspector'
  | 'auth0-flows'
  | 'voice-ai-knowledge-base'
  | 'board-database'
  | 'booking'
  | 'price-guide'
  | 'repair-status'
  | 'analytics'
  | 'academy'
  | 'blueprint'
  | 'support'
  | 'about';

interface RouteMeta {
  title: string;
  description: string;
  keywords: string;
}

const ROUTE_META_MAP: Record<RouteKey, RouteMeta> = {
  home: {
    title: 'D&CP LLC | High-Precision Electronics Repair & Refurbished Store',
    description: "Spokane's premier micro-soldering & electronics restoration lab. Explore certified refurbished devices, component intake, and precision repair services.",
    keywords: 'electronics repair, Spokane repair lab, micro-soldering, iPhone repair, MacBook logic board, refurbished phones'
  },
  enterprise: {
    title: 'Federal & Enterprise Hub | Display & Cell Pros LLC',
    description: 'Master contract dispatch, SAM.gov credentials, high-volume fleet triage, and certified laboratory restorations.',
    keywords: 'federal repair hub, enterprise fleet triage, SAM.gov repair, micro-soldering contract, D&CP LLC'
  },
  intake: {
    title: 'Device Repair Intake & Diagnostic Ticket | D&CP LLC',
    description: 'Submit your device for component-level diagnosis, micro-soldering, OLED replacement, or liquid damage restoration with instant order sync.',
    keywords: 'device intake, repair ticket, logic board repair, screen replacement, liquid damage recovery, diagnostic scan'
  },
  'hardware-diagnostics': {
    title: 'WebUSB Hardware Diagnostic Port & Serial Monitor | D&CP LLC',
    description: 'Real-time serial port monitor and hardware logic analyzer for technicians to read live diagnostic codes, VBUS voltage, and PMIC thermal telemetry via WebUSB.',
    keywords: 'WebUSB diagnostic tool, serial port monitor, logic analyzer, diagnostic codes, UART console, Spokane repair lab'
  },
  'voice-ai-studio': {
    title: 'ElevenLabs Voice AI Studio & Text-to-Speech | D&CP LLC',
    description: 'Generate ultra-realistic text-to-speech voice briefings, audio logs, and repair status summaries using ElevenLabs API integration.',
    keywords: 'ElevenLabs voice AI, text to speech, repair audio briefing, voice synthesis, ElevenLabs API'
  },
  'voice-ai-procedures': {
    title: 'ElevenLabs Conversational AI Procedures Manager | D&CP LLC',
    description: 'Manage task-specific free-form and structured procedures for Conversational AI agents with live trigger evaluation and versioning drafts.',
    keywords: 'ElevenLabs procedures, conversational AI agents, structured procedures, free-form instructions, AI agent workflows'
  },
  'voice-ai-conversation-flow': {
    title: 'ElevenLabs Conversation Flow & Timeouts Studio | D&CP LLC',
    description: 'Configure conversational silence timeouts, soft thinking fillers, user interruptions, and turn eagerness for Conversational AI agents.',
    keywords: 'ElevenLabs conversation flow, turn timeout, soft timeout, user interruptions, turn eagerness, conversational AI'
  },
  'voice-ai-dictionaries': {
    title: 'ElevenLabs Pronunciation Dictionaries & Expressive Mode | D&CP LLC',
    description: 'Configure pronunciation lexicons (.PLS / IPA / CMU) and Eleven v3 Conversational Expressive mode for conversational AI agents.',
    keywords: 'ElevenLabs pronunciation dictionaries, PLS lexicon, IPA, CMU, expressive mode, Eleven v3 Conversational'
  },
  'voice-ai-v2c-hub': {
    title: 'Voice-to-Circuit (V2C) Agent Hub | D&CP LLC Triage-AI',
    description: 'Production-grade deployment configuration for Voice-to-Circuit conversational AI agent mapping spoken symptoms to motherboard faults and Vercel/PostgreSQL pricing.',
    keywords: 'Voice to Circuit, V2C agent, Triage-AI, symptom to circuit, PostgreSQL pricing, ElevenLabs agent configuration'
  },
  'voice-ai-agent-inspector': {
    title: 'ElevenLabs Agent Config Inspector | D&CP LLC Ryan Young',
    description: 'Inspect active ElevenLabs conversational agent JSON configuration (agent_5601ky3cxy0jepdaj25fv8p0y5fn) for Ryan Young & Triage-AI diagnostics.',
    keywords: 'ElevenLabs agent inspector, agent config JSON, Ryan Young, Triage AI, diagnostic agent configuration'
  },
  'auth0-flows': {
    title: 'Auth0 Authentication & Authorization Flows Hub | D&CP LLC',
    description: 'Interactive Auth0 OIDC and OAuth 2.0 protocol explorer covering Authorization Code Flow, PKCE, Client Credentials, Device Code, and Custom Token Exchange.',
    keywords: 'Auth0 flows, OIDC, OAuth 2.0, Authorization Code Flow, PKCE, Client Credentials, Device Authorization, Custom Token Exchange'
  },
  'voice-ai-knowledge-base': {
    title: 'ElevenLabs Knowledge Base & Client Tools Hub | D&CP LLC',
    description: 'Manage custom domain documents, RAG embeddings (e5_mistral_7b_instruct), usage modes, and client-side tool execution for Conversational AI agents.',
    keywords: 'ElevenLabs knowledge base, RAG, retrieval augmented generation, client tools, webhook tools, embedding model, e5_mistral_7b_instruct'
  },
  'board-database': {
    title: 'Board Repair Support Matrix & Device Database | D&CP LLC',
    description: 'Query our live database of supported device models, PCB board IDs, schematics coverage, donor board staging, and Tier 3/4 micro-soldering capabilities.',
    keywords: 'supported device database, board repair compatibility, iPhone board IDs, MacBook schematics, PS5 HDMI repair, Steam Deck PMIC'
  },
  booking: {
    title: 'Schedule Spokane Lab Drop-Off & Express Triage | D&CP LLC',
    description: 'Book a same-day or 24/7 secure lockbox drop-off appointment at our Spokane WA repair laboratory. Fast turnaround & certified bench technicians.',
    keywords: 'Spokane drop off repair, lab appointment, same day phone repair, lockbox drop off, 115 S Adams St Spokane'
  },
  'price-guide': {
    title: 'Precision Repair Cost Calculator & Price Guide | D&CP LLC',
    description: 'Calculate instant, transparent repair pricing for iPhone, MacBook, iPad, and Android logic board, battery, display, and rush service options.',
    keywords: 'repair estimate calculator, iPhone repair cost, MacBook screen price, battery replacement quote, micro-soldering pricing'
  },
  'repair-status': {
    title: 'Real-Time Repair Status Tracker & Lifecycle Progress | D&CP LLC',
    description: 'Track your device restoration lifecycle live across 5 precision stages from intake triage to BGA soldering and final QA burn-in test.',
    keywords: 'track repair status, repair lifecycle, order status check, device diagnostic progress, ticket lookup'
  },
  analytics: {
    title: 'Repair Telemetry & 30-Day Failure Analytics | D&CP LLC',
    description: 'Explore Spokane Lab bench metrics, turnaround velocity, first-pass yield rates, technician benchmarks, and hardware failure mode distributions.',
    keywords: 'repair analytics, technician telemetry, failure mode rates, turnaround time metric, repair lab yield'
  },
  academy: {
    title: 'Micro-Soldering & Hardware Repair Academy | D&CP LLC',
    description: 'Master Level 3 BGA reballing, PMIC diagnosis, trace repair, and schematic analysis with D&CP certified technical curriculum.',
    keywords: 'micro soldering course, repair academy, BGA reballing training, logic board schematics, IPC soldering certification'
  },
  blueprint: {
    title: 'Master Operational Blueprint & Federal Governance | Display & Cell Pros LLC',
    description: 'Corporate identity, SAM.gov UEI registration, IRS Form 941 compliance standards, OBBBA permanent bonus depreciation, and DES Master Contracts.',
    keywords: 'Display & Cell Pros LLC, corporate blueprint, SAM.gov UEI, Form 941 multipliers, OBBBA bonus depreciation, Washington DES master contracts'
  },
  support: {
    title: 'Technical Laboratory Support & Engineer Help | D&CP LLC',
    description: 'Get technical support, check 1-year warranty terms, speak with bench engineers, or request expedited RMA assistance.',
    keywords: 'repair support, warranty claims, bench engineer contact, Spokane lab help, RMA status'
  },
  about: {
    title: 'Engineering Protocol & ISO Laboratory Standards | D&CP LLC',
    description: 'Discover D&CP LLC ISO-calibrated bench standards, ESD electrostatic protection protocols, cleanroom specifications, and micro-repair ethics.',
    keywords: 'repair engineering protocol, ISO cleanroom repair, ESD protection standards, micro soldering laboratory, D&CP LLC'
  },
};

export function getRouteMetadata(key: RouteKey): Metadata {
  const meta = ROUTE_META_MAP[key];
  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    authors: [{ name: 'D&CP LLC Electronics Laboratory' }],
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: 'website',
      siteName: 'D&CP LLC Repair Portal',
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
    },
  };
}
