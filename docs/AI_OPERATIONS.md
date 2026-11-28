# RN3 AI writing setup and limits

The conversation-first résumé draft uses Claude Sonnet through `app/api/discover-skills/route.ts`. The browser sends only the exact confirmed examples shown on the consent screen. Contact fields, the full résumé, and local draft files are not sent. The client and server block obvious email addresses and phone numbers within selected story text; other sensitive text still requires the user's review. A returned suggestion is not résumé content until the user checks that specific part and chooses **Use checked parts**. Imported AI wording needs renewed review. Manual editing, printing, and files remain usable when AI is unavailable.

The consent screen starts with no examples checked. The user chooses each example before **Continue with these words** becomes available. The same client request ID is passed to the budget reservation, so a repeated request ID cannot reserve a second call. The server-side limit still applies to distinct IDs.

## Current activation state

The owner approved professional reframing with individual confirmation and a separate development evaluation ceiling of 340 total calls/$17 reserved on November 27. Normal application limits remain 20 calls/$1 reserved per UTC day. This does not authorize automatic production activation. The preliminary response containing “reliable” and “orderly spaces” is acceptable under the revised rubric; retain its original assessment as historical evidence.

AI is **off by default**. Live synthetic evaluations and a local browser-to-Neon-to-Anthropic round trip have now run; see RN3_REVIEW.md for evidence and unresolved release requirements. Mocked browser responses separately test consent, source links, user selection and stale fact handling. The route reports unavailable until all server variables are present and `PONDROOT_AI_ENABLED=true`. The local review process may enable this flag without changing production or the saved environment file.

The owner stopped further paid testing after the latest 90-output run. The final server filter contains its observed concrete overstatements, but the raw model-output gate did not pass. Do not enable public AI or claim release readiness based on containment alone. Other RN4 work can proceed while this gate remains open.

A subsequent owner-approved release-gate attempt added an exact source quote to each suggestion. The server verifies the quote belongs to a cited fact before display. The ten-case smoke succeeded, but a later run was stopped at 34/90 after an unsupported current-study claim. The development ceiling is now 450 calls/$22.50 reserved; the local ledger records 352 calls/$17.60 reserved. Public AI remains disabled. See RN3_REVIEW.md for the disposition.

## Public activation handoff

The owner wants AI available publicly. This is an activation checklist, not a statement that production is active. Confirm the exact public HTTPS origin and production deployment project first. Provision a production restricted AI database role and apply the reviewed budget schema to that database; verify `reserve(uuid)` works, the app role cannot read reservation rows, the 20-per-UTC-day/$1 cap is enforced, and cleanup runs within 90 days. Keep this separate from the impact database and résumé data.

Configure server-only production variables in the deployment service: `ANTHROPIC_API_KEY`, `AI_DATABASE_URL`, and `PONDROOT_AI_APP_ORIGIN` set to the exact public origin. Set `PONDROOT_AI_ENABLED=true` only after the release decision and production checks. For public voice also configure `DEEPGRAM_API_KEY`, `PONDROOT_VOICE_APP_ORIGIN`, and `PONDROOT_VOICE_ENABLED=true`; voice and AI share the operational reservation cap. Never copy local `.env.local` or an owner database URL into source control. Use a synthetic production request and inspect returned source links, cost counters, privacy, errors and rollback. Turning either enabled flag off is the immediate rollback.

RN3 production operations: `neondb_owner` was denied `CREATE EXTENSION pg_cron` in `postgres`, so the [ai-cleanup.ts](../functions/ai-cleanup.ts) Neon Function was deployed to production branch `br-dawn-hat-bexl7wp6` as slug `aicleanup`, using Neon's injected branch-local `DATABASE_URL`. An every-minute trigger produced a logged successful invocation, then was changed to enabled daily UTC `5 3 * * *`, path `/`. The handler requires Neon's trigger invocation header and calls only `pondroot_ai.cleanup()`. Monitor subsequent daily runs and investigate failures before the 90-day retention ceiling is at risk. A temporary HMAC-protected, read-only Vercel diagnostic proved Production connects to the production endpoint as the restricted AI role; the production alias was restored and the temporary token removed. Two old protected diagnostic deployments await owner-approved removal. Neither operational check passes the raw-model release gate.

The current raw-output evaluation failed and independent screen-reader/participant evidence is incomplete. Treat public activation as a separate explicit risk decision with those facts visible; do not describe this checkpoint as a passing release gate.

## Development setup

1. Create a dedicated restricted `pondroot_ai_app` role on the intended Neon development branch. It must have no direct table privileges. As owner, apply [db/ai-budget.sql](../db/ai-budget.sql) to that development branch only. Verify the role can execute `pondroot_ai.reserve(uuid)` and cannot select budget tables or any impact/resume data. Do not reuse the impact role or its URL.
2. In ignored `.env.local`, set `ANTHROPIC_API_KEY`, `AI_DATABASE_URL`, and `PONDROOT_AI_APP_ORIGIN` for the local server. Do not paste the key into chat, put it in a `NEXT_PUBLIC_` variable, or commit the file. Keep `PONDROOT_AI_ENABLED=false` until the database and model checks pass.
3. Review provider terms, data handling, model version, current price, and exact prompt/schema. Run a bounded synthetic smoke set with a separate written spend limit. Turn the switch on only for that reviewed development run. Production remains off until release gates are met.

The Anthropic key by itself does not make the route available. If Neon setup or automatic approval review is unavailable, keep `PONDROOT_AI_ENABLED` unset or false and continue with local mocked checks. Do not route around a denied Neon operation through another connection.

## Hard limits in this build

The database reservation is atomic and table-blind to the app role: at most **3 reservations per minute**, **20 per UTC day**, **$0.05 reserved per call**, and **$1.00 reserved per UTC day**. Failed or uncertain calls keep their reservation. The route allows up to 20 selected facts and 12,000 characters, then rejects requests above **4,000 counted input tokens**. It caps the model at **1,200 output tokens** to reduce incomplete responses observed at 800. The daily reservation is a local safety ceiling, not a provider billing limit or a promise that API prices cannot change. Recheck pricing before activation; disable the route if model price or billing behavior changes.

The prompt encourages useful professional language and modest positive qualities while forbidding invented concrete employers, titles, dates, credentials, metrics, duties, and achievements. The current unevaluated candidate permits at most three source-linked suggestions per response to reduce unsupported extras. Response schema and source IDs are validated before display. These mechanical checks cannot prove that every phrase is factually supported. Individual human confirmation and the live model evaluation in [ACCEPTANCE.md](ACCEPTANCE.md) remain mandatory. A serious fabricated claim blocks activation.

The budget tables store opaque reservation IDs, dates, counts, and reserved microdollars only. They store no résumé text, contact data, IP address, or provider response. Establish a 90-day operational metadata cleanup and verify it before production use. Review abuse controls for shared networks and the exact provider retention policy before release.

Official references consulted during implementation: [Claude Messages API](https://platform.claude.com/docs/en/api/messages), [token counting](https://platform.claude.com/docs/en/build-with-claude/token-counting), [structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs), [model IDs](https://platform.claude.com/docs/en/about-claude/models/model-ids-and-versions), and [pricing](https://platform.claude.com/docs/en/about-claude/pricing).
