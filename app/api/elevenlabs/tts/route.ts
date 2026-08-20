import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { text, voiceId = 'JBFqnCBsd6RMkjVDRZzb', modelId = 'eleven_v3' } = body || {};
    if (!text) {
      return NextResponse.json({ error: 'Text parameter is required for TTS synthesis' }, { status: 400 });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ELEVENLABS_API_KEY is not configured on the server environment.' },
        { status: 500 }
      );
    }

    const { ElevenLabsClient } = await import('@elevenlabs/elevenlabs-js');
    const client = new ElevenLabsClient({ apiKey });

    const audioStream = await client.textToSpeech.convert(voiceId, {
      text,
      modelId,
      outputFormat: 'mp3_44100_128',
    });

    // Convert readable stream / async iterable to buffer
    const chunks: Buffer[] = [];
    for await (const chunk of audioStream as any) {
      chunks.push(Buffer.from(chunk));
    }
    const audioBuffer = Buffer.concat(chunks);

    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': String(audioBuffer.length),
      },
    });
  } catch (error: any) {
    console.error('ElevenLabs TTS error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate speech with ElevenLabs' }, { status: 500 });
  }
}
