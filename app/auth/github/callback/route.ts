import type { NextRequest } from 'next/server';
import { handleGithubOAuthCallback } from '../../../../src/lib/githubOAuthCallback.ts';

export async function GET(req: NextRequest) {
  return handleGithubOAuthCallback(req);
}
