import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ ticketNumber: string }> }) {
  const { ticketNumber: rawTicketNumber } = await params;
  const ticketNumber = (rawTicketNumber || '').trim().toUpperCase().slice(0, 30);

  // Default mock stage mapping for predefined tickets or custom user tickets
  const sampleTickets: Record<string, any> = {
    'DCP-8842': {
      ticketNumber: 'DCP-8842',
      customerName: 'Alex Mercer',
      deviceModel: 'iPhone 15 Pro Max',
      serviceTier: 'Tier 3 (Board Rework)',
      currentStage: 2,
      estimatedCompletionDate: 'Tomorrow at 3:15 PM (18h remaining)',
      estimated_completion: 'Tomorrow at 3:15 PM (18h remaining)',
      technicianNotes: 'Triage complete. Awaiting logic board components for VDD_MAIN short rework near U3100 PMIC.',
      telemetrySummary: {
        batteryHealthPercentage: 88,
        batteryTempCelsius: 34,
        ammeterDrawAmps: 4.8,
        isShortToGround: true,
      },
      workloadFactors: {
        queuePosition: 3,
        totalQueueJobs: 12,
        activeTechnicians: 3,
        partsInStock: true,
      },
      lastUpdated: '10 minutes ago',
    },
    'DCP-9012': {
      ticketNumber: 'DCP-9012',
      customerName: 'Sarah Jenkins',
      deviceModel: 'Samsung Galaxy S24 Ultra',
      serviceTier: 'Tier 2 (Display Renewal)',
      currentStage: 3,
      estimatedCompletionDate: 'Today at 5:30 PM (2h remaining)',
      estimated_completion: 'Today at 5:30 PM (2h remaining)',
      technicianNotes: 'Bench testing active. OEM Display Assembly installed and undergoing digitizer touch grid calibration.',
      telemetrySummary: {
        batteryHealthPercentage: 94,
        batteryTempCelsius: 31,
        ammeterDrawAmps: 0.85,
        isShortToGround: false,
      },
      workloadFactors: {
        queuePosition: 1,
        totalQueueJobs: 8,
        activeTechnicians: 4,
        partsInStock: true,
      },
      lastUpdated: '25 minutes ago',
    },
    'DCP-3109': {
      ticketNumber: 'DCP-3109',
      customerName: 'Marcus Vance',
      deviceModel: 'iPad Pro 12.9" (M2)',
      serviceTier: 'Tier 1 (Power/Port Refresh)',
      currentStage: 4,
      estimatedCompletionDate: 'Completed (Ready for Pickup)',
      estimated_completion: 'Completed (Ready for Pickup)',
      technicianNotes: 'Quality Assurance complete. Charge current nominal at 2.1A. Ready for customer pickup at Spokane Lab HQ.',
      telemetrySummary: {
        batteryHealthPercentage: 91,
        batteryTempCelsius: 28,
        ammeterDrawAmps: 2.1,
        isShortToGround: false,
      },
      workloadFactors: {
        queuePosition: 0,
        totalQueueJobs: 5,
        activeTechnicians: 3,
        partsInStock: true,
      },
      lastUpdated: '1 hour ago',
    },
  };

  if (sampleTickets[ticketNumber]) {
    // Ensure both fields exist
    const t = sampleTickets[ticketNumber];
    t.estimated_completion = t.estimated_completion || t.estimatedCompletionDate;
    t.estimatedCompletionDate = t.estimatedCompletionDate || t.estimated_completion;
    return NextResponse.json({ success: true, ticket: t });
  }

  // Dynamic mock for any other valid ticket number format
  const stages = [1, 2, 3, 4];
  const numHash = ticketNumber.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const mockStage = stages[numHash % stages.length];
  const estCompStr = mockStage === 4 ? 'Completed' : 'Within 24 Hours';

  return NextResponse.json({
    success: true,
    ticket: {
      ticketNumber,
      customerName: 'Verified Customer',
      deviceModel: 'Mobile Communications Unit',
      serviceTier: mockStage > 2 ? 'Tier 3 (Board Rework)' : 'Tier 2 (Display Renewal)',
      currentStage: mockStage,
      estimatedCompletionDate: estCompStr,
      estimated_completion: estCompStr,
      technicianNotes: `Ticket ${ticketNumber} is active in D&CP Spokane Lab. Current stage: ${mockStage}/4. Telemetry diagnostics active.`,
      telemetrySummary: {
        batteryHealthPercentage: 85 + (numHash % 12),
        batteryTempCelsius: 30 + (numHash % 10),
        ammeterDrawAmps: mockStage > 2 ? 2.45 : 0.65,
        isShortToGround: mockStage > 2,
      },
      lastUpdated: 'Just now',
    },
  });
}
