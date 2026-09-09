import { NextRequest, NextResponse } from 'next/server';
import { aiRateLimiterNext, withTimeout } from '../../../../src/lib/serverSecurity.ts';
import { SupportChatSchema } from '../../../../src/lib/schemas.ts';

const SUPPORT_CHAT_MODEL = 'anthropic/claude-sonnet-5';

export async function POST(req: NextRequest) {
  const limited = aiRateLimiterNext.check(req);
  if (limited) return limited;

  try {
    const body = await req.json().catch(() => ({}));
    const parseResult = SupportChatSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: parseResult.error.issues[0]?.message || 'Message is required' },
        { status: 400 }
      );
    }

    const { message, conversationHistory, ticketId } = parseResult.data;

    {
      try {
        const { generateText } = await import('ai');

        const historyMessages: any[] = [];
        if (Array.isArray(conversationHistory)) {
          for (const m of conversationHistory) {
            historyMessages.push({
              role: m.sender === 'user' ? 'user' : 'assistant',
              content: m.text || '',
            });
          }
        }

        const systemPrompt = `
You are Ryan Young, Founder & Lead Systems Engineer at Display & Cell Pros LLC (Spokane Lab, WA; UEI: VAJXG5MNYQK8, EIN: 39-5018763, UBI: 605 985 265).
You are answering a live support chat with a customer.
Key Details:
- D&CP provides hardware diagnostics, display renewals, battery replacements, and Tier 3 micro-soldering (VDD_MAIN shorts, BGA reballing, data recovery).
- Spokane Lab Address: 115 S Adams St, Spokane, WA 99201.
- Turnaround: Tier 1 (1-2 hours), Tier 2 (Same day), Tier 3 (24-48 hours).
- Warranty: Lifetime warranty on OEM-spec parts and workmanship.
- Compliance: Washington RCW 19.415 data privacy compliant, Combat Veteran & Enrolled Tribal Member owned.
${ticketId ? `- Active Customer Ticket ID referenced: ${ticketId}` : ''}

Respond concisely (2-4 sentences max), professionally, and directly in character as Ryan Young.
Provide clear technical guidance, reassure data privacy, and suggest next steps (e.g. submitting an Intake form or using the Repair Status tracker).
          `;

        const aiPromise = generateText({
          model: SUPPORT_CHAT_MODEL,
          instructions: systemPrompt,
          messages: [...historyMessages, { role: 'user', content: message }],
          temperature: 0.4,
          maxOutputTokens: 300,
        });

        const response = await withTimeout(aiPromise, 6000, null);
        const replyText = response?.text;

        if (replyText) {
          return NextResponse.json({
            success: true,
            reply: replyText,
            technician: {
              name: 'Ryan Young',
              title: 'Founder & Lead Systems Engineer',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
            },
          });
        }
      } catch (aiErr) {
        console.warn('Support chat AI call failed, falling back to rule-based technician response:', aiErr);
      }
    }

    // Smart fallback responses if OPENAI_API_KEY is not set
    let reply =
      'Thank you for contacting Spokane Lab HQ. Our bench technicians are standing by. For immediate status updates, please check the Repair Status Tracker or submit a formal Intake Form.';
    const lower = message.toLowerCase();

    if (lower.includes('status') || lower.includes('ticket') || lower.includes('dcp-')) {
      reply =
        "I can assist with ticket telemetry! Please ensure your Ticket ID (e.g., DCP-8842) is entered into our 'Repair Status Tracker' tab for real-time oscilloscope and voltage readings directly from our bench.";
    } else if (lower.includes('price') || lower.includes('cost') || lower.includes('quote') || lower.includes('how much')) {
      reply =
        'Our pricing is transparent: Tier 1 (Power/Battery) starts around $65–$85, Tier 2 (OLED Display) starts around $145–$185, and Tier 3 (Logic Board micro-soldering) is custom evaluated after diagnostic triage. You can use our Repair Estimate Calculator for an instant quote.';
    } else if (lower.includes('data') || lower.includes('privacy') || lower.includes('passcode') || lower.includes('safe')) {
      reply =
        'Data security is our top priority. We operate under strict RCW 19.415 compliance. We never ask for device passcodes for standard hardware repairs unless calibration is required.';
    } else if (lower.includes('hour') || lower.includes('open') || lower.includes('location') || lower.includes('spokane')) {
      reply = 'Our Spokane Lab at 115 S Adams St is open Mon-Fri, 8:00 AM – 6:00 PM PST. Live bench technicians are on duty during these hours!';
    } else if (lower.includes('water') || lower.includes('liquid') || lower.includes('short') || lower.includes('soldering')) {
      reply =
        'For liquid damage or board shorts, do NOT attempt to charge the device. Bring or ship it to Spokane Lab immediately for ultrasonic cleaning and rosin cloud thermal isolation.';
    }

    return NextResponse.json({
      success: true,
      reply,
      technician: {
        name: 'Ryan Young',
        title: 'Founder & Lead Systems Engineer',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      },
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      {
        success: false,
        reply: 'Our bench network experienced a transient signal interrupt. Please retry or transmit an email inquiry.',
        technician: {
          name: 'Spokane Lab Support',
          title: 'Engineering Queue',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
        },
      },
      { status: 500 }
    );
  }
}
