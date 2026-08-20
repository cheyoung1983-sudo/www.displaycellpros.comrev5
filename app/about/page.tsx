import type { Metadata } from 'next';
import { getRouteMetadata } from '../../src/lib/seo-metadata.ts';
import { AboutView } from '../../src/views/AboutView.tsx';

export const metadata: Metadata = getRouteMetadata('about');

export default function AboutPage() {
  return <AboutView />;
}
