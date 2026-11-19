# Pondroot MVP data contract

Contract version 1. This is a requirements specification for later implementation, not executable code, a database migration or evidence of passing validation. It makes the approved memory-only résumé, local editable file, consented AI boundary and operational-only server store explicit. The PRD contains the same contract. Schema version 1 identifies the future file format; PRD version 1.5 identifies this document revision.

## Ownership and storage boundaries

| Data group | Authority and lifetime | May leave the browser |
| --- | --- | --- |
| Active résumé, source facts and review state | User-controlled browser memory; deliberately exported editable file only | Chosen current content in local PDF/print/draft; exact selected source facts to AI after consent |
| Contact details | User-entered browser memory and chosen local output | Excluded from normal AI, operational counters and analytics |
| Pending/rejected suggestions, private reflection notes and processing state | Browser memory only; not copied automatically into résumé or draft | Only the exact user-reviewed selected facts cross the AI boundary; no automatic note sharing |
| Document answers and session progress | Browser memory; cleared with session | No draft, AI, operational-record or analytics payload |
| Reviewed lessons/resources/rules/videos | Versioned editorial content with reviewer/source/review and expiry metadata | Reviewed destinations or click-to-load video only as specified |
| Rate counters and funded AI reservations | Server-only operational store with reviewed expiry | No résumé, contact, document answers or prompt/response text |
| Analytics | Reviewed fixed event allowlist and retention | No personal content, local IDs, draft/AI IDs, filenames or identity linkage |

There is no user/account table, server résumé table, résumé upload endpoint or browser autosave store. Local record IDs relate items within a draft; they are not visitor IDs and must never be used for telemetry or cross-session identity. Import does not upload file bytes or filenames.

## Types and validation rules

An optional field may be absent or null; empty optional content is omitted from employer output. Omission never creates sample text or guessed facts. Required schema structure is distinct from required résumé content: an empty draft is valid. Strings are Unicode plain text, not HTML or executable content. Render safely without interpreting markup. Preserve names, accents and meaningful punctuation. Do not autocorrect a person’s facts.

IDs are opaque local strings, 1–64 ASCII letters, digits, hyphen or underscore; unique across the entire draft, including ReviewedText items. References must resolve to the expected collection and IDs are not filenames, names or email addresses. Revisions are nonnegative safe integers; source fact revisions start at 1. Increment relevant revisions on change. Arrays have explicit bounds below; no arbitrary recursive objects or extra unknown keys. Reject unsupported versions rather than guessing conversions.

| Shared type | Fields and allowed values | Rules |
| --- | --- | --- |
| Source reference | factId: local ID; factRevision: positive integer | Must resolve to the current confirmed SourceFact revision; no model-created IDs accepted as new evidence |
| Partial date | year: integer 1900–2100; month: optional integer 1–12 | Year-only is valid; month requires year; no inferred January or exact day. Optional dates can be omitted; current experience uses isCurrent, not an invented end date. The range is an initial validation limit to review if it excludes legitimate history. |
| Review metadata | state: authored, suggested, accepted, rejected or needs_review; reviewedContentRevision: integer or null | Authored is for user-written wording, not a factual verification certificate. AI origin remains AI after editing. No timestamp, signature or imported flag establishes truth. |
| ReviewedText | id; text: up to 2000 characters; included: boolean; origin: user, ai or ai_edited; sourceRefs: up to 20 source references; review: review metadata | AI/AI-edited text needs at least one current supporting fact and individual explicit acceptance before export. User text may have no sourceRefs. Text edits to AI items require Use my edited wording; typing alone does not accept. |

## Canonical résumé and source records

