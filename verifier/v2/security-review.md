# OWASP Top 10 security review — v2 UX addendum

Reviewed: 2026-10-30

Scope: the connected region state, regional atlas, search-to-map actions, progressive directory evidence, comparison/sorting workspace, planner checklist, revised navigation and visual tokens, and their integration with the existing static React application. The v1 review remains in force; all OWASP Top 10 (2021) categories are rechecked below.

## Review summary

- Risk summary: RED High 0 | YELLOW Medium 0 | GREEN Low 0 | PASS 10 categories.
- No new backend, account, credential, telemetry, remote AI, dynamic HTML, or visitor-controlled URL-fetching surface was introduced.
- The new controls render trusted public dataset fields or local UI state through React text rendering. Shared region and sorting values come from fixed application choices.
- `npm audit --audit-level=low` completed with exit code 0 and reported 0 vulnerabilities; the timestamped output is retained under `verifier/runs/`.

## A01 — Broken Access Control: PASS / not applicable

The v2 atlas, planner, map, directory, and comparison views expose only the same public organization records. There are no accounts, roles, private records, administrative endpoints, or server-side object references. Shortlist changes remain browser-local and accept only known public organization IDs (`src/lib/shortlist.ts:6-24`).

## A02 — Cryptographic Failures: PASS

No passwords, secrets, tokens, personal accounts, payment data, or custom cryptography were added. Browser storage still contains only public organization IDs and the theme preference. The existing hosting headers retain `upgrade-insecure-requests` (`public/_headers`).

## A03 — Injection: PASS

The reviewed runtime contains no SQL, shell execution, `eval`, `new Function`, `innerHTML`, or `dangerouslySetInnerHTML`. Search explanations, organization fields, atlas summaries, checklist state, and comparison rows are rendered as React text. External links originate from the unchanged verified dataset and use `rel="noreferrer"` when opening a new tab. Existing CSV formula neutralization and quoting remain intact (`src/lib/shortlist.ts:27-47`).

## A04 — Insecure Design: PASS

The v2 workflow makes existing deterministic behavior more visible without adding generated organization claims. Regional totals and comparisons derive from the trusted dataset; the atlas is explicitly schematic and not to scale. Unsurveyed regions are not represented as zero-AI regions. Browser-local persistence and non-persistent drafts remain disclosed, and no workflow implies server synchronization.

## A05 — Security Misconfiguration: PASS

The production build emits static assets without debug output or stack-trace pages. Existing CSP, frame denial, `nosniff`, referrer, permissions, COOP, `base-uri`, `form-action`, and `object-src` headers are unchanged. No new runtime origin, credential, or permissive CORS policy was introduced.

## A06 — Vulnerable and Outdated Components: PASS

The v2 dependency audit reports zero vulnerabilities. The lockfile remains versioned, and no dependency was added for the UX iteration. Existing pinned React, Leaflet, and React-Leaflet runtime architecture remains in place.

## A07 — Identification and Authentication Failures: PASS / not applicable

No login, session, JWT, password reset, MFA flow, or authenticated operation exists or is simulated. Saved comparisons remain explicitly browser-local rather than private cloud-backed records.

## A08 — Software and Data Integrity Failures: PASS with residual third-party note

The trusted organization source remains byte-identical under SHA-256 `07c001e1febed219bdb0bb1582f30aa35ef8f8e4931ce73ab2a074856a4aafd6`. Stored shortlist JSON is parsed inside `try/catch`, deduplicated, capped, and filtered against known IDs (`src/hooks/useShortlist.ts:12-17`, `src/lib/shortlist.ts:6-17`). Open-data exports are regenerated and validated by the build. No new third-party runtime origin was added; the pre-existing fixed Google Fonts and OpenStreetMap dependencies remain hosting/availability considerations.

## A09 — Security Logging and Monitoring Failures: PASS / not applicable

The static frontend has no privileged mutation or server-side security event to audit. It does not transmit search, planning, or shortlist content to a telemetry service. Production-browser checks continue to treat page errors and failed first-party requests as failures; hosting-platform logging remains an operator responsibility.

## A10 — Server-Side Request Forgery: PASS / not applicable

There is no backend or server-side URL fetch. Search-to-map actions dispatch a local organization ID and scroll to the existing map; they do not construct a request from visitor text. Browser requests remain limited to fixed application assets and the pre-existing font/map providers.

## Conclusion

All A01–A10 categories pass for the v2 change set, with no new finding requiring remediation. Residual operational risk remains limited to hosting configuration and the pre-existing external font/map providers. This review supplements, rather than replaces, the v1 report and the recorded automated gates.
