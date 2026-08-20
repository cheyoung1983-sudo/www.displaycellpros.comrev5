/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Shared GitHub App webhook + repo sync state, ported from server.ts.
 * In-memory webhookEventsLog is a module-level singleton - same
 * per-instance/best-effort caveat it had under the Express server.
 */
import crypto from 'crypto';
import type { NextRequest } from 'next/server';

export interface GitHubWebhookEvent {
  id: string;
  event: string;
  action?: string;
  deliveryId: string;
  receivedAt: string;
  sender: {
    login: string;
    avatar_url?: string;
  };
  repo: {
    name: string;
    full_name: string;
  };
  summary: string;
  verified: boolean;
  payload: any;
}

export const GITHUB_DEFAULT_OWNER = process.env.GITHUB_REPO_OWNER || 'cheyoung1983-sudo';
export const GITHUB_DEFAULT_REPO = process.env.GITHUB_REPO_NAME || 'D-CP-LLC-Repair-Portal-001';

// In-memory store for recent webhook events (kept in FIFO buffer)
export const webhookEventsLog: GitHubWebhookEvent[] = [
  {
    id: 'evt_init_01',
    event: 'push',
    action: 'commit',
    deliveryId: 'del-a8f192-dcp-bench',
    receivedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    sender: {
      login: 'cheyoung1983-sudo',
      avatar_url: 'https://github.com/cheyoung1983-sudo.png',
    },
    repo: {
      name: 'D-CP-LLC-Repair-Portal-001',
      full_name: 'cheyoung1983-sudo/D-CP-LLC-Repair-Portal-001',
    },
    summary: 'Pushed commit: Integrate OpenAI API and configure Dcp GitHub OAuth',
    verified: true,
    payload: {
      ref: 'refs/heads/main',
      head_commit: {
        message: 'Integrate OpenAI API and configure Dcp GitHub OAuth',
        id: 'b0ce9a6',
        timestamp: new Date().toISOString(),
      },
    },
  },
  {
    id: 'evt_init_02',
    event: 'issues',
    action: 'opened',
    deliveryId: 'del-f9382b-dcp-triage',
    receivedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    sender: {
      login: 'cheyoung1983-sudo',
      avatar_url: 'https://github.com/cheyoung1983-sudo.png',
    },
    repo: {
      name: 'D-CP-LLC-Repair-Portal-001',
      full_name: 'cheyoung1983-sudo/D-CP-LLC-Repair-Portal-001',
    },
    summary: 'Issue #1 opened: [Triage] iPad Pro M2 (A2764) VDD_MAIN 0.04A Ammeter Draw & No Boot',
    verified: true,
    payload: {
      issue: {
        number: 1,
        title: '[Triage] iPad Pro M2 (A2764) VDD_MAIN 0.04A Ammeter Draw & No Boot',
        state: 'open',
        html_url: 'https://github.com/cheyoung1983-sudo/D-CP-LLC-Repair-Portal-001/issues/1',
        labels: [{ name: 'triage' }, { name: 'tier-3-board-rework' }],
      },
    },
  },
];

export function verifyGithubWebhookSignature(
  rawBody: Buffer | undefined,
  signature: string | undefined,
  secret: string | undefined
): boolean {
  if (!secret) return true; // If secret is not set, accept but log verification status
  if (!rawBody || !signature) return false;
  try {
    const hmac = crypto.createHmac('sha256', secret);
    const digest = 'sha256=' + hmac.update(rawBody).digest('hex');
    const signatureBuffer = Buffer.from(signature);
    const digestBuffer = Buffer.from(digest);
    if (signatureBuffer.length !== digestBuffer.length) return false;
    return crypto.timingSafeEqual(signatureBuffer, digestBuffer);
  } catch (err) {
    console.warn('Webhook signature check exception:', err);
    return false;
  }
}

export function getGithubToken(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return process.env.GITHUB_TOKEN || process.env.GITHUB_PERSONAL_ACCESS_TOKEN || null;
}
