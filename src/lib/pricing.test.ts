import { describe, it, expect } from 'vitest';
import { calculateQuote, PRICING_TIERS, TAX_RATES } from './pricing.ts';
import { ServiceTier } from '../types.ts';

describe('Pricing calculations', () => {
  it('calculates Tier 1 Power quote with standard Spokane City tax', () => {
    const quote = calculateQuote(ServiceTier.TIER_1_POWER, '99201');
    expect(quote.partsCost).toBe(45);
    expect(quote.laborCost).toBe(27.5); // 0.5 * 55
    expect(quote.overhead).toBe(45 * 0.95);
    expect(quote.subtotal).toBeCloseTo(45 + 27.5 + 45 * 0.95, 2);
    expect(quote.tax).toBeCloseTo(quote.subtotal * TAX_RATES.SPOKANE_CITY.rate, 2);
    expect(quote.total).toBeCloseTo(quote.subtotal + quote.tax, 2);
  });

  it('adjusts parts cost for Pro Max and Ultra models', () => {
    const quoteStandard = calculateQuote(ServiceTier.TIER_2_DISPLAY, '99201', { model: 'iPhone 13' });
    const quoteProMax = calculateQuote(ServiceTier.TIER_2_DISPLAY, '99201', { model: 'iPhone 15 Pro Max' });

    expect(quoteProMax.modelAdjustment).toBe(35);
    expect(quoteProMax.partsCost).toBe(quoteStandard.partsCost + 35);
    expect(quoteProMax.total).toBeGreaterThan(quoteStandard.total);
  });

  it('adds rush and data recovery fees correctly', () => {
    const quote = calculateQuote(ServiceTier.TIER_3_BOARD, '99206', {
      isRush: true,
      isDataRecovery: true,
    });

    expect(quote.rushFee).toBe(49);
    expect(quote.dataRecoveryFee).toBe(75);
    expect(quote.subtotal).toBeGreaterThan(150);
  });

  it('applies Spokane Valley tax rate for Spokane Valley zip code', () => {
    const quote = calculateQuote(ServiceTier.TIER_1_POWER, '99206');
    expect(quote.tax).toBeCloseTo(quote.subtotal * TAX_RATES.SPOKANE_VALLEY.rate, 2);
  });
});
