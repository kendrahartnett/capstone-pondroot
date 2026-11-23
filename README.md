<p align="center">
  <img src="public/brand/pondroot-wordmark.png" alt="Pondroot" width="320">
</p>

<p align="center"><strong>A trusted bridge between overlooked talent and real employment opportunities.</strong></p>

Pondroot helps people turn overlooked experience into recognized skills, prepare for real opportunities, and build pathways into employment. It is designed first for justice-impacted adults returning to the workforce, while remaining useful to anyone whose experience does not fit neatly into a conventional résumé.

Pondroot is not just a résumé builder. The product vision connects three parts of employment readiness:

1. **Recognize what you can do** through guided strengths discovery.
2. **Prepare for real applications** with a truthful résumé and practical hiring guidance.
3. **Choose pathways to opportunity** through the future Rooted Network of verified fair-chance partners.

## Why Pondroot exists

People returning to work after incarceration often carry valuable experience from paid work, informal work, caregiving, volunteering, institutional assignments, education, and daily responsibility. Traditional hiring systems may overlook that experience, while unfamiliar online applications, applicant tracking systems, file uploads, and résumé conventions add another barrier.

Pondroot gives users a calm, dignified place to describe what they have actually done, recognize transferable skills, and prepare materials they control. The experience never requires incarceration disclosure to create a résumé and never invents qualifications, employment, dates, duties, credentials, achievements, or metrics.

## Product direction

The current design direction is **Stillwater**, expressed through Pondroot's dark water-inspired surfaces, bright green identity, roots, growth, clay, and the mural-inspired Rooted Network welcome experience. Task screens remain quieter than the expressive home artwork so users can focus on one decision at a time.

The interface is designed for mobile use, limited digital confidence, lower reading burden, keyboard access, screen readers, visible focus, narrow reflow, and reduced motion. English and Spanish are supported throughout the current experience.

## Current build status

Pondroot is being delivered in bounded, reviewable checkpoints. The repository currently contains the completed RN1 and RN2 foundations. RN3 has not started.

| Checkpoint | Status | Outcome |
| --- | --- | --- |
| RN1 — Design alignment | Complete | Rooted Network home, responsive navigation, Stillwater visual system, English/Spanish interface |
| RN2 — Résumé files | Complete | Manual résumé journey, live preview, editable local drafts, browser PDF, print, download consent, and short-lived impact follow-up storage |
| RN3 — AI and voice | Next | Supported writing suggestions, conversational type/voice discovery, transcript confirmation, evidence-linked review, and manual fallback |
| RN4 — Accounts | Planned | Optional sign-in, explicit cloud résumé saving, personal area, recovery, export, and deletion |
| RN5 — Rooted Network | Planned | Verified partner inventory, matching opt-in, exact profile preview, and user-approved introductions |
| RN6 — Guidance and release | Planned | ATS and application lessons, document help, support resources, written interview practice, and end-to-end release evidence |

See [docs/PHASES.md](docs/PHASES.md) for checkpoint scope and evidence requirements.

## What works today

- Guest-first use with no account requirement.
- Manual résumé creation without incarceration disclosure.
- Optional strengths reflection that never enters the résumé automatically.
- Editable contact, profile, skills, experience, education, and training sections.
- Live résumé preview across desktop, mobile, and narrow screens.
- One original, readable, single-column résumé format.
- Versioned editable draft download and validated local draft reopening.
- Browser-generated PDF using reviewed résumé content.
- Print without providing an email address.
- PDF download after email validation, with a separate optional impact follow-up choice.
- English and Spanish navigation, forms, review states, file controls, errors, and PDF headings.
- Shared-device clearing and stale-output protection.
- Independent entry points for Documents and Transparent Hiring Information, currently presented as future-tool previews.

## What is intentionally not implemented yet

- AI-assisted résumé writing or skill suggestions.
- Voice transcription or conversational coaching.
- User accounts, authentication, cloud résumé storage, or a persistent dashboard.
- Candidate profiles, employer matching, or partner introductions.
- Live employer inventory or automatic job applications.
- Full document guidance, ATS curriculum, or written interview-practice content.
- Production deployment, paid AI calls, analytics, or real-world outreach.

These capabilities remain in the approved direction, but they must pass their assigned privacy, safety, accessibility, operational, and evidence gates before release.

## Trust and safety principles

Pondroot treats user control as a product requirement:

