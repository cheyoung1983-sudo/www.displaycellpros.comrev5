import type { Metadata } from 'next';
import { getRouteMetadata } from '../../src/lib/seo-metadata.ts';
import { BookingView } from '../../src/views/BookingView.tsx';

export const metadata: Metadata = getRouteMetadata('booking');

export default function BookingPage() {
  return <BookingView />;
}
