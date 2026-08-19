"use client";

import { useRouter } from 'next/navigation';
import SupportedDevicesDatabase from '../components/SupportedDevicesDatabase.tsx';

export function BoardDatabaseView() {
  const router = useRouter();
  return (
    <SupportedDevicesDatabase
      onSelectDeviceForIntake={() => router.push('/intake')}
      onOpenPriceCalculator={() => router.push('/price-guide')}
    />
  );
}
