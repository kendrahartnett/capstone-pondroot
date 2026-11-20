# Phase 2 review

Branch: codex/phase-2-manual-resume, based on origin/main 5296ebd. Scope: T04/T05, manual content and live preview. Owner approved the phase and requested final checks, commit and push. Actual publication evidence is recorded in the handoff.

Owner feedback: people may not know what to write in résumé sections. Current assistance is manual prompts only. Phase 4 must provide the approved selected-fact, evidence-linked AI writing suggestions with individual review. Evaluate getting-started comprehension and usefulness; do not treat the manual foundation approval as proof that blank-section support is sufficient.

Publication checkpoint, November 20: build, typecheck and lint passed. The final full browser run had 11 passes and one desktop navigation timeout, following an earlier 12/12 passing run. The affected test then passed three consecutive repetitions without code changes. Retain this as an intermittent development-server test failure; no universal reliability claim. Owner approval covers commit and push of this phase branch only.

Implemented: optional experience notes, direct writing, Contact/Introduction/Skills/Experience/Education/More, explicit training/certification distinction, partial dates, plain-text rendering, empty-section omission, current-content review invalidation and bounded undo. Shared React memory retains work across internal routes. No automatic browser persistence or remote requests for entered content. Current file saving/export remains Phase 3.

Observed: production build, standalone typecheck, ESLint and 12 Playwright cases passed. Cases run at desktop, emulated phone and 320px: independent routes, keyboard skip, home text enlargement, axe scans, exact synthetic sparse résumé facts, year-only date, preview Edit focus, internal navigation retention, empty browser storage and discovery-note separation. Initial syntax/static-component errors and preview focus failure were corrected before the final passing run. Dedicated test port 3102 prevents accidental reuse of the old project's server.

Live production preview: http://127.0.0.1:3103/resume/start. Desktop 1440px and mobile 390px layouts inspected in the browser with synthetic data. Physical devices, screen readers and intended-user evaluation have not been performed. These checks are not a full accessibility-conformance claim or release approval.

Owner walkthrough: start with optional experience notes or go directly to the editor; enter a synthetic name, GED and a real task supplied for the test; switch to Preview; use a preview Edit button; visit another Pondroot page and return; review the current résumé. Refreshing loses work in this phase; the visible notice explains this.
