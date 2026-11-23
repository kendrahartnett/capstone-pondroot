# RN2 owner review

Pondroot is the application. Rooted Network names its employer-connection feature.

Branch: `codex/rn2-files`, based on merged `origin/main` (`f4d247c`). Owner approved RN2 and authorized commit/push on November 22, 2026.

## Working local features

- Browser-only single-column PDF with embedded local font, selectable text and multiple pages.
- Shared content model for readable preview, PDF and clean print; excluded/empty sections omitted.
- Review required for each changed version; preparing/clearing/editing cannot authorize stale PDF output.
- Required email field for PDF download. An unchecked optional choice saves only email/permission to Neon; without it, cancellation and completion discard the address. Print and editable drafts need no email.
- Versioned JSON draft save/open, strict size/schema/ID/reference checks, replacement confirmation and failure recovery.
- Deliberate session clear removes undo history and invalidates earlier output. No hidden browser storage.
- Short file-location and application-attachment guidance.

## Evidence

- `npm test`: 30 passed across Chromium desktop, emulated iPhone 13, and 320px narrow viewport.
- Typecheck, lint and production build passed with the Neon integration and cleanup function.
- `node scripts/test-impact-live.mjs`: 8/8 live development checks passed, including actual HTTP consent, bounded retention, duplicate retention, privilege restrictions, validation, one-time retrieval, early deletion and scheduled expiry. Synthetic fixtures removed afterward.
- Development scheduled Function Trigger logged successful cleanup at 15:39 UTC on November 22, 2026; changed from initial every-minute verification to hourly cadence. pg_cron also runs while Postgres is active. No production configuration changed.
- Final closure run on November 23 repeated the 8/8 live Neon checks, typecheck, lint and production build successfully after the owner approved RN2. The final 30/30 browser suite had passed immediately before approval.
- Browser checks cover draft round trip, malformed file, replacement cancellation, clear/reopen/revise, review gating, email cancellation/focus return, PDF download, print invocation without email, stale output after editing, long pagination and clear during PDF generation.
- Axe scans and reflow checks passed in the automated suite. Actual screen-reader and physical-phone testing remain unperformed.
- Nine generated PDFs inspected with pypdf: accented name retained; final task 30 present in every long/print output; print contains no navigation or file controls.
- Both pages of desktop long PDF and browser print output rendered and visually reviewed; no clipping observed. Desktop and phone screenshots reviewed.
- Browser print layout was generated and verified. Physical printing and native print-dialog cancellation are not established by these tests.

## Impact follow-up

RN-A04 is implemented in development using the owner-selected Neon service and public deletion inbox configured privately. No résumé content is stored. Email collection is separate from download, account and matching consent. The restricted web role cannot read stored addresses. Storage failure preserves the PDF and allows retry or download without follow-up.

Contacts expire at 89 days, with hourly wake-up cleanup and six-hour development recovery history fitting within 90 days. An owner-only command removes an address on request. One-time manual contact retrieval removes it atomically before sending; automated email is not implemented and no messages were sent. See IMPACT_OPERATIONS.md for mailbox handling, monitoring, restore safeguards and production activation checks. Development completion is not a production release or a guarantee against provider outages.

## Limits

PDF font covers tested Latin/accented text. Unsupported characters produce an honest error with Print as fallback; text is never silently replaced. Imported AI-origin text is rejected in this manual-phase build; RN3 must add renewed individual review before accepting such drafts. Spanish currently covers home/navigation, with workflow translation still pending. Guidance links lead to the existing labeled future-tool screens.

## Walkthrough

Open `/resume/edit`, enter synthetic details, expand Save or open a draft, save and reopen a draft. Choose Review my résumé, confirm the wording, Prepare PDF, then Download PDF. Cancel the email form once, reopen it, enter a synthetic email and download. Print résumé works without that form. Edit a field to verify downloads require another review. Clear the session only after saving work you want to keep.
