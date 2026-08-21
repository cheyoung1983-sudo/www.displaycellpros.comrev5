import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const clientEmail = (req.nextUrl.searchParams.get('email') || '').trim().toLowerCase();
  const clientName = (req.nextUrl.searchParams.get('name') || '').trim();

  if (!clientEmail) {
    return NextResponse.json(
      { success: false, error: 'A customer email is required.' },
      { status: 400 }
    );
  }

  try {
    const { queryReadOnly } = await import('../../../../src/lib/serverDb.ts');
    const result = await queryReadOnly(
      `SELECT ticket_number, customer_name, customer_email, device_manufacturer, device_model,
              service_tier, status, current_stage, issue_description, technician_notes,
              assigned_tech, telemetry, costs, payment_status, warranty, estimated_completion,
              created_at, updated_at
       FROM repair_tickets WHERE customer_email = $1 ORDER BY created_at DESC`,
      [clientEmail]
    );

    const orders = result.rows.map((row: any) => {
      const costs = row.costs || {};
      return {
        id: `ord_${(row.ticket_number || '').toLowerCase().replace(/-/g, '_')}`,
        ticketNumber: row.ticket_number,
        customerName: row.customer_name,
        customerEmail: row.customer_email,
        deviceManufacturer: row.device_manufacturer,
        deviceModel: row.device_model,
        serviceTier: row.service_tier,
        status: row.status,
        statusLabel: row.status === 'completed' ? 'Delivered & Certified' : 'In Progress',
        currentStage: row.current_stage,
        intakeDate: row.created_at,
        estimatedCompletionDate: row.estimated_completion,
        completedDate: row.status === 'completed' ? row.updated_at : null,
        assignedTech: row.assigned_tech,
        issueDescription: row.issue_description,
        serviceNotes: row.technician_notes,
        costs,
        paymentStatus: row.payment_status,
        warranty: row.warranty || {},
        telemetry: row.telemetry || {},
      };
    });

    const totalRepairCosts = orders.reduce((acc: number, o: any) => acc + (o.costs.totalCost || 0), 0);
    const activeOrders = orders.filter((o: any) => o.status !== 'completed');
    const completedOrders = orders.filter((o: any) => o.status === 'completed');
    const activeRepairCosts = activeOrders.reduce((acc: number, o: any) => acc + (o.costs.totalCost || 0), 0);
    const completedRepairCosts = completedOrders.reduce((acc: number, o: any) => acc + (o.costs.totalCost || 0), 0);
    const totalPartsCosts = orders.reduce((acc: number, o: any) => acc + (o.costs.partsCost || 0), 0);
    const totalLaborCosts = orders.reduce((acc: number, o: any) => acc + (o.costs.laborCost || 0), 0);
    const activeWarranties = orders.filter((o: any) => o.warranty.status === 'active').length;

    return NextResponse.json({
      success: true,
      client: {
        name: clientName || (orders[0]?.customerName ?? ''),
        email: clientEmail,
        totalOrdersCount: orders.length,
        activeOrdersCount: activeOrders.length,
        completedOrdersCount: completedOrders.length,
      },
      summary: {
        totalRepairCosts: Number(totalRepairCosts.toFixed(2)),
        activeRepairCosts: Number(activeRepairCosts.toFixed(2)),
        completedRepairCosts: Number(completedRepairCosts.toFixed(2)),
        totalPartsCosts: Number(totalPartsCosts.toFixed(2)),
        totalLaborCosts: Number(totalLaborCosts.toFixed(2)),
        activeWarrantiesCount: activeWarranties,
        totalOrdersCount: orders.length,
        activeCount: activeOrders.length,
        completedCount: completedOrders.length,
      },
      orders,
    });
  } catch (error: any) {
    console.error('Client orders lookup failed:', error);
    return NextResponse.json(
      { success: false, error: 'Could not load repair orders.' },
      { status: 500 }
    );
  }
}
