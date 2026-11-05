# v5 security and privacy review — full-dataset People expansion

Reviewed 2026-11-04 against the 136-organization source review, 127-profile dataset, expanded UI, and export. v1–v4 controls remain in force.

## Findings

- **Research integrity:** the ledger contains exactly one entry per organization. Page failures remain visible and are never converted into “no people found.” Alternate public-source searches are documented separately from the initial crawl.
- **Current-role accuracy:** role transitions are checked against current public leadership where available. Former leaders are not used to fill coverage. Shared leaders are deduplicated and linked to multiple organizations rather than repeated.
- **Privacy:** public professional roles and project pages only. No personal emails, phone numbers, `mailto:` links, home addresses, private contact details, or availability claims are copied. General organization contact pages remain external public routes.
- **No inference:** City of Vancouver and AI Creativity + Design remain documented gaps. Students, informal photo subjects, and event attendees are not promoted into leadership roles.
- **Links and injection:** published source and connection URLs must be HTTPS. React escapes all content. No profile HTML, SQL, shell, server-side URL fetch, or remote AI query is introduced.
- **Build integrity:** export rejects missing organizations, unknown profile IDs, incorrect profile counts, incorrect coverage counts, invalid related organizations, missing evidence, non-HTTPS links, and forbidden contact fields. The organization dataset remains pinned to its accepted hash.
- **OWASP A01–A10:** no new privileged route, credential, database, authentication change, server request path, or deployment configuration change. No SSRF, XSS, injection, broken access control, or unresolved software/data integrity finding was identified. Dependency audit remains required.

**Result:** no unresolved security or privacy finding. Full v5 acceptance and production verification remain release gates.
