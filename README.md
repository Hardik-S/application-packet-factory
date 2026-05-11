# Application Packet Factory

Application Packet Factory is a public, synthetic-data portfolio demo for turning a role brief and candidate fact bank into a submission checklist, resume QA checklist, and email draft preview.

## Portfolio Signal

The product demonstrates disciplined career-operations tooling rather than generic resume generation. The important behavior is the truth boundary: verified facts can be used, needs-proof facts are softened or flagged, and unsupported claims are blocked before a packet is sent. The fixer quality pass adds a reviewer action desk, per-requirement coverage, and a copy-safe Markdown packet so the app behaves like an approval workflow instead of a static checklist.

The latest quality pass also makes the artifact operable: the Markdown packet has local-only copy and download controls, the final send action inherits the blocked state when blockers exist, and requirement coverage only becomes ready when every role requirement has verified support.

## Reviewer Route

1. Start at the send-state panel. `Blocked` means the packet should not be sent yet.
2. Review the action desk. Unsupported claims must be removed; needs-proof claims require artifacts or softened wording.
3. Check requirement coverage. Each role requirement is mapped to verified, review, or blocked evidence.
4. Use the Markdown packet preview as the handoff artifact. Unsupported claims are counted but not copied into the packet body.

## File Map

- `src/data/packet.ts`: synthetic role, candidate facts, trust states, and explicit requirement support.
- `src/lib/packet.ts`: deterministic packet builder, review-plan generator, requirement coverage logic, and Markdown packet formatter.
- `src/lib/packet.test.ts`: Vitest contract tests for blocking unsupported claims, review actions, requirement coverage, and packet output.
- `src/app/PacketActions.tsx`: client-only copy/download controls for the generated Markdown handoff artifact.
- `src/app/page.tsx`: static Next.js review console using the deterministic packet model.
- `src/app/styles.css`: responsive product styling for the reviewer desk, coverage map, checklists, and packet previews.
- `docs/review-packet.example.md`: committed example of the copy-safe reviewer packet.
- `docs/fixtures/synthetic-role-brief.md`: inspectable synthetic role input used by the fixture.
- `docs/fixtures/synthetic-master-facts.json`: inspectable synthetic candidate fact bank used by the fixture.
- `docs/verification.md`: latest verification and deployment handoff ledger.
- `.github/workflows/verify.yml`: GitHub Actions gate for tests, typecheck, and production build.

## Stack Rationale

- Next.js App Router keeps the demo deployable on Vercel and leaves room for future server-side packet export.
- TypeScript models role facts, trust states, and checklist outputs explicitly.
- Fixture-first data keeps the repository public and avoids storing real personal facts, employer notes, resumes, or application history.
- Vitest covers packet-building logic because the checklist behavior is the product contract.

## Local Setup

```powershell
npm ci
npm run test
npm run typecheck
npm run build
npm run verify
```

`package.json` uses `"private": true` only to prevent accidental npm publication. The GitHub repository is public because the checked-in fixtures are synthetic and non-sensitive.

## Verification

Current verification target:

- `npm ci`
- `npm run test`
- `npm run typecheck`
- `npm run build`
- `npm run verify`
- Live HTTP check after Vercel deploy should return `200` and include `Application Packet Factory`, `Synthetic data only`, `Human approval gate before submission`, `Copy-safe Markdown artifact`, `Copy Markdown`, and `Download .md`.

Latest deployment from the fixer pass:

- Production alias: https://application-packet-factory.vercel.app
- Deployment URL: https://application-packet-factory-83cccdnss-batb4016-9101s-projects.vercel.app
- Vercel project: `application-packet-factory` / `prj_A2gh7taCkXxBSs9unJ4puL8cUnZV`
- Verified on 2026-05-11 01:12 America/Toronto with HTTP `200` and the expected product strings.

Additional deployment evidence for this artifact-action pass is recorded in `docs/verification.md` and the coordination automation logs.

Vercel handoff settings:

- Framework preset: Next.js.
- Install command: `npm ci`.
- Build command: `npm run build`.
- Output handling: Vercel-managed Next.js output.
- Environment variables: none.

## Decisions Made

- Real personal facts are intentionally excluded. A career packet tool can become sensitive quickly, so this first slice uses a synthetic role, synthetic candidate facts, and a placeholder recipient.
- The product blocks unsupported claims instead of rewriting them. That makes the artifact useful for QA and review instead of pretending every claim is equally safe.
- PMO coordination is marked `needs-proof` to show an intermediate state where wording may be useful but should not become a strong resume bullet until evidence exists.
- The email preview is included as text only. The demo does not send email, connect to mailboxes, or prepare real application artifacts.
- Requirement coverage is explicit in the fixture via `supportsRequirements`. Keyword overlap remains only as a fallback for future imported fixtures because reviewer-facing truth boundaries should not depend on accidental wording matches.
- Requirement coverage now ignores loose keyword overlap. A claim supports a requirement only when the fixture explicitly maps it through `supportsRequirements`.
- The build script uses `next build --webpack` to avoid known Turbopack path-length failures in long Windows automation worktree paths.

## Privacy Rationale

This repository is public because every fixture is synthetic. If a future version loads real resumes, master facts, emails, job leads, recruiter notes, or application history, that work should move to a private branch or private repository until redaction and consent boundaries are proven.

## Limitations

- The source files named in the fixture are synthetic docs under `docs/fixtures/`, not real application materials.
- The app does not upload resumes, parse PDFs, send email, connect to inboxes, persist state, authenticate users, or call a live AI model.
- Requirement coverage is deterministic fixture logic, not a claim of real recruiting accuracy.
- `npm audit` reports moderate transitive advisories through the current Next.js dependency set; do not force audit fixes without checking for framework downgrades or breaking changes.

## Future Work

- Add rendered resume QA checks against uploaded PDFs in a private-only workflow.
- Add role-fit diffing that shows which requirements have no verified supporting fact.
