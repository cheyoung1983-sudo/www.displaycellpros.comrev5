import type { Metadata } from 'next';
import { getRouteMetadata } from '../../../src/lib/seo-metadata.ts';
import ElevenLabsVoiceStudioSettings from '../../../src/components/ElevenLabsVoiceStudioSettings.tsx';

export const metadata: Metadata = getRouteMetadata('voice-ai-dictionaries');

export default function VoiceAiDictionariesPage() {
  return <ElevenLabsVoiceStudioSettings />;
}
