# v2 acceptance — connected spatial workflow

This version adds UX/UI acceptance criteria without replacing v1. The trusted organization dataset and all practical capabilities from v1 remain protected.

## Product gate

1. The verified organization dataset remains byte-identical to the accepted baseline.
2. The visible flow is need → plan → region/map/directory → compare → act; standalone goal and pathway sections are not remounted when their functions already exist in the planner.
3. One shared region selection drives the action planner, regional atlas, ecosystem map, and directory. Manual map/directory region changes update the same selection.
4. The regional atlas is derived from verified records, exposes keyboard-operable region controls, distinguishes total and mapped counts, and provides a working route to the map.
5. Natural-language results prioritize match explanations and actions over repeated organization prose; mapped results can be located on the map.
6. Directory records use progressive disclosure for long descriptions/evidence while retaining source links, dates, quotes, and shortlist actions.
7. The shortlist is a comparison workspace: compact organization rows, category/region/type/evidence fields, sorting, coverage summaries, removal, and existing CSV/Markdown exports.
8. The planner retains four concrete steps, region-specific verified organizations, pathway tracing, copy, and Markdown download; its presentation makes progress and next actions visible.
9. The method retains provenance, exclusions, attribution, verification statistics, and recheck guidance through a concise visual summary and progressive detail.
10. Existing editable playbooks, official governance references, contribution flow, theme switching, and browser-local persistence disclosure still work.

## Engineering and experience gate

11. Semantic design tokens, visible focus, reduced-motion behavior, responsive navigation, and touch-friendly primary controls remain present.
12. No dead controls, placeholder links, generated organization claims, new credentials, backend dependency, or remote AI retrieval are introduced.
13. Data export, unit tests, lint, production build, and production-browser scenarios pass.
14. Browser scenarios prove shared-region synchronization, atlas interaction, comparison/sorting, search-to-map navigation, downloads, persistence, clipboard failure handling, and mobile operation.
15. Visual inspection covers 375, 768, 1024, and 1440-pixel widths in light and dark themes as applicable; no unexplained clipping, overlap, broken glyphs, blank content, or horizontal page overflow is accepted.
16. Dependency audit and the OWASP review remain clean or have any new finding explicitly resolved and recorded.
17. Every verifier run—successful or unsuccessful—is recorded under `verifier/runs/` with timestamp, command, exit code, and produced values. `verifier/README.md` remains an append-only version index.
18. Delivery distinguishes a saved preview from production publication. Cloudflare deployment is not claimed without valid authorization and a successful deployment.

## Evidence

The executable static/command gate is `verify.mjs`. Browser assertions and screenshots live in `e2e/` and Playwright output; final command outputs and delivery evidence are timestamped in `verifier/runs/`.
