import { NextRequest, NextResponse } from 'next/server';
import { formRateLimiterNext } from '../../../../src/lib/serverSecurity.ts';
import { BookingScheduleSchema } from '../../../../src/lib/schemas.ts';

export async function POST(req: NextRequest) {
  const limited = formRateLimiterNext.check(req);
  if (limited) return limited;

  try {
    const body = await req.json().catch(() => ({}));
    const parseResult = BookingScheduleSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: parseResult.error.issues[0]?.message || 'Required booking parameters missing or invalid.' },
        { status: 400 }
      );
    }

    const { date, timeSlot, dropOffType, deviceCategory, serviceTier, customerName, customerEmail, customerPhone, notes } =
      parseResult.data;

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingId = `DCP-DROP-${randomSuffix}`;

    const bookingRecord = {
      bookingId,
      date,
      timeSlot,
      dropOffType: dropOffType || 'in_person',
      deviceCategory: deviceCategory || 'iPhone / iOS Device',
      serviceTier: serviceTier || 'tier2',
      customerName,
      customerEmail,
      customerPhone,
      notes: notes || '',
      createdAt: new Date().toISOString(),
    };

    console.log('Spokane Lab Drop-Off Reservation Logged:', bookingRecord);

    return NextResponse.json({
      success: true,
      booking: bookingRecord,
    });
  } catch (error) {
    console.error('Service booking error:', error);
    return NextResponse.json({ success: false, error: 'Internal booking reservation error.' }, { status: 500 });
  }
}
