# v5 acceptance — full-dataset People research coverage

This version corrects the partial-research failure in v4. It preserves the People product and all v1–v4 gates while requiring organization-by-organization public-source coverage. A polished interface and a larger profile count cannot substitute for the research requirement.

## Research and product gate

1. The accepted organization dataset remains byte-identical. The review begins from all 136 organization IDs in `src/data/organizations.ts`.
2. `research/people-source-review.json` contains exactly one review entry for every organization, with no missing or duplicate IDs. Each entry names the organization and records every fetched seed, team, leadership, or project URL, response status, and readable-text result.
3. Each organization’s own public site and primary source are attempted. Where readable, relevant public team, leadership, people, faculty, research, and project links are followed. No organization is silently treated as having no people because a page failed.
4. Review outcomes distinguish pages reviewed, no readable public page, and any later researcher-assessed outcome such as no named public lead found. Unreachable, blocked, timed-out, empty, and non-HTML responses remain visible in the ledger.
5. The People directory expands beyond the initial 21-profile BC + AI-centered set with sourced leaders or project contributors identified through this full review. Every added profile has a literal verified status, public HTTPS role source, read date, short exact evidence excerpt, and at least one public web connection path.
6. No personal email addresses, phone numbers, `mailto:` links, private contact details, unsupported availability claims, or leadership inference from a mere event appearance are published. Students and other non-public figures are not extracted from photographs or informal mentions.
7. Existing community-leadership coverage remains honest. New people are associated with verified organization IDs where present; connection links are public routes into the work rather than promises of response.
8. The UI and open-data export derive profile and coverage counts from data rather than a hardcoded 21. Search, filters, match explanations, profile selection, related organization navigation, and mobile layouts continue to work at the expanded scale.
9. Research documentation explains the crawl method, coverage limits, page failures, and why any organization produced no published person. A complete ledger with documented gaps is acceptable; an unreviewed organization is not.

## Engineering and evidence gate

10. Unit tests check exact 136-ID ledger coverage, duplicate prevention, review outcomes, new-profile source integrity, and preservation of the initial public profiles. Browser tests use dataset-derived counts and exercise newly added non-BC + AI profiles.
11. Data export validates all People records and the complete ledger. Type-check, lint, production build, full unit and browser suites, dependency audit, responsive visual checks, and privacy review pass.
12. Every verifier run is appended under `verifier/runs/`, including unsuccessful runs. `verifier/README.md` remains append-only.
13. Delivery is not marked complete after a crawl, candidate list, first pass, or plan. Completion requires the 136-entry ledger, expanded sourced profiles, passing verification, GitHub delivery, and live production confirmation of both the expanded UI and export.
