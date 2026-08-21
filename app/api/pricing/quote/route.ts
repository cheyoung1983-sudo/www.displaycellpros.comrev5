/**
 * Route Handler backing the Triage AI (ElevenLabs agent) get_repair_quote
 * tool. Reuses the same calculateQuote() engine and Spokane tax tables
 * used by the rest of the app (RepairEstimateCalculator, ProjectEstimator)
 * rather than a separate pricing formula, so quotes stay consistent
 * everywhere they're generated.
 *
 * Tier 3 (motherboard/logic-board work) is intentionally unreachable via
 * repair_type here - those issues must go through escalate_tier3_ticket
 * instead of getting a binding quote, per the Triage AI operating rules.
 */
import { NextRequest, NextResponse } from 'next/server';
import { formRateLimiterNext } from '../../../../src/lib/serverSecurity.ts';
import { RepairQuoteSchema } from '../../../../src/lib/schemas.ts';
import { calculateQuote, TAX_RATES } from '../../../../src/lib/pricing.ts';
import { ServiceTier } from '../../../../src/types.ts';

const REPAIR_TYPE_TIER: Record<string, ServiceTier> = {
  battery: ServiceTier.TIER_1_POWER,
  charging_port: ServiceTier.TIER_1_POWER,
  screen_aftermarket: ServiceTier.TIER_2_DISPLAY,
  screen_oem: ServiceTier.TIER_2_DISPLAY,
  camera: ServiceTier.TIER_2_DISPLAY,
  back_glass: ServiceTier.TIER_2_DISPLAY,
};

const TIER_LABEL: Record<ServiceTier, string> = {
  [ServiceTier.TIER_1_POWER]: 'Tier 1',
  [ServiceTier.TIER_2_DISPLAY]: 'Tier 2',
  [ServiceTier.TIER_3_BOARD]: 'Tier 3',
};

const TIER_ESTIMATED_MINUTES: Record<ServiceTier, number> = {
  [ServiceTier.TIER_1_POWER]: 25,
  [ServiceTier.TIER_2_DISPLAY]: 45,
  [ServiceTier.TIER_3_BOARD]: 0,
};

// Genuine OEM parts cost more than the aftermarket baseline PRICING_TIERS
// assumes; applied only at this route layer so the core pricing.ts engine
// (and its tests) stay untouched.
const OEM_PARTS_MULTIPLIER = 1.7;

const B2B_LABOR_DISCOUNT = 0.15;

export async function POST(req: NextRequest) {
  const limited = formRateLimiterNext.check(req);
  if (limited) return limited;

  const body = await req.json().catch(() => ({}));
  const parseResult = RepairQuoteSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { success: false, error: parseResult.error.issues[0]?.message || 'Invalid quote request' },
      { status: 400 }
    );
  }

  const { device_model, repair_type, is_b2b, zip_code } = parseResult.data;
  const tier = REPAIR_TYPE_TIER[repair_type];

  const quote = calculateQuote(tier, zip_code, { model: device_model });

  let partsCost = quote.partsCost;
  if (repair_type === 'screen_oem') {
    partsCost = Math.round(partsCost * OEM_PARTS_MULTIPLIER * 100) / 100;
  }

  const laborCost = quote.laborCost;
  const discountApplied = is_b2b ? Math.round(laborCost * B2B_LABOR_DISCOUNT * 100) / 100 : 0;
  const discountedLabor = laborCost - discountApplied;

  const markupOverhead = quote.overhead;
  const subtotal = Math.round((partsCost + discountedLabor + markupOverhead) * 100) / 100;

  const isSpokaneCity = TAX_RATES.SPOKANE_CITY.zips.includes(zip_code);
  const isSpokaneValley = TAX_RATES.SPOKANE_VALLEY.zips.includes(zip_code);
  const taxRate = isSpokaneCity ? TAX_RATES.SPOKANE_CITY.rate : isSpokaneValley ? TAX_RATES.SPOKANE_VALLEY.rate : TAX_RATES.DEFAULT.rate;
  const salesTax = Math.round(subtotal * taxRate * 100) / 100;
  const totalOutTheDoor = Math.round((subtotal + salesTax) * 100) / 100;

  return NextResponse.json({
    tier: TIER_LABEL[tier],
    parts_cost: partsCost,
    labor_cost: discountedLabor,
    markup_overhead: markupOverhead,
    discount_applied: discountApplied,
    subtotal,
    wa_sales_tax_9_1: salesTax,
    total_out_the_door: totalOutTheDoor,
    estimated_duration_minutes: TIER_ESTIMATED_MINUTES[tier],
  });
}
