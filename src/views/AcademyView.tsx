"use client";

import { useRouter } from 'next/navigation';
import RepairAcademy from '../components/RepairAcademy.tsx';

export function AcademyView() {
  const router = useRouter();
  return <RepairAcademy onSelectIntake={() => router.push('/intake')} />;
}
