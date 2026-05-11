# Application Packet Factory

Application Packet Factory is a public, synthetic-data portfolio demo for turning a role brief and candidate fact bank into a submission checklist, resume QA checklist, and email draft preview.

## Portfolio Signal

The product demonstrates disciplined career-operations tooling rather than generic resume generation. The important behavior is the truth boundary: verified facts can be used, needs-proof facts are softened or flagged, and unsupported claims are blocked before a packet is sent.

## Stack Rationale

- Next.js App Router keeps the demo deployable on Vercel and leaves room for future server-side packet export.
- TypeScript models role facts, trust states, and checklist outputs explicitly.
- Fixture-first data keeps the repository public and avoids storing real personal facts, employer notes, resumes, or application history.
- Vitest covers packet-building logic because the checklist behavior is the product contract.

## Local Setup

```powershell
npm install
npm run test
npm run build
```

## Verification

Current verification target:

- `npm run test`
- `npm run build`
- Live HTTP check after Vercel deploy should return `200` and include `Application Packet Factory` plus `Synthetic data only`.

## Decisions Made

- Real personal facts are intentionally excluded. A career packet tool can become sensitive quickly, so this first slice uses a synthetic role, synthetic candidate facts, and a placeholder recipient.
- The product blocks unsupported claims instead of rewriting them. That makes the artifact useful for QA and review instead of pretending every claim is equally safe.
- PMO coordination is marked `needs-proof` to show an intermediate state where wording may be useful but should not become a strong resume bullet until evidence exists.
- The email preview is included as text only. The demo does not send email, connect to mailboxes, or prepare real application artifacts.

## Privacy Rationale

This repository is public because every fixture is synthetic. If a future version loads real resumes, master facts, emails, job leads, recruiter notes, or application history, that work should move to a private branch or private repository until redaction and consent boundaries are proven.

## Future Work

- Add markdown export for a submission packet.
- Add rendered resume QA checks against uploaded PDFs in a private-only workflow.
- Add role-fit diffing that shows which requirements have no verified supporting fact.
