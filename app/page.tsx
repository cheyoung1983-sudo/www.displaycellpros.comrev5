import type { Metadata } from 'next';
import { getRouteMetadata } from '../src/lib/seo-metadata.ts';
import { HomePageContent } from '../src/components/HomePageContent.tsx';

export const metadata: Metadata = getRouteMetadata('home');

export default function HomePage() {
  return <HomePageContent />;
}
