# Local development

Development uses Node 24.18.0 and npm 11.16.0 with dependencies recorded in package.json and package-lock.json. Run `npm ci` to reproduce the installation. Manual résumé and file features need no service credentials; optional impact consent needs private Neon configuration.

- `npm run dev`: preview at http://127.0.0.1:3000.
- `npm run build`: production compilation and framework TypeScript check.
- `npm start`: serve the production build locally.
- `npm run typecheck`: standalone TypeScript check.
- `npm run lint`: ESLint.
- `npx playwright install chromium`: install the local test browser once.
- `npm test`: navigation, keyboard skip, axe, empty browser storage and reflow checks at desktop, phone and 320px widths, including 200% text enlargement.

Set NEXT_TELEMETRY_DISABLED=1 in the shell to disable framework development telemetry. The app contains no analytics. Optional impact follow-up uses Neon through a server-only route. Later-tool routes are explicitly labeled navigation previews.

The supplied original wordmark and growth artwork are used in public/brand. The glowing logo and historical landing example are reference-only. Manrope and Source Sans 3 are served locally from Fontsource packages under the SIL Open Font License; their license files are in the installed packages. No remote font requests are needed.

Owner refinement: dark Stillwater surfaces, lime accents and the original logo carry through the home, preview pages and footer. Plain CSS implements these tokens without an additional styling dependency.

RN2 adds browser PDF/font/schema libraries and a server-only Neon consent boundary. The PDF font and license are bundled in `public/fonts`; no résumé data is sent to a PDF service. `npm test` includes local-file, PDF and consent checks. To test an already-running preview, set `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3002` before `npm test`; otherwise Playwright starts its isolated port 3102 server. Run build after the test server exits. See [impact operations](IMPACT_OPERATIONS.md) for private configuration, cleanup, live synthetic checks and deletion commands. Without configured consent storage, downloads remain available and emails are discarded.

Automated checks do not establish screen-reader or physical-device conformance. Those checks and owner visual review must be recorded separately. No later phase or deployment is authorized by running this preview.
