import type { Metadata } from 'next';
import { getRouteMetadata } from '../../src/lib/seo-metadata.ts';
import ContactSupport from '../../src/components/ContactSupport.tsx';

export const metadata: Metadata = getRouteMetadata('support');

export default function SupportPage() {
  return <ContactSupport />;
}
