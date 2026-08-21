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

    const { query } = await import('../../../../src/lib/serverDb.ts');
    const insertResult = await query(
      `INSERT INTO bookings (booking_id, drop_off_date, time_slot, drop_off_type, device_category, service_tier, customer_name, customer_email, customer_phone, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING booking_id, drop_off_date, time_slot, drop_off_type, device_category, service_tier, customer_name, customer_email, customer_phone, notes, created_at`,
      [
        bookingId,
        date,
        timeSlot,
        dropOffType || 'in_person',
        deviceCategory || 'iPhone / iOS Device',
        serviceTier || 'tier2',
        customerName,
        customerEmail,
        customerPhone,
        notes || '',
      ]
    );

    const row = insertResult.rows[0];
    const bookingRecord = {
      bookingId: row.booking_id,
      date: row.drop_off_date,
      timeSlot: row.time_slot,
      dropOffType: row.drop_off_type,
      deviceCategory: row.device_category,
      serviceTier: row.service_tier,
      customerName: row.customer_name,
      customerEmail: row.customer_email,
      customerPhone: row.customer_phone,
      notes: row.notes,
      createdAt: row.created_at,
    };

    return NextResponse.json({
      success: true,
      booking: bookingRecord,
    });
  } catch (error) {
    console.error('Service booking error:', error);
    return NextResponse.json({ success: false, error: 'Internal booking reservation error.' }, { status: 500 });
  }
}
