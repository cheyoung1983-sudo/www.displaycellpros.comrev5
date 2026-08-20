import type { Metadata } from 'next';
import { getRouteMetadata } from '../../../src/lib/seo-metadata.ts';
import ElevenKnowledgeAndToolsHub from '../../../src/components/ElevenKnowledgeAndToolsHub.tsx';

export const metadata: Metadata = getRouteMetadata('voice-ai-knowledge-base');

export default function VoiceAiKnowledgeBasePage() {
  return <ElevenKnowledgeAndToolsHub />;
}
