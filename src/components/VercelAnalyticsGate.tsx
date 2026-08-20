"use client";

import { useEffect, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

export function VercelAnalyticsGate() {
  const [shouldMount, setShouldMount] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV === 'production' && window.location.hostname.includes('vercel')) {
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
