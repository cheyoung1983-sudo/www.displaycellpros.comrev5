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

  const { customer_name, customer_phone, customer_email, device_summary, quoted_price, service_tier } = parseResult.data;

  const ticketId = `dcp_booking_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const bookingUrl = `https://www.displaycellpros.com/book?ticket=${ticketId}`;
  const dbTicketNumber = `DCP-${Math.floor(1000 + Math.random() * 9000)}`;

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

  try {
    const { query } = await import('../../../../src/lib/serverDb.ts');
    await query(
      `INSERT INTO repair_tickets (ticket_number, customer_name, customer_email, customer_phone, service_tier, issue_description, status, costs)
       VALUES ($1, $2, $3, $4, $5, $6, 'quote_sent', $7)`,
      [
        dbTicketNumber,
        customer_name,
        customer_email || null,
        customer_phone,
        service_tier || '',
        device_summary,
        JSON.stringify({ totalCost: quoted_price }),
      ]
    );
  } catch (dbError) {
    // The Aurora record is a durability improvement over bookingDispatchLog,
    // not a requirement for the SMS itself to have gone out — log and continue.
    console.error('Failed to persist repair_tickets row for voice booking dispatch:', dbError);
  }

  return NextResponse.json({
    success: true,
    ticketId,
    bookingUrl,
    smsSent: smsResult.sent,
    smsProvider: smsResult.provider,
  });
}
