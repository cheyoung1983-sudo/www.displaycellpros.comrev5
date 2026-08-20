import type { Metadata } from 'next';
import { getRouteMetadata } from '../../../src/lib/seo-metadata.ts';
import ElevenLabsProceduresManager from '../../../src/components/ElevenLabsProceduresManager.tsx';

export const metadata: Metadata = getRouteMetadata('voice-ai-procedures');

export default function VoiceAiProceduresPage() {
  return <ElevenLabsProceduresManager />;
}
