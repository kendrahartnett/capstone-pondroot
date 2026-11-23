# Pondroot phases and checkpoints
November 20, 2026 — Pondroot implementation sequence

The product releases are MVP, Phase 2 improvement and Phase 3 network growth. The implementation checkpoints below divide MVP into reviewable work. They do not claim implementation or authorize starting a phase.

| Checkpoint | Outcome | Required evidence |
| --- | --- | --- |
| RN1 Design alignment | Mural inspired welcome, simple navigation and calm responsive workspace | Desktop/mobile walkthrough, keyboard/focus/reflow and copy review |
| RN2 Files | Local draft, PDF, Print and required download email with separate impact permission | Round trip, cancellation, malformed files, stale output, PDF content and print without email |
| RN3 AI and voice | Supported wording, conversational speak/type and transcript confirmation | Separate mock/live AI evidence, exact consent, fact invalidation, voice denial/failure and accessibility |
| RN4 Accounts | Optional sign in, explicit cloud save, personal area, recovery/export/deletion | Cross account authorization, concurrent edits, interrupted upload, sign out and deletion |
| RN5 Rooted Network | Verified inventory, profile preview, matching opt in and approved introductions | Consent revocation, partner suspension, expiry, access isolation and honest empty states |
| RN6 Guidance and end to end release | ATS/application lessons, documents, resources and complete bridge journey | Editorial review, intended user tasks, device checks and release risk review |

MVP includes RN1–RN6. Phase 2 expands coaching, readiness checklists and pilot quality. Phase 3 adds moderated employer self service and broader matching based on pilot evidence. AI interview simulation, automatic submission, broad marketplace and paid coaching are outside MVP.
Reestimate the expanded scope before setting a delivery date. Verified partners and an operational owner are required for a real connection pilot. Mock employers cannot substitute for that gate.

Before each checkpoint read AGENTS, README, BUILD_BRIEF, ACCEPTANCE, DATA_CONTRACT and SCREEN_FLOW. Inspect Git status and remote baseline; preserve unrelated/private work; use a fresh codex/ branch when implementation is requested. Run meaningful actual checks, present a preview, behavior, limits and owner walkthrough. After explicit approval commit only reviewed files and push, verify the tip and stop. Merge/deployment and the next phase require their own instruction.
Historical evidence remains in phase review records and Git; this sequence replaces earlier implementation ordering without erasing history.

## RN2 review status

RN2 was approved by the owner on November 22, 2026, with commit and push authorized. Local drafts, PDF, Print and optional impact consent are working. Neon development storage, early deletion, one-time contact retrieval and scheduled cleanup are verified with synthetic data. Final closure checks on November 23 passed: 30 browser checks, 8 live synthetic Neon checks, typecheck, lint and production build. See [RN2 review](RN2_REVIEW.md) for evidence and limits, and [impact operations](IMPACT_OPERATIONS.md) for owner instructions and production activation checks. Production is unchanged. RN3 AI/voice has not started.

Owner follow-up on November 23 identified that file actions were too difficult to find from the editor preview. RN2 now links directly from Preview to review/print/download and provides a jump to the labeled file controls on the review page. The review requirement remains intact. Affected responsive tests and build checks passed before the fix was pushed.

## RN1 recorded evidence

Owner approved the Rooted Network visual direction on November 20, 2026, then requested shorter home copy and an English/Español switch. The revised home and navigation were reviewed in desktop and narrow mobile browser views. Rooted Network navigation, résumé preparation routing, Spanish selection, page language updates, visible keyboard focus and 320 CSS pixel reflow were observed. The Spanish switch currently translates the home and navigation and clearly states that the remaining tools are still in English. Typecheck, lint and production build passed on November 21, 2026. Commit and push were explicitly approved; their results are recorded in the commit history and remote branch.
