import type { Metadata } from 'next';
import { getRouteMetadata } from '../../src/lib/seo-metadata.ts';
import RepairStatusTracker from '../../src/components/RepairStatusTracker.tsx';

export const metadata: Metadata = getRouteMetadata('repair-status');

export default function RepairStatusPage() {
  return <RepairStatusTracker />;
}
