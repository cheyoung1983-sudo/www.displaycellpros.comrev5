import { NextRequest, NextResponse } from 'next/server';
import { GITHUB_DEFAULT_OWNER, GITHUB_DEFAULT_REPO, getGithubToken } from '../../../../../src/lib/githubSync.ts';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const {
    deviceModel,
    ammeterDrawAmps,
    isShortToGround,
    thermalHotspotCelsius,
    notes,
    technician = 'Lead Bench Tech',
  } = body || {};
  const owner = body?.owner || GITHUB_DEFAULT_OWNER;
  const repo = body?.repo || GITHUB_DEFAULT_REPO;
  const token = getGithubToken(req);

  const logEntry = {
    id: `tel_${Date.now()}`,
    timestamp: new Date().toISOString(),
    technician,
    deviceModel: deviceModel || 'iPhone 15 Pro Max',
    ammeterDrawAmps: ammeterDrawAmps ?? 0.04,
    isShortToGround: Boolean(isShortToGround),
    thermalHotspotCelsius: thermalHotspotCelsius ?? 42,
    notes: notes || 'Bench ammeter DC power supply baseline test',
  };

  const filePath = 'telemetry/diagnostics-log.json';

  try {
    if (token) {
      let existingEntries: any[] = [];
      let fileSha: string | undefined;

      const getFileRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github+json',
          'User-Agent': 'DCP-Spokane-Lab-App',
        },
      });

      if (getFileRes.ok) {
        const fileData = (await getFileRes.json()) as any;
        fileSha = fileData.sha;
        const decoded = Buffer.from(fileData.content, 'base64').toString('utf-8');
        try {
          existingEntries = JSON.parse(decoded);
          if (!Array.isArray(existingEntries)) existingEntries = [];
        } catch {
          existingEntries = [];
        }
      }

      existingEntries.unshift(logEntry);
      const updatedJson = JSON.stringify(existingEntries.slice(0, 100), null, 2);
      const contentBase64 = Buffer.from(updatedJson, 'utf-8').toString('base64');

      const putRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github+json',
          'Content-Type': 'application/json',
          'User-Agent': 'DCP-Spokane-Lab-App',
        },
        body: JSON.stringify({
          message: `telemetry: log bench reading for ${logEntry.deviceModel} [skip ci]`,
          content: contentBase64,
          sha: fileSha,
          branch: 'main',
        }),
      });

      const putData = (await putRes.json()) as any;
      if (!putRes.ok) {
        throw new Error(putData.message || 'Failed to update telemetry log in repo');
      }

      return NextResponse.json({
        success: true,
        mode: 'live_github_api',
        path: filePath,
        commitSha: putData.commit?.sha,
        htmlUrl: putData.content?.html_url || `https://github.com/${owner}/${repo}/blob/main/${filePath}`,
        entry: logEntry,
      });
    }

    return NextResponse.json({
      success: true,
      mode: 'simulated_local',
      path: filePath,
      commitSha: `sim_tel_${Date.now().toString(16)}`,
      entry: logEntry,
      message: 'Telemetry log staged. Connect GitHub to write directly to repository.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to sync telemetry to GitHub' }, { status: 500 });
  }
}
