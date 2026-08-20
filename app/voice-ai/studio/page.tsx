import type { Metadata } from 'next';
import { getRouteMetadata } from '../../../src/lib/seo-metadata.ts';
import ElevenLabsVoiceGenerator from '../../../src/components/ElevenLabsVoiceGenerator.tsx';

export const metadata: Metadata = getRouteMetadata('voice-ai-studio');

export default function VoiceAiStudioPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <ElevenLabsVoiceGenerator />
    </div>
  );
}
