"use client";

import { useRouter } from 'next/navigation';
import AboutUs from '../components/AboutUs.tsx';

export function AboutView() {
  const router = useRouter();
  return <AboutUs onOpenBlueprint={() => router.push('/blueprint')} />;
}