- **Truth before polish:** AI must never invent or inflate a claim.
- **Evidence-linked suggestions:** future AI suggestions must point back to user-confirmed facts.
- **Individual control:** users accept, edit, or reject suggestions one at a time; nothing is silently approved.
- **Manual completion:** résumé creation must remain usable when AI, speech, storage, or network services fail.
- **No required incarceration disclosure:** justice history is not needed to build a résumé or determine eligibility.
- **Minimal data:** ordinary guest résumé content stays in browser memory unless the user deliberately saves a local draft.
- **Separate consent:** PDF impact follow-up, account creation, cloud saving, matching, and each introduction are different decisions.
- **No hidden sharing:** a future partner receives only the exact profile the user reviewed and approved.
- **No guaranteed outcomes:** Pondroot does not promise an ATS score, interview, match, or job.

## Files, email, and privacy

PDF generation and printing happen in the browser; Pondroot does not upload or email the résumé merely because a user downloads it.

- **Print résumé:** no email required.
- **Save editable draft:** no email required; the file remains under the user's control.
- **Download PDF:** requires a valid email address under the current product decision.
- **Impact follow-up:** a separate unchecked choice asks permission for at most one message. Choosing No still allows the download and does not retain the address for follow-up.
- **Retention:** an address retained with permission is deleted after the permitted follow-up or within 90 days at most, with an earlier deletion-request process.

Impact follow-up data is operationally isolated from résumé content, accounts, analytics, and future matching. See [docs/IMPACT_OPERATIONS.md](docs/IMPACT_OPERATIONS.md) for the implementation boundary and owner procedures.

## Architecture

The current application uses a guest-first browser model:

```text
User-entered facts
      │
      ▼
In-memory résumé draft ──► Live preview
      │                         │
      ├──► Editable local file  ├──► Browser PDF
      │                         └──► Print
      │
      └──► Clear session

PDF download email ──► Separate consent boundary ──► Short-lived Neon record
Résumé content ─────────────────────────────────────► Never enters that record
```

Current technology:

- Next.js 16, React 19, and TypeScript 6.
- Plain CSS with locally served Manrope and Source Sans 3 fonts.
- `pdf-lib` and a bundled résumé font for browser PDF generation.
- Zod validation for versioned editable draft files.
- Neon serverless storage only for separately consented impact follow-up records.
- Playwright and axe-core for journey, responsive, keyboard, accessibility, file, PDF, and consent checks.

Future Claude Sonnet integration will use a server-only boundary, exact selected-data consent, numeric usage caps, source-linked suggestions, and strict stale-response protection. Future account and Rooted Network data will use separate authorization and consent domains; guest work must never be uploaded automatically.

## Local development

### Requirements

- Node.js 24.18.0
- npm 11.16.0
- Chromium installed for Playwright tests

### Install and run

```bash
npm ci
npx playwright install chromium
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000).

Manual résumé, local draft, PDF, and print features need no service credentials. Optional impact follow-up storage requires private Neon configuration; use [.env.example](.env.example) as the variable reference and never commit a real `.env` file.

### Checks

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

The latest RN2 review completed 33 browser checks across desktop, mobile, and 320px layouts, plus type checking, linting, production build, and synthetic Neon validation. Automated checks supplement—but do not replace—physical-device, screen-reader, content-review, and intended-user evidence.

## Repository guide

| Document | Purpose |
| --- | --- |
| [Build brief](docs/BUILD_BRIEF.md) | Current product behavior, scope, design, technology, and boundaries |
| [Screen flow](docs/SCREEN_FLOW.md) | Detailed end-to-end screens, decisions, recovery, accounts, and Rooted Network flow |
| [Data contract](docs/DATA_CONTRACT.md) | Résumé schema, validation, consent, lifecycle, and future account boundaries |
| [Acceptance](docs/ACCEPTANCE.md) | Testable user outcomes, safety requirements, and release gates |
| [Phases](docs/PHASES.md) | RN1–RN6 implementation sequence and recorded evidence |
| [Development](docs/DEVELOPMENT.md) | Installed toolchain, commands, local behavior, and testing limits |
| [RN2 review](docs/RN2_REVIEW.md) | Evidence and limitations for the completed résumé-file checkpoint |
| [Impact operations](docs/IMPACT_OPERATIONS.md) | Neon setup, retention, deletion, cleanup, and production activation checks |

## Contributing and build discipline

Read [AGENTS.md](AGENTS.md) and the current checkpoint documents before changing the application. Work is intentionally phase-bounded: build one approved checkpoint, run meaningful checks, present the working result for owner review, then commit and push only the reviewed files.

Use synthetic people and data in tests, screenshots, examples, and public evidence. Never commit credentials, real résumés, research records, personal exports, API content, or private planning files.

## Product statement

> People already have strengths. Pondroot helps make those strengths visible, prepares people for real applications, and—through the Rooted Network vision—builds a careful bridge to employers ready to recognize overlooked talent.

Pondroot is an employment-readiness capstone under active development. It does not provide legal advice, submit applications, verify employment eligibility, or guarantee employment.
