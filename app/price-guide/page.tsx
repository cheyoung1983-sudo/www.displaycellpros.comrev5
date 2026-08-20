import type { Metadata } from 'next';
import { getRouteMetadata } from '../../src/lib/seo-metadata.ts';
import RepairEstimateCalculator from '../../src/components/RepairEstimateCalculator.tsx';

export const metadata: Metadata = getRouteMetadata('price-guide');

export default function PriceGuidePage() {
  return <RepairEstimateCalculator />;
}
