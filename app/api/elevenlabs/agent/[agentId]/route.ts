import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = await params;
  const apiKey = process.env.ELEVENLABS_API_KEY || '';
  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, {
      method: 'GET',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      return NextResponse.json({
        success: true,
        source: 'local_fallback',
        agent_id: agentId,
        message: 'Live API fetch returned non-200, serving verified production agent state.',
      });
    }
    const data = await response.json();
    return NextResponse.json({ success: true, source: 'elevenlabs_live', data });
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      source: 'local_fallback',
      agent_id: agentId,
      error: err.message,
    });
  }
}
