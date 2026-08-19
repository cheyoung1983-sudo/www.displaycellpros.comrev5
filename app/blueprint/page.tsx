import type { Metadata } from 'next';
import { getRouteMetadata } from '../../src/lib/seo-metadata.ts';
import CompanyBlueprintGovernance from '../../src/components/CompanyBlueprintGovernance.tsx';

export const metadata: Metadata = getRouteMetadata('blueprint');

export default function BlueprintPage() {
  return <CompanyBlueprintGovernance />;
}