| Record | Fields and types | Required behavior |
| --- | --- | --- |
| Active draft | contentRevision: integer; contact: Contact; introduction: optional ReviewedText; skills: ReviewedText array; experiences: Experience array; education: Education array; training: Training array; additionalSections: AdditionalSection array; sourceFacts: SourceFact array; sectionOrder: allowed section-key array | Shared canonical content for editing and the derived export model. Contact fields do not become source facts automatically. Opaque IDs remain local. |
| Contact | displayName: optional string up to 200; email: optional string up to 254; phone: optional string up to 80; cityRegion: optional string up to 200; professionalLink: optional URL up to 2048 | All fields user-controlled. No full street address, date of birth, persona age, government number or criminal-history field. No mandatory combination of contact methods. Validate email gently without silent rewriting; phone permits international notation. Links allow only http/https; never fetch them automatically. |
| SourceFact | id; revision: positive integer; text: up to 2000 characters; topic: experience, education, training, skill or other; recordId: optional local ID; origin: user_entered or user_confirmed_extraction | Contains confirmed user-supplied evidence. recordId, if present, resolves to the corresponding record. AI extraction remains a pending candidate until the user confirms it; it cannot confirm itself or invent a fact. A title alone establishes no duties. |
| Experience | id; included: boolean; title: optional string up to 200; organization: optional string up to 200; location: optional string up to 200; startDate/endDate: optional PartialDate; isCurrent: boolean; bullets: ReviewedText array; sourceFactIds: local ID array | Title/organization/location/dates are entered or explicitly confirmed by the user; no invented employer or title. Experience type is not required; no mandatory institutional label or explanation of gaps. Omit unavailable fields. |
| Education | id; included: boolean; credential: optional ReviewedText; institution: optional string up to 200; completionDate: optional PartialDate; details: ReviewedText array; sourceFactIds: local ID array | GED works without an institution or graduation year. A model-suggested GED label follows the same ReviewedText acceptance rules; no invented degree or completion. |
| Training | id; included: boolean; kind: training or certification; name: optional ReviewedText; issuer: optional string up to 200; completionDate/expiryDate: optional PartialDate; details: ReviewedText array; sourceFactIds: local ID array | Never promote training to certification. Certification must be explicitly supported; no certificate numbers or scans. Unknown expiry is omitted rather than guessed. |
| AdditionalSection | id; included: boolean; heading: user-entered string up to 120; entries: ReviewedText array | Bounded optional professional content only. No automatic private reflection, unsupported achievements or new feature-specific tracking. |
| Section order | Ordered subset of contact, introduction, skills, experience, education, training, additional | Each key at most once; schema validates order, renderer omits empty sections. One original single-column template remains. No drag-and-drop or template gallery is implied by this data field. |

Source facts are evidence for wording, not independently verified employment. Manual entries remain possible without AI. If the user changes a referenced fact, all dependent AI items become needs_review and lose export eligibility; unrelated contact changes do not invalidate experience approvals. Clearly identify affected visible content and allow review/removal/manual replacement; do not silently drop previously accepted content.

## Consent suggestions and revision control

| Record | Fields and types | Boundary and lifecycle |
| --- | --- | --- |
| Session guard | generation: integer; pendingOperations: bounded local operation records; lastDraftDownloadRevision: integer or null | Memory only, never serialized. Clear/new/replacement invalidates earlier generation. A response must match generation, content revision and referenced fact revisions before use. |
| Consented request | schemaVersion: 1; requestId: opaque per-request ID; task: skills_and_wording; selectedFacts: array of factId, factRevision and exact text; sourceContentRevision: integer | Review exact outgoing fact text before each send. No complete résumé, Contact object, unselected notes, document answers, filename, persona age or local file bytes. requestId is transient transport correlation, not telemetry identity. Fixed processing instructions/configuration are server-controlled. |
| Pending suggestion | id; text; destination: introduction, skill, experience_bullet, education_credential, training_name or additional_entry; recordId: optional existing local ID; sourceRefs; review.state: suggested | Source references must resolve to sent facts and remain current. Destination must be allowed. The browser resolves recordId locally from supporting facts or the user’s explicit choice of an existing record; the model does not invent or select unseen record IDs. Ambiguous placement requires a choice or omission. Reject unsupported/contradictory or malformed output before display; syntactic validity alone does not establish factual support. |
| Accepted or edited suggestion | ReviewedText with origin ai or ai_edited; current sourceRefs; review.state accepted; reviewedContentRevision matching the item review | Individual Use this or Use my edited wording only. Accepting one item approves no other item. Rejected items are not exported. Pending suggestion objects are not canonical résumé content. |
| Final review | reviewedContentRevision: integer or null | Current eligible résumé content must be reviewed before PDF/export. Any export-content change invalidates final review. |
| PDF result | operationId; generation; contentRevision; status: idle, preparing, ready or failed; local object reference when ready | Memory only; no PDF bytes, object URLs or paths in editable files, API payloads or logs. Discard stale results and release obsolete references. Print uses the same eligible content; pagination is checked separately. |

