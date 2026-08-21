"use client";

import { useEffect, useState } from 'react';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

export function VercelAnalyticsGate() {
  const [shouldMount, setShouldMount] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      setShouldMount(true);
    }
  }, []);

  if (!shouldMount) return null;

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
