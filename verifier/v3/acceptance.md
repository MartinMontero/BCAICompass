# v3 acceptance — mobile tasks, Public AI, and guided contributions

This version adds the mobile, Public AI, and contribution gates without replacing v1 or v2. The byte-identical verified organization dataset and all previously accepted practical capabilities remain protected.

## Product gate

1. The verified organization dataset remains byte-identical to the accepted baseline. Public AI resources live in a separate curated dataset and do not certify or reclassify directory organizations.
2. Public AI is framed as practical public knowledge, preservation, open infrastructure, privacy, accountability, and public-interest capability. The supplied talks inform the framework; empirical resource descriptions link to their own official sources.
3. A dedicated Public AI section provides deterministic search, principle filters, resource-type filters, result counts, clear-filter recovery, checked dates, official links, and concise next-use guidance.
4. Relevant existing organizations may appear only as related verified organizations, with a working route to their directory records and no implication that they are Public AI projects.
5. At phone widths, primary tasks are reachable through a safe-area-aware fixed task bar. The full mobile menu remains available for secondary destinations, keyboard operation, and theme switching.
6. Directory category and region filters collapse behind an accessible phone disclosure while retaining search, active-filter state, result counts, all 136 unfiltered records, and source evidence.
7. Saved organizations use readable comparison cards on phones and the complete sortable table on larger screens. Both views preserve source, evidence, place, category, removal, sorting, and exports; phone comparison requires no sideways table scrolling.
8. The developer-oriented pull-request link is replaced by a guided form for adding an organization, correcting a record, or suggesting a Public AI resource. It includes field validation, a review step, public-source consent, and no contributor email field.
9. A successful submission returns a real GitHub pull-request URL only after the server confirms creation. Validation, unavailable-configuration, rate-limit, upstream-error, and downloadable-fallback states are explicit and never reported as success.
10. Pull requests are created server-side through a fixed GitHub owner/repository and fixed API origin. Credentials never enter browser code, submission files, logs, source control, or user-facing responses.

## Engineering and experience gate

11. The Hono contribution route uses strict shared Zod validation, a route-scoped body limit, spam checks, bounded input, and defense-in-depth rate limiting. A portable Cloudflare Pages Function uses the same contract and server-only environment values.
12. All interactive controls remain keyboard-operable, visibly focused, touch-friendly, reduced-motion aware, and free of placeholder actions. New layouts pass 375, 768, 1024, and 1440-pixel overflow and visual checks.
13. Behavior tests cover Public AI retrieval, guided contribution states, server validation, GitHub request sequencing and payload safety, mobile task navigation, collapsed filters, and mobile comparison cards.
14. Data verification, unit tests, type-check, lint, production build, production-browser scenarios, and dependency audit pass. The OWASP A01–A10 review has no unresolved finding.
15. Every verifier run—successful or unsuccessful—is recorded under `verifier/runs/` with timestamp, command, exit code, and produced values. `verifier/README.md` remains an append-only version index.
16. Delivery distinguishes a saved dynamic preview, GitHub source delivery, credential setup, and production publication. No live pull-request capability or Cloudflare deployment is claimed without real runtime credentials and a successful request/deployment.

## Evidence

The executable static/command gate is `verify.mjs`. Unit and integration tests live in `src/tests/` and `api/`; browser assertions and screenshots live in `e2e/` and Playwright output. Final command outputs, security review, visual checks, and delivery evidence are timestamped in `verifier/runs/`.
