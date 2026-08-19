import type { Metadata } from 'next';
import { getRouteMetadata } from '../../src/lib/seo-metadata.ts';
import { BoardDatabaseView } from '../../src/views/BoardDatabaseView.tsx';

export const metadata: Metadata = getRouteMetadata('board-database');

export default function BoardDatabasePage() {
  return <BoardDatabaseView />;
}
