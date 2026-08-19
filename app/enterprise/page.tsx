import type { Metadata } from 'next';
import { getRouteMetadata } from '../../src/lib/seo-metadata.ts';
import { EnterpriseView } from '../../src/views/EnterpriseView.tsx';

export const metadata: Metadata = getRouteMetadata('enterprise');

export default function EnterprisePage() {
  return (
    <div className="max-w-7xl mx-auto px-4">
      <EnterpriseView />
    </div>
  );
}