Preview and employer export derive from included user-authored items and individually accepted AI items with current source support. The draft may preserve chosen needs_review wording for recovery, visibly unapproved and excluded from employer output. When a whole experience/section is excluded, its items do not enter export. A user can reject all suggestions and finish manually. Clearing invalidates AI, import and PDF operations before resetting content; it cannot erase downloaded files or retract dispatched provider processing.

## Editable file version 1

| Field | Type | Contents and validation |
| --- | --- | --- |
| kind | Literal pondroot.editable-draft | Reject other file kinds; explain PDF versus draft |
| schemaVersion | Integer 1 | Reject unsupported versions safely; no guessed migration |
| contentRevision | Nonnegative safe integer | Local revision only, not a user identifier |
| resume | Canonical résumé fields excluding sourceFacts | Includes chosen fields and current reviewed text/review state, including chosen needs_review items for recovery; excludes transient suggestion queue and rejected unused text |
| sourceFacts | SourceFact array | Evidence intentionally entered/confirmed for the résumé; relationships preserved. No automatic copying of separate private reflection notes |
| review | reviewedContentRevision: integer or null | Historical review state only. On import it cannot authorize final export |

Export UTF-8 JSON locally with a neutral filename. Explain the file is unencrypted and may expose contact information, source facts and unapproved chosen wording. Import is atomic: validate the entire file and relationships first, show a minimal summary, obtain replacement confirmation, then create a new session generation. On failure/cancel keep current work untouched. Revalidate support, mark imported AI/AI-edited text needs_review, reset final review and require individual renewed acceptance; authored text remains editable without an AI approval gate. Unknown fields, duplicate IDs, dangling references and inconsistent states fail validation without execution or network requests.

Exclude session guards, pending operations, PDF references/bytes, consent/request identifiers, provider envelopes, analytics identifiers, document answers/progress, private reflection notes, secrets, recordings and automatic job-description history. No account ID, server save location or hidden recovery token exists. User-entered source text can itself contain sensitive details; minimization notices do not guarantee automatic redaction.

## Initial field and file bounds

Maximum local editable file 1 MiB UTF-8; 20 experience records; 20 education records; 20 training records; 5 additional sections; 100 source facts; 200 ReviewedText items across the draft; 30 bullets/details/entries per record; 30 skills. Limits apply together, not as allocation promises. Review arrays are capped by referenced facts; links and optional strings use the field limits above. Entire parsed structure has maximum depth 8. No unbounded objects, recursive references or silent truncation.

AI request maximum 20 selected facts and 12000 total characters of selected fact text; response maximum 30 candidate items, each within ReviewedText limits. This bounds payloads and validation, not UI batch size or spending authorization. Use existing manual fallback when input exceeds limits; ask the user to select less, never silently send a shortened payload different from consent. These are initial contract limits to fixture-test in the assigned implementation phases; revise deliberately if legitimate résumés are excluded, with schema/evidence updates. Call/token/cost caps and exact provider output-token limits remain separate reviewed configuration required before paid use.

## Operational records and editorial content

