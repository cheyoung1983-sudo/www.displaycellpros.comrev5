/**
 * Route Handler backing the Triage AI (ElevenLabs agent) dispatch_booking_link
 * tool. Sends the booking/waiver link via Twilio SMS when configured; logs
 * and no-ops gracefully otherwise (same pattern as the Stripe/GitHub
 * webhook handlers in this repo).
 */
import { NextRequest, NextResponse } from 'next/server';
import { formRateLimiterNext } from '../../../../src/lib/serverSecurity.ts';
import { DispatchBookingLinkSchema } from '../../../../src/lib/schemas.ts';
import { verifyTriageToolSecret, sendBookingSms, recordBookingDispatch } from '../../../../src/lib/triageAiTools.ts';

export async function POST(req: NextRequest) {
  const unauthorized = verifyTriageToolSecret(req);
  if (unauthorized) return unauthorized;

  const limited = formRateLimiterNext.check(req);
  if (limited) return limited;

  const body = await req.json().catch(() => ({}));
  const parseResult = DispatchBookingLinkSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { success: false, error: parseResult.error.issues[0]?.message || 'Invalid dispatch request' },
      { status: 400 }
    );
  }

  const { customer_name, customer_phone, device_summary, quoted_price, service_tier } = parseResult.data;

  const ticketId = `dcp_booking_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const bookingUrl = `https://www.displaycellpros.com/book?ticket=${ticketId}`;

  const smsResult = await sendBookingSms({
    toPhone: customer_phone,
    bookingUrl,
    quotedPrice: quoted_price,
    serviceTier: service_tier || 'repair',
  });

  recordBookingDispatch({
    id: ticketId,
    receivedAt: new Date().toISOString(),
    customerName: customer_name,
    customerPhone: customer_phone,
    deviceSummary: device_summary,
    quotedPrice: quoted_price,
    serviceTier: service_tier || '',
    smsSent: smsResult.sent,
    smsProvider: smsResult.provider,
  });

  return NextResponse.json({
    success: true,
    ticketId,
    bookingUrl,
    smsSent: smsResult.sent,
    smsProvider: smsResult.provider,
  });
}
