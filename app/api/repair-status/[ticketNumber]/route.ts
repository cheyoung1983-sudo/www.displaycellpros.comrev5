import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ ticketNumber: string }> }) {
  const { ticketNumber: rawTicketNumber } = await params;
  const ticketNumber = (rawTicketNumber || '').trim().toUpperCase().slice(0, 30);

  if (!ticketNumber) {
    return NextResponse.json({ success: false, error: 'Ticket number is required.' }, { status: 400 });
  }

  try {
    const { queryReadOnly } = await import('../../../../src/lib/serverDb.ts');
    const result = await queryReadOnly(
      `SELECT ticket_number, customer_name, device_model, service_tier, current_stage, status,
              estimated_completion, technician_notes, telemetry, updated_at
       FROM repair_tickets WHERE ticket_number = $1 LIMIT 1`,
      [ticketNumber]
    );

    const row = result.rows[0];
    if (!row) {
      return NextResponse.json(
        { success: false, error: `No ticket found for ${ticketNumber}.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      ticket: {
        ticketNumber: row.ticket_number,
        customerName: row.customer_name,
        deviceModel: row.device_model,
        serviceTier: row.service_tier,
        currentStage: row.current_stage,
        status: row.status,
        estimatedCompletionDate: row.estimated_completion,
        estimated_completion: row.estimated_completion,
        technicianNotes: row.technician_notes,
        telemetrySummary: row.telemetry || {},
        lastUpdated: row.updated_at,
      },
    });
  } catch (error: any) {
    console.error('Repair status lookup failed:', error);
    return NextResponse.json(
      { success: false, error: 'Repair status lookup failed.' },
      { status: 500 }
    );
  }
}
