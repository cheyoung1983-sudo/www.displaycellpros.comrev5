import type { Metadata } from 'next';
import { getRouteMetadata } from '../../src/lib/seo-metadata.ts';
import Auth0FlowsHub from '../../src/components/Auth0FlowsHub.tsx';

export const metadata: Metadata = getRouteMetadata('auth0-flows');

export default function Auth0FlowsPage() {
  return <Auth0FlowsHub />;
}
