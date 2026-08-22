#!/bin/bash
set -euo pipefail

# Regenerates .vercel/project.json (gitignored, so it doesn't survive
# between ephemeral sandbox sessions) so the Vercel CLI resolves to the
# real production project without needing an interactive `vercel link`.
# Safe to re-run: always overwrites with the same known-good values.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

mkdir -p "$CLAUDE_PROJECT_DIR/.vercel"
cat > "$CLAUDE_PROJECT_DIR/.vercel/project.json" << 'JSON'
{
  "orgId": "team_zl2oSyklLa3nDVTel7ImA4rV",
  "projectId": "prj_xKfQG5dMAYI5vIBWvufNVHe4hPiV",
  "projectName": "cheyoung1983-sudo-www.displaycellpros.comrev5"
}
JSON
