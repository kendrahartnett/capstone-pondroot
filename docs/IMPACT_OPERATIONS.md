# Optional impact follow-up

RN2 uses Neon only for the separately consented, one-time check-in. Download email without this permission stays in browser memory. Résumés, draft files, discovery notes, IP addresses and employer profiles are not stored in this table. Account and matching permission are separate later features.

## Data and retention

`db/impact.sql` defines the email, consent version/time, opaque contact ID and deletion deadline. Duplicate requests do not extend retention. The app role can call `collect` only: it cannot read contacts, delete them or send mail. Requests allow only email, explicit true consent and the supported notice version, with a 2 KB request limit and same-origin check. Collection is capped at 1,000 retained contacts and 30 new contacts per minute. These limits reduce abuse; they do not verify ownership of an email address.

Delete active records at 89 days. An hourly Neon Function Trigger runs cleanup even if Postgres has scaled to zero; pg_cron also cleans every minute while the database is active. The configured development recovery history is six hours, leaving time within the 90-day maximum. Do not increase recovery history or copy contact-bearing branches without revisiting this limit. Never restore expired contacts into service: run cleanup before re-enabling collection after a restore. No exported contact lists or long-lived terminal captures.

Collection refuses new records when the cleanup heartbeat is over two hours old. Provider outages still require an operator response: check scheduler errors and usage limits daily while collecting real contacts; disable collection and repair cleanup promptly if it fails. A heartbeat alone does not prove the wake-up trigger is healthy—also inspect its successful function runs. Production alerting and a recovery rehearsal are release activation checks, not established by the development test.

## Configuration

Copy the names in `.env.example` into a private environment file. Never commit connection strings. The web app gets only the restricted `IMPACT_DATABASE_URL`, public `IMPACT_PRIVACY_EMAIL`, exact `IMPACT_APP_ORIGIN`, and the enable flag. The owner URL belongs only in the local operator environment, never the public app host. Configure the scheduler through Neon's branch-scoped function environment, not the browser.

Development setup is on `vercel-dev`; production is unchanged. The owner approved a brief development restart to enable pg_cron for `neondb`. Apply the schema as owner after creating the restricted `pondroot_impact_app` role with no contact table access. Enable pg_cron and its database setting before applying the final schedule statement. Deploy `functions/impact-cleanup.ts` to slug `impactcleanup`; `node scripts/bundle-cleanup.mjs` creates its bundled entry under ignored `test-results/cleanup`. Zip `index.mjs` at the archive root. Set an enabled Function Trigger to `0 * * * *`, path `/`. The handler requires Neon's platform-provided trigger header and returns no contact content. Verify a successful scheduled run before enabling collection.

Official references: [Neon scheduled functions](https://neon.com/docs/compute/functions/triggers/schedule), [function bundling](https://neon.com/docs/compute/functions/deploy). Do not treat development configuration as authorization to deploy production or provision paid services.

## Deletion inbox and owner workflow

The configured email is public in the download form. A dedicated Pondroot inbox is recommended for continuity and separation from personal mail; the owner-approved existing inbox works for development. No mail server or automatic email sender is required. Enable two-step verification and check requests every working day.

1. For a deletion request from the same address, run `node scripts/impact-admin.mjs delete`, enter the address and confirm DELETE. If the request comes from someone else, ask the address owner to send it; do not ask for identification documents. Do not reveal whether an address was present.
2. Aim to handle requests within two working days. Confirm completion manually only after checking the operation succeeded. Do not send messages through development tests.
3. Clear the terminal and remove the request/response from mailbox trash after handling, subject to the mailbox provider's recovery policy. The 90-day database limit does not automatically delete Gmail messages or provider backups; do not claim otherwise.
4. `node scripts/impact-admin.mjs health` checks the last database cleanup. Check the Neon `impactcleanup` function logs separately for scheduled runs.
5. For an authorized one-time manual check-in, `list` displays IDs/dates only. `take` atomically removes one contact and displays its email once. Send at most one message, immediately, then clear the terminal and delete temporary copies/sent-mail copies. A failed send is not a reason to reconstruct the removed record. Automated mail delivery is not implemented.

Before real-user activation, rehearse this workflow, confirm the monitored public inbox, production secrets/origin, six-hour-or-shorter recovery policy, wake-up schedule and operational monitoring. Keep collection disabled until those checks are verified. PDF, Print and local drafts remain usable without impact storage.

## Checks

`node scripts/test-impact-live.mjs` uses unique synthetic example.test records, checks actual consent storage, duplicate retention, restricted permissions, invalid version rejection, one-time retrieval, early deletion, scheduled expiry and the local HTTP endpoint, then removes its fixtures. It requires local operator credentials and a running preview at port 3002 (or PLAYWRIGHT_BASE_URL). Never point it at production.
