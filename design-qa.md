# Rooted Network visual refinement QA

- Source visual truth: owner-provided homepage screenshot used locally for review; the personal source file is not committed
- Implementation: `http://127.0.0.1:3002/` in the Codex in-app browser
- Source pixels: 1906 × 911
- Implementation capture: 746 CSS px wide; full-page browser capture 746 × 2986 px
- Density normalization: browser and source were reviewed at their native density; the comparison focused on relative header height, hero-copy placement, and footer treatment because the source and review surface use different responsive widths.
- State: English guest home, no résumé draft

## Full-view comparison

The revised page preserves the approved Rooted Network mural, typography, palette, content, and interactions. The header uses less vertical space, the hero copy is shifted upward without changing its reading order, and the footer now reuses the approved Pondroot growth artwork behind a dark translucent water-toned treatment.

## Focused-region comparison

- Header: logo, language controls, and navigation remain legible and keyboard accessible while the top padding, logo width, navigation gap, and link height are reduced.
- Hero: the copy block moves upward on desktop and by a smaller amount on mobile so it does not collide with the mural edges or crop at narrow widths.
- Footer: real Pondroot root artwork is visible at low contrast behind the logo and Rooted Network label. No substitute illustration or generated logo was introduced.

## Fidelity surfaces

- Fonts and typography: unchanged; existing Manrope and Source Sans 3 hierarchy is preserved.
- Spacing and layout rhythm: header and navigation are shorter; hero copy has a controlled responsive upward offset.
- Colors and visual tokens: existing pond, lime, ivory, and emerald tokens remain unchanged.
- Image quality and asset fidelity: the original `pondroot-growth.png` asset is reused at cover scale with a dark overlay; the wordmark remains the approved asset.
- Copy and content: unchanged in English and Spanish.

## Comparison history

- Initial issue: the header occupied more vertical space than desired and the centered hero copy sat too low. The plain footer did not carry the root-and-water identity.
- Fix: reduced header metrics, added responsive hero-copy offsets, and introduced the approved growth artwork as a subdued footer background.
- Post-fix evidence: in-app browser full-page capture confirmed readable navigation, raised hero content, intact CTA hierarchy, visible footer roots, and no narrow-layout horizontal overflow.
- Owner refinement: shortened the footer from 150px to 125px on desktop and from 130px to 110px on mobile, then raised the hero copy an additional 24px on desktop and 16px on mobile. The content order and responsive breakpoints remain unchanged.

## Findings

No actionable P0, P1, or P2 differences remain for the three requested refinements. The exact desktop composition should receive the owner’s visual review before commit.

## Test evidence

- Full Playwright suite: 33/33 passed across desktop, mobile, and 320px narrow projects.
- TypeScript: passed.
- ESLint: passed.
- Next.js production build: passed.
- Primary interactions checked by tests: language switching, navigation, keyboard skip/focus, mobile reflow, résumé journey, print, PDF, and draft-file controls.
- Browser console: no application error was observed during the in-app visual review.

final result: passed
