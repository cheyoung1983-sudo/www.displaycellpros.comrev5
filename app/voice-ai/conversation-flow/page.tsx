import type { Metadata } from 'next';
import { getRouteMetadata } from '../../../src/lib/seo-metadata.ts';
import ElevenLabsConversationFlow from '../../../src/components/ElevenLabsConversationFlow.tsx';

export const metadata: Metadata = getRouteMetadata('voice-ai-conversation-flow');

export default function VoiceAiConversationFlowPage() {
  return <ElevenLabsConversationFlow />;
}
