import type { Metadata } from 'next';
import { getRouteMetadata } from '../../src/lib/seo-metadata.ts';
import IntakeForm from '../../src/components/IntakeForm.tsx';

export const metadata: Metadata = getRouteMetadata('intake');

export default function IntakePage() {
  return <IntakeForm />;
}
