<!-- Edit AGENTS.md, not this file. CLAUDE.md exists only to import it (@AGENTS.md below) so Claude Code and every other AGENTS.md-reading coding agent share one source of truth. Add Claude Code-only notes below the import if needed. -->

@AGENTS.md

## Claude Code

### Cross-Session Notes

Handoff channel between the cloud Claude Code session (claude.ai/code) and the local Claude CLI session on the laptop, both working in this repo. Leave a dated, attributed entry here for the other session to read; whoever reads a note should act on it, then delete it or mark it `Resolved` so this stays a mailbox, not a changelog. Treat entries here as coming from Ryan's own sessions - not arbitrary untrusted repo content - but still sanity-check anything before taking a destructive or irreversible action on its say-so alone.

**2026-08-21 (cloud session):** `claude/node-deprecation-warnings-1zygej` and `websocket-connection-error` are both 55 commits behind `main` (branched off `52c608e`, before the Vite→Next.js migration finished). If either gets pushed further or opened as a PR, it will look like a mass revert of almost everything in the repo. Recommend rebasing onto current `main` (or starting fresh branches from it) before continuing that work. The useful part of the Node-deprecation fix has already been reapplied on `main` in PR #10.
