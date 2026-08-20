import type { Metadata } from 'next';
import { getRouteMetadata } from '../../src/lib/seo-metadata.ts';
import { AcademyView } from '../../src/views/AcademyView.tsx';

export const metadata: Metadata = getRouteMetadata('academy');

export default function AcademyPage() {
  return <AcademyView />;
}
