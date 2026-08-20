import type { Metadata } from 'next';
import { getRouteMetadata } from '../../src/lib/seo-metadata.ts';
import RepairAnalytics from '../../src/components/RepairAnalytics.tsx';

export const metadata: Metadata = getRouteMetadata('analytics');

export default function AnalyticsPage() {
  return <RepairAnalytics />;
}
