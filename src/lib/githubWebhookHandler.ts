/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Shared GitHub App webhook receiver, ported from server.ts's
 * handleIncomingWebhook. Used by both /api/github/webhooks and
 * /api/github/webhook (alias) route handlers.
 */
import { NextRequest, NextResponse } from 'next/server';
import {
  GitHubWebhookEvent,
  GITHUB_DEFAULT_REPO,
  GITHUB_DEFAULT_OWNER,
  webhookEventsLog,
  verifyGithubWebhookSignature,
} from './githubSync.ts';

export async function handleIncomingGithubWebhook(req: NextRequest): Promise<Response> {
  const event = req.headers.get('x-github-event') || 'unknown';
  const deliveryId = req.headers.get('x-github-delivery') || `del-${Date.now()}`;
  const signature = req.headers.get('x-hub-signature-256') || undefined;
  const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;

  // Read the raw body first (needed for signature verification) then parse it -
  // order matters, must verify before trusting the parsed JSON.
  const rawBodyText = await req.text();
  const rawBody = Buffer.from(rawBodyText, 'utf-8');
  const isVerified = verifyGithubWebhookSignature(rawBody, signature, webhookSecret);

  if (webhookSecret && !isVerified) {
    console.warn(`[GitHub Webhook] Unauthorized signature rejection for delivery ${deliveryId}`);
    return NextResponse.json(
      { error: 'Invalid X-Hub-Signature-256 HMAC digest', deliveryId },
      { status: 401 }
    );
  }

  let payload: any = {};
  try {
    payload = rawBodyText ? JSON.parse(rawBodyText) : {};
  } catch {
    payload = {};
  }

  const action = payload.action;
  const senderLogin = payload.sender?.login || 'github-app';
  const repoName = payload.repository?.name || GITHUB_DEFAULT_REPO;
  const repoFullName = payload.repository?.full_name || `${GITHUB_DEFAULT_OWNER}/${repoName}`;

  let summary = `GitHub event "${event}" received from @${senderLogin}`;
  if (event === 'ping') {
    summary = `Webhook ping acknowledged for repository ${repoFullName} (Hook ID: ${payload.hook_id || 'active'})`;
  } else if (event === 'push') {
    const commitCount = payload.commits?.length || 1;
    const branch = (payload.ref || '').replace('refs/heads/', '');
    const headMsg = payload.head_commit?.message || 'Updated repository files';
    summary = `Pushed ${commitCount} commit(s) to ${branch}: "${headMsg.slice(0, 70)}"`;
  } else if (event === 'issues') {
    summary = `Issue #${payload.issue?.number} (${action}): "${payload.issue?.title?.slice(0, 65)}"`;
  } else if (event === 'issue_comment') {
    summary = `Comment on Issue #${payload.issue?.number} by @${senderLogin}: "${payload.comment?.body?.slice(0, 60)}"`;
  } else if (event === 'pull_request') {
    summary = `PR #${payload.pull_request?.number} (${action}): "${payload.pull_request?.title?.slice(0, 65)}"`;
  } else if (event === 'workflow_run') {
    summary = `Workflow "${payload.workflow?.name}" ${action} (${payload.workflow_run?.conclusion || payload.workflow_run?.status})`;
  } else if (event === 'star') {
    summary = `Repository ${repoFullName} starred by @${senderLogin}`;
  } else if (event === 'installation') {
    summary = `GitHub App installation ${action} for ${payload.installation?.account?.login}`;
  }

  const eventRecord: GitHubWebhookEvent = {
    id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    event,
    action,
    deliveryId,
    receivedAt: new Date().toISOString(),
    sender: {
      login: senderLogin,
      avatar_url: payload.sender?.avatar_url,
    },
    repo: {
      name: repoName,
      full_name: repoFullName,
    },
    summary,
    verified: isVerified,
    payload,
  };

  // Prepend to event log and keep maximum 100 entries
  webhookEventsLog.unshift(eventRecord);
  if (webhookEventsLog.length > 100) {
    webhookEventsLog.pop();
  }

  console.log(`[GitHub Webhook] Processed ${event} (${deliveryId}) for ${repoFullName}`);

  return NextResponse.json({
    status: 'success',
    deliveryId,
    event,
    receivedAt: eventRecord.receivedAt,
    summary,
  });
}
