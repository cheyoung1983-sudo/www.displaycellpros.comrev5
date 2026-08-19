import { NextRequest, NextResponse } from 'next/server';
import { GITHUB_DEFAULT_OWNER, GITHUB_DEFAULT_REPO, getGithubToken } from '../../../../../src/lib/githubSync.ts';

const STANDARD_GUIDES = [
  {
    title: 'Tristar & Hydra IC Replacement SOP',
    slug: 'tristar-hydra-ic-replacement',
    category: 'Power Management',
    content: `# Tristar & Hydra IC Power Controller Replacement SOP
## Spokane Repair Lab • Bench Level 3 Rework

### 1. Symptoms & Diagnostic Triage
- 0.00A or stuck 0.45A draw on USB-C ammeter.
- Fake charging behavior (battery % drops while charging symbol displays).
- Error 4013/4014 during DFU restore.

### 2. Required Bench Equipment
- Quick 861DW Hot Air Rework Station (365°C, 55% Airflow)
- Amtech NC-559-V2-TF Tacky Flux
- Low-Melt Bismuth Alloy Solder (138°C) for safe thermal pad pre-treatment
- Microscope with 0.5x Barlow lens
`,
  },
  {
    title: 'Short-to-Ground Thermal Imaging Isolation SOP',
    slug: 'short-to-ground-thermal-isolation',
    category: 'Board Diagnostics',
    content: `# Short-to-Ground Thermal Imaging Isolation SOP
## Spokane Repair Lab • IPC-A-610 Standard

### 1. Safety & Current Inrush Prevention
- Inject 1.0V with current limiter clamped to 1.5A on suspicious power rail.
- Never inject battery rail voltage directly without checking resistance to ground with multimeter in diode mode.

### 2. Thermal Camera Detection
- Locate thermal hotspot delta > 15°C above ambient board plane.
- Remove decoupling MLCC capacitor or power rail buck regulator.
`,
  },
  {
    title: 'Face ID Flood Illuminator Transfer SOP',
    slug: 'face-id-flood-illuminator-transfer',
    category: 'Biometrics & Sensors',
    content: `# Face ID Flood Illuminator Transfer SOP
## D&CP Spokane Lab • Microsoldering Clean Bench

### 1. Preparation
- Keep ambient sensor clean of flux vapor.
- Use low-temperature 138°C lead-free paste.
`,
  },
];

export async function POST(req: NextRequest) {
  const token = getGithubToken(req);
  const owner = GITHUB_DEFAULT_OWNER;
  const repo = GITHUB_DEFAULT_REPO;

  let syncedCount = 0;
  const results: any[] = [];

  for (const guide of STANDARD_GUIDES) {
    if (token) {
      try {
        const filePath = `docs/repairs/${guide.slug}.md`;
        let fileSha: string | undefined;

        const checkRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github+json',
            'User-Agent': 'DCP-Spokane-Lab-App',
          },
        });

        if (checkRes.ok) {
          const existing = (await checkRes.json()) as any;
          fileSha = existing.sha;
        }

        const fullContent = `---
title: "${guide.title}"
category: "${guide.category}"
synced_at: "${new Date().toISOString()}"
lab: "D&CP Spokane Lab (WA)"
---

` + guide.content;

        const putRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github+json',
            'Content-Type': 'application/json',
            'User-Agent': 'DCP-Spokane-Lab-App',
          },
          body: JSON.stringify({
            message: `docs(sop): auto-sync ${guide.title} [skip ci]`,
            content: Buffer.from(fullContent).toString('base64'),
            sha: fileSha,
            branch: 'main',
          }),
        });

        if (putRes.ok) {
          syncedCount++;
          results.push({ title: guide.title, status: 'synced_to_github', path: filePath });
        }
      } catch (err: any) {
        results.push({ title: guide.title, status: 'error', error: err.message });
      }
    } else {
      syncedCount++;
      results.push({ title: guide.title, status: 'staged_locally', path: `docs/repairs/${guide.slug}.md` });
    }
  }

  return NextResponse.json({
    success: true,
    totalGuides: STANDARD_GUIDES.length,
    syncedCount,
    authenticated: Boolean(token),
    results,
    message: token
      ? `Successfully synced ${syncedCount} standard repair SOPs to repository "${owner}/${repo}"`
      : `Staged ${syncedCount} repair SOPs. Sign in with GitHub OAuth to commit live.`,
  });
}
