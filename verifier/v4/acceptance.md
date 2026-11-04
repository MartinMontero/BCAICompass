# v4 acceptance — sourced People discovery and connection paths

This version adds a public professional People directory without replacing v1–v3. The verified organization dataset and all accepted organization, Public AI, mobile, and contribution workflows remain protected.

## Product gate

1. `src/data/organizations.ts` remains byte-identical to the accepted baseline. People live in a separate sourced dataset and do not change organization verification or certification.
2. Every published person has a literal `verified` status, public HTTPS role source, ISO read date, short verbatim evidence excerpt, and at least one public connection path. No personal email addresses, phone numbers, `mailto:` links, or private contact details are published.
3. All ten active communities on the BC + AI communities page were reviewed. Named public leadership is included where sourced; the two rooms without a confirmed public lead are disclosed rather than filled by inference.
4. The initial directory contains at least 20 people, including community leaders and at least six additional project contributors identified from linked public pages or existing verified organization records.
5. Search covers names, roles, expertise, communities, locations, projects, and connection descriptions. Multi-term queries are deterministic, require every meaningful term to match, explain the matching fields, and support community and connection-intent filters, counts, clear recovery, and an empty state.
6. Every result opens a readable profile with sourced role information, projects, practical get-help/offer-help/join-project paths where supported, checked date, and source link. Connection paths describe public routes into the work, never guaranteed personal availability.
7. Related organization links use only existing verified organization IDs and preserve the existing directory-navigation event.
8. A generated `public/people.json` export exposes the same public records with source, licence, coverage, and privacy notes. Build-time validation rejects duplicate IDs, missing evidence, invalid URLs/dates, invalid related organizations, unsupported connection kinds, and forbidden contact fields.
9. People is reachable from desktop navigation, the full mobile menu, and the phone task bar. Phone filters collapse accessibly; profile selection and every external action work with keyboard and touch.
10. Layouts pass 375, 768, 1024, and 1440-pixel overflow and visual checks in both themes, with visible focus, 44-pixel touch targets, no dead controls, and no horizontal scrolling.

## Engineering and evidence gate

11. Unit tests cover name, expertise, project, community, location, multi-term and connection-intent retrieval, explanation, empty states, source validity, leadership coverage, and related organization integrity.
12. Production-browser tests exercise search, filters, profile selection, source and connection links, directory navigation, mobile filters, task navigation, screenshots, and overflow.
13. Data verification, unit/integration tests, type-check, lint, production build, full browser suite, and dependency audit pass. The OWASP review adds People privacy and external-link checks with no unresolved finding.
14. Every verifier run—successful or unsuccessful—is appended under `verifier/runs/`. `verifier/README.md` remains an append-only version index.
15. Delivery distinguishes saved preview, GitHub source delivery, automatic production deployment, and live verification. No production claim is made before the public site itself is checked.

The executable static/command gate is `verify.mjs`; research and coverage decisions are in `research/PEOPLE.md`. Timestamped evidence is under `verifier/runs/`.
