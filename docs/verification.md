# Verification Ledger

## 2026-05-11 02:32 America/Toronto

- Scope: fixer quality pass for `PPQ-2026-05-10-006`.
- Branch: `fixer/PPQ-2026-05-10-006-quality-pass-20260511-0110`.
- Local package note: the long automation worktree hit a partial `npm ci` failure after a timeout, so full verification was switched to short staging path `C:\tmp\apf-verify-0110`.
- Install evidence: `npm ci` completed in `C:\tmp\apf-verify-0110`; audit output reported 2 moderate advisories through the current Next/PostCSS dependency chain.
- Build evidence: `npm run verify` passed in `C:\tmp\apf-verify-0110`.
- Test evidence: Vitest passed `src/lib/packet.test.ts`, 10 tests.
- Type evidence: `tsc --noEmit --incremental false` passed.
- Build evidence: `next build --webpack` completed and prerendered `/` and `/_not-found`.
- Static scan evidence: source-only redaction scans passed for `src`, `docs`, and `README.md`.
- Whitespace evidence: `git diff --check` passed with line-ending warnings only.

## Vercel Handoff

- Framework preset: Next.js.
- Install command: `npm ci`.
- Build command: `npm run build`.
- Output handling: Vercel-managed Next.js output.
- Environment variables: none.
- Production URL: https://application-packet-factory.vercel.app.
- Deployment evidence for this specific quality pass is recorded in the coordination automation log after publish.
