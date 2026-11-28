# RN4 content and source review

Reviewed November 28, 2026 for the RN4 working branch. This is an editorial source check, not a legal review or participant comprehension result. Recheck links and official instructions before release and after material changes.

| Content | Source checked | Application limit |
| --- | --- | --- |
| Form I-9 List A or List B plus List C, employee document choice | [USCIS current Form I-9 lists](https://www.uscis.gov/sites/default/files/document/forms/i-9.pdf) and [USCIS instructions](https://www.uscis.gov/sites/default/files/document/forms/i-9instr.pdf) | General U.S. explanation only. Exceptions, receipts, restrictions and expiry route to current official rules. No eligibility decision. |
| Replacing a Social Security card | [Social Security Administration replacement guide](https://www.ssa.gov/number-card/replace-card) | Steps depend on the person. No document request, number collection or promise of approval. |
| State ID and birth record help | [USA.gov lost or stolen ID guide](https://www.usa.gov/replace-vital-documents) | Link to issuing agencies; no state-specific rule engine. |
| Employment help | [CareerOneStop American Job Center finder](https://www.careeronestop.org/LocalHelp/AmericanJobCenters/american-job-centers.aspx) | External government-supported service, not a Pondroot partner or guaranteed appointment. |
| Job scam caution | [Federal Trade Commission job scam guide](https://consumer.ftc.gov/articles/job-scams) | Educational warning, not a determination about a specific posting. |
| ATS definition and variation | [Indeed employer ATS overview](https://www.indeed.com/hire/c/info/what-is-ats) and [Workday Recruiting glossary](https://doc.workday.com/workday-education/en-us/course-manuals/recruiting-for-administrators/introduction-to-workday-recruiting.html?toc=1) | ATS expands to Applicant Tracking System. The lesson describes collecting and organizing applications, notes that features vary, and makes no universal AI-ranking claim. |

The ATS, application upload, tailoring and interview sections are general preparation advice. They make no score, hiring, legal or application-submission promise. The tailoring example is explicitly fictional and uses only the two stated tasks. The Virtual Caseworker candidate link remains unpublished until the separate project's destination, privacy and readiness are reviewed; no handoff is implied.

## Video candidates for owner review

The owner requested three YouTube choices above the guide navigation. Public video titles, publishers and descriptions were checked November 28; full playback, captions and claims still need editorial and accessibility review before RN4 publication. Videos remain optional; no YouTube request or thumbnail loads before Watch is chosen, and the written guides work without them. All three are English-language videos; Spanish interface labels do not imply Spanish audio or captions.

| Topic | Candidate | Review note |
| --- | --- | --- |
| ATS basics | [iSmartRecruit: How Applicant Tracking Systems Work](https://www.youtube.com/watch?v=qy-jM7HFXdU) | Owner-supplied 59-second vendor example. Auto-generated English transcript was reviewed. Its AI ranking description is specific to the example, not a universal ATS rule; the card says employer systems vary. Verify playback/captions with the owner. |
| ATS and résumé | [Indeed Career Tips: A Guide to Applicant Tracking Systems](https://www.youtube.com/watch?v=DksA_vF84JA) | External platform perspective. Do not adopt any pass or score guarantee. |
| Applying online | [Indeed: Indeed 101—Getting Started on Indeed](https://www.youtube.com/watch?v=hVYBT4UitFY) | Platform-specific and dated walkthrough; the page says other employer processes differ. Check current interface and captions. |

RN4 evidence still needed: owner copy review, plain-language comprehension with intended users, real screen-reader task, physical-device file-location walkthrough, and periodic external-link recheck. Automated browser and axe results should be recorded with the branch review; they do not replace those human checks.

Working-branch verification, November 28: `npm run typecheck`, `npm run lint` and `npm run build` passed. Playwright RN4, navigation and bilingual suites passed 18/18 across desktop, emulated mobile and 320-pixel narrow viewports after correcting a test that initially looked for a link inside a collapsed details element. Automated axe checks in RN4 tests found no tagged violations. Desktop hiring and mobile document screenshots were inspected; neither overflowed horizontally. This is local automated/visual evidence, not real-device, real screen-reader or intended-user evidence. No paid AI call or production change was made.

Video follow-up: the owner supplied the iSmartRecruit ATS clip. Its 59-second auto-generated transcript was read; the card labels it as a vendor example because its AI ranking description does not apply to every ATS. The revised page passed TypeScript, lint, production build and 9/9 RN4 browser checks across desktop, emulated mobile and 320-pixel narrow views. The check confirms three choices, no iframe before selection, one privacy-enhanced iframe after Watch, and removal on Close; it does not prove YouTube playback or captions on a real device. Desktop and mobile screenshots were inspected without horizontal overflow. The earlier 18/18 navigation/bilingual run predates this final video substitution; those unchanged paths were not rerun afterward.

Owner copy follow-up: the ATS disclosure now spells out the full term, describes the common collection/organization role, explains why clear truthful wording helps, and explicitly rejects a guaranteed score. The written interview practice now has four optional prompts plus an optional work-gap prompt. It collects and stores no answers and is not an AI simulator. Human comprehension and screen-reader use remain unverified.

Final working-branch checks: TypeScript, lint and production build passed. The RN4 and bilingual Playwright suites passed 12/12 on desktop, emulated mobile and 320-pixel narrow views after correcting selectors for the numbered practice cards. Automated axe checks reported no tagged violations. The interview cards were visually inspected at desktop and mobile width; a narrow card-number wrap was corrected and the affected RN4 suite passed 9/9 afterward. The mobile card was visually rechecked without the wrap. Video playback/captions and intended-user comprehension still require human review; no claim of RN4 release completion is made.
