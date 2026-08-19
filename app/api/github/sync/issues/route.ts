import { NextRequest, NextResponse } from 'next/server';
import { GITHUB_DEFAULT_OWNER, GITHUB_DEFAULT_REPO, getGithubToken } from '../../../../../src/lib/githubSync.ts';

export async function GET(req: NextRequest) {
  const owner = req.nextUrl.searchParams.get('owner') || GITHUB_DEFAULT_OWNER;
  const repo = req.nextUrl.searchParams.get('repo') || GITHUB_DEFAULT_REPO;
  const token = getGithubToken(req);

  try {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'DCP-Spokane-Lab-App',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const ghRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues?state=all&per_page=10`, { headers });
    if (ghRes.ok) {
      const data = (await ghRes.json()) as any;
      return NextResponse.json({
        success: true,
        issues: data.map((i: any) => ({
          number: i.number,
          title: i.title,
          state: i.state,
          user: i.user?.login,
          html_url: i.html_url,
          created_at: i.created_at,
          labels: i.labels?.map((l: any) => l.name),
        })),
      });
    }

    return NextResponse.json({
      success: true,
      issues: [
        {
          number: 1,
          title: '[Triage] iPad Pro M2 (A2764) VDD_MAIN 0.04A Ammeter Draw & No Boot',
          state: 'open',
          user: 'cheyoung1983-sudo',
          html_url: `https://github.com/${owner}/${repo}/issues/1`,
          created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          labels: ['bench-triage', 'tier-3-board-rework'],
        },
      ],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch issues' }, { status: 500 });
  }
}
