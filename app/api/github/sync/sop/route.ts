import { NextRequest, NextResponse } from 'next/server';
import {
  GITHUB_DEFAULT_OWNER,
  GITHUB_DEFAULT_REPO,
  getGithubToken,
  webhookEventsLog,
} from '../../../../../src/lib/githubSync.ts';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { title, slug, content, category = 'Board Rework', author = 'Ryan Young' } = body || {};
  const owner = body?.owner || GITHUB_DEFAULT_OWNER;
  const repo = body?.repo || GITHUB_DEFAULT_REPO;
  const token = getGithubToken(req);

  if (!title || !content) {
    return NextResponse.json({ error: 'Title and content are required to sync an SOP' }, { status: 400 });
  }

  const safeSlug = (slug || title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  const filePath = `docs/repairs/${safeSlug}.md`;
  const markdownHeader = `---
title: "${title}"
category: "${category}"
author: "${author}"
updated_at: "${new Date().toISOString()}"
lab: "D&CP Spokane Lab (WA)"
---

`;
  const fullContent = markdownHeader + content;
  const contentBase64 = Buffer.from(fullContent, 'utf-8').toString('base64');

  try {
    if (token) {
      // 1. Check if file already exists to get its SHA
      let fileSha: string | undefined;
      const getFileRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github+json',
          'User-Agent': 'DCP-Spokane-Lab-App',
        },
      });

      if (getFileRes.ok) {
        const existingData = (await getFileRes.json()) as any;
        fileSha = existingData.sha;
      }

      // 2. Put file to repository
      const putRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github+json',
          'Content-Type': 'application/json',
          'User-Agent': 'DCP-Spokane-Lab-App',
        },
        body: JSON.stringify({
          message: `docs(sop): sync ${title} SOP [skip ci]`,
          content: contentBase64,
          sha: fileSha,
          branch: 'main',
        }),
      });

      const putData = (await putRes.json()) as any;
      if (!putRes.ok) {
        throw new Error(putData.message || 'Failed to commit file to GitHub');
      }

      // Register synthetic webhook push event
      webhookEventsLog.unshift({
        id: `evt_sync_${Date.now()}`,
        event: 'push',
        action: 'commit',
        deliveryId: `sync-${Date.now()}`,
        receivedAt: new Date().toISOString(),
        sender: {
          login: author || 'cheyoung1983-sudo',
          avatar_url: 'https://github.com/cheyoung1983-sudo.png',
        },
        repo: { name: repo, full_name: `${owner}/${repo}` },
        summary: `Auto-synced SOP "${title}" to ${filePath}`,
        verified: true,
        payload: { commit: putData.commit },
      });

      return NextResponse.json({
        success: true,
        mode: 'live_github_api',
        path: filePath,
        commitSha: putData.commit?.sha,
        htmlUrl: putData.content?.html_url || `https://github.com/${owner}/${repo}/blob/main/${filePath}`,
        message: `Successfully synced "${title}" to ${filePath} in repository`,
      });
    }

    // Local simulation mode when no token is present
    return NextResponse.json({
      success: true,
      mode: 'simulated_local',
      path: filePath,
      commitSha: `sim_${Date.now().toString(16)}`,
      htmlUrl: `https://github.com/${owner}/${repo}/blob/main/${filePath}`,
      message: `Document staged for sync to ${filePath}. Sign in with GitHub OAuth to commit live to the repository.`,
    });
  } catch (err: any) {
    console.error('GitHub SOP Sync Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to sync repair SOP to GitHub repository' },
      { status: 500 }
    );
  }
}
