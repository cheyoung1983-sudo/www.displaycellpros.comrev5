"use client";

import { useRouter } from 'next/navigation';
import ServiceBooking from '../components/ServiceBooking.tsx';

export function BookingView() {
  const router = useRouter();
  return <ServiceBooking onSelectTracker={() => router.push('/repair-status')} />;
}
