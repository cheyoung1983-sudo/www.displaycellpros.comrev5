import type { NextRequest } from 'next/server';
import { handleIncomingGithubWebhook } from '../../../../src/lib/githubWebhookHandler.ts';

export async function POST(req: NextRequest) {
  return handleIncomingGithubWebhook(req);
}