| Record | Allowed fields | Exclusions and constraints |
| --- | --- | --- |
| BudgetPeriod | periodId; startsAt/endsAt UTC; currency; capMicrounits; reservedMicrounits; spentMicrounits; enabled | Integer nonnegative monetary amounts, bounded configured caps and atomic reservation checks. No personal content. Reserve a conservative maximum call cost from configured input/output bounds before dispatch; unsettled calls remain accounted. No paid calls while numerical evaluation/production ceilings are unset. |
| CallReservation | opaque server reservationId; periodId; idempotencyKey; reservedMicrounits; actualMicrounits nullable; tokenUsage nullable; state reserved, dispatched, settled or uncertain; createdAt/expiresAt UTC | A retry cannot obtain unaccounted paid dispatch. Unknown outcome stays conservatively charged/reserved until reconciled; no content in keys. Retention/cleanup and provider backup limits must be reviewed before activation. |
| RateBucket | short-lived keyed bucketHash; windowStart/windowEnd UTC; count; expiresAt | Pseudonymous abuse metadata only; no raw IP, résumé ID, browser draft ID, contact or analytics join. Exact retention and fair shared-network handling require setup review. |
| EditorialRecord | contentId; version; kind lesson, resource, video or document_rule; title/body; officialDestination/sourceRefs; supportedCase/jurisdiction; reviewer; reviewedAt/reviewDueAt; state candidate, approved, expired or withdrawn; textEquivalent/captions fields where applicable | Version-controlled reviewed content, no participant answers. Only current approved content publishes. Links are allowlisted and reviewed; availability alone is not approval. No CMS or admin account is added. |
| Analytics event | Existing approved event name; fixed application/content version and approved stage/resource/video/failure codes where relevant | Follow existing event allowlist and reviewed retention. No free text, fields from the résumé, document choices, filenames, local IDs or AI request correlation IDs. No identity graph or new events are added by this schema. |

These operational shapes define boundaries for later implementation, not a provisioned database or completed retention review. Precise service retention, credentials, numerical budgets and cleanup execution remain activation gates. They do not block documentation or manual local foundations.

## Contract acceptance and traceability

| ID | Planned observable acceptance | Existing evidence and phase |
| --- | --- | --- |
| DC01 | Empty/sparse valid draft works; omitted optional fields produce no sample data or inferred dates/claims; Unicode and partial dates survive | V01/V04/V08/V10; implementation 2–3 |
| DC02 | Duplicate IDs, unknown keys, dangling/revision-mismatched references, deep/oversized files and unsupported versions fail safely with no replacement | V08/V09; implementation 3 |
| DC03 | Exact consent payload excludes normal contact fields and unselected/private/document/file data; no send on open/cancel; response references only selected current evidence | V02/V05/V20; implementation 4 |
| DC04 | Individual approval and edited confirmation required; source edits invalidate dependents; importing accepted flags cannot bypass renewed review | V03/V04/V08; implementation 2–4 |
| DC05 | Save/open round trip preserves chosen content/evidence without credentials, pending requests, PDFs or hidden storage; import failure/cancel retains current work | V07/V08/V09; implementation 3 |
| DC06 | Clear/replace/content edit during AI/import/PDF work prevents stale restoration or outdated export | V04/V06/V11; implementation 3–4 |
| DC07 | Concurrent operational reservations enforce configured ceilings; uncertain dispatch/retry cannot free unaccounted spend; expired metadata cleanup is verified | V12/V13/V20/V23; implementation 4 and 8–10 |
| DC08 | Document answers stay memory-only; expired/withdrawn editorial content cannot publish; analytics uses only existing approved fields and events | V14/V15/V19/V20/V21; implementation 5–8 |

DC01–DC08 refine existing requirements, not new stories or completed tests. All checks are PLANNED / NOT RUN. Earlier JA01–JA12 and existing G0–G6 release gates remain unchanged. Fictional persona ages never become production data requirements.
