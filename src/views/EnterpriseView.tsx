"use client";

import { useRouter } from 'next/navigation';
import ClassyOverviewView from '../components/ClassyOverviewView.tsx';

export function EnterpriseView() {
  const router = useRouter();
  return (
    <ClassyOverviewView
      onNavigateToIntake={() => router.push('/intake')}
      onNavigateToBooking={() => router.push('/booking')}
    />
  );
}
