import type { Metadata } from 'next';
import { getRouteMetadata } from '../../../src/lib/seo-metadata.ts';
import ElevenAgentInspector from '../../../src/components/ElevenAgentInspector.tsx';

export const metadata: Metadata = getRouteMetadata('voice-ai-agent-inspector');

export default function VoiceAiAgentInspectorPage() {
  return <ElevenAgentInspector />;
}
