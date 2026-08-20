import type { Metadata } from 'next';
import { getRouteMetadata } from '../../../src/lib/seo-metadata.ts';
import VoiceToCircuitAgentHub from '../../../src/components/VoiceToCircuitAgentHub.tsx';

export const metadata: Metadata = getRouteMetadata('voice-ai-v2c-hub');

export default function VoiceAiV2cHubPage() {
  return <VoiceToCircuitAgentHub />;
}
