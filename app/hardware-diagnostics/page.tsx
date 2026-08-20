import type { Metadata } from 'next';
import { getRouteMetadata } from '../../src/lib/seo-metadata.ts';
import HardwareDiagnosticTool from '../../src/components/HardwareDiagnosticTool.tsx';

export const metadata: Metadata = getRouteMetadata('hardware-diagnostics');

export default function HardwareDiagnosticsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4">
      <HardwareDiagnosticTool standalone />
    </div>
  );
}
