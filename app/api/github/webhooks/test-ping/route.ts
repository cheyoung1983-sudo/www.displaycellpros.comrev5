import { NextRequest, NextResponse } from 'next/server';
import {
  GitHubWebhookEvent,
  GITHUB_DEFAULT_OWNER,
  GITHUB_DEFAULT_REPO,
  webhookEventsLog,
} from '../../../../../src/lib/githubSync.ts';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const deliveryId = `ping-test-${Date.now()}`;
  const senderName = body?.sender || 'cheyoung1983-sudo';
  const customMessage = body?.message || 'Spokane Repair Lab Webhook Diagnostics Ping';

  const testEvent: GitHubWebhookEvent = {
    id: `evt_ping_${Date.now()}`,
    event: 'ping',
    action: 'test',
    deliveryId,
    receivedAt: new Date().toISOString(),
    sender: {
      login: senderName,
      avatar_url: `https://github.com/${senderName}.png`,
    },
    repo: {
      name: GITHUB_DEFAULT_REPO,
      full_name: `${GITHUB_DEFAULT_OWNER}/${GITHUB_DEFAULT_REPO}`,
    },
    summary: `Live Test Ping received: "${customMessage}"`,
    verified: true,
    payload: {
      zen: 'Approachable is better than simple.',
      hook_id: 1048291,
      hook: {
        type: 'App',
        name: 'Dcp Webhook Receiver',
        active: true,
        events: ['push', 'issues', 'pull_request', 'workflow_run'],
        config: {
          content_type: 'json',
          url: `${process.env.APP_URL || ''}/api/github/webhooks`,
        },
      },
    },
  };

  webhookEventsLog.unshift(testEvent);
  return NextResponse.json({
    status: 'ok',
    message: 'Test ping webhook dispatched successfully',
    event: testEvent,
  });
}
