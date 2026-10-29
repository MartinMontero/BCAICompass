# BCAICompass practical upgrade — acceptance criteria v1

Created: 2026-10-29

## Product outcomes

1. **Preserve the trusted dataset.** The existing `src/data/organizations.ts` remains byte-identical to the audited baseline. All existing records, source links, map, pathways, regions, method, contribution route, theme switch, and open-data exports continue to work.
2. **Ask the map.** A visitor can enter a plain-language need and receive ranked matches drawn only from verified organization records. Each result explains which source-backed text caused the match. Search is deterministic, works without a third-party API, limits input length, and has useful empty and clear states.
3. **Build an action plan.** A visitor can choose a practical goal and region and receive a sequenced checklist plus relevant verified organizations and pathways. The plan clearly distinguishes general checklist guidance from sourced organization facts.
4. **Keep and use a shortlist.** A visitor can add/remove verified organizations, see the saved count, and export the shortlist as CSV and Markdown. Browser-only persistence is disclosed; storage failures do not break the site.
5. **Use reusable playbooks.** The site includes practical, editable templates for an AI use-case brief, a pilot evaluation scorecard, and a responsible-procurement checklist. Templates can be copied or downloaded and do not pretend to be legal advice.
6. **No dead ends.** Empty search results explain the dataset’s coverage limits and offer a working contribution route. Every visible control has a real action and keyboard-focus state.

## Engineering outcomes

7. Core retrieval, planning, shortlist, and export logic has reproducible automated tests using Arrange–Act–Assert structure. Data export validation continues to pass.
8. `npm run lint`, `npm test`, and `npm run build` pass from a clean dependency install. There are no P0/P1 defects in the new workflows.
9. The production page has no browser console errors or failed first-party requests. Main flows are exercised in Chromium at desktop and 375px mobile widths; no horizontal page overflow, unreadable text, or inaccessible primary controls.
10. OWASP A01–A10 are reviewed. New code uses no unsafe HTML injection, no secrets, no server-side URL fetching, and no unbounded user input. Dependency vulnerabilities are triaged and exploitable production risks remediated where possible.
11. The finished source is saved as a website preview and pushed to the user’s GitHub repository. Any deployment limitation is stated precisely rather than claimed as live.

## Evidence required before handoff

- Versioned verifier output under `verifier/runs/`.
- Unit-test and production-build results.
- Desktop/mobile visual inspection and interaction evidence.
- Security review and dependency-audit result.
- Git commit/push identifier and website version identifier.
