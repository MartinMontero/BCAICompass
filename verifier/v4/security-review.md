# v4 security and privacy review — People discovery

Reviewed 2026-11-04 against the new People dataset, search, profile UI, export, navigation, and existing contribution service. v1–v3 findings and controls remain in force.

## People-specific findings

- **Public professional information only.** Profiles contain names, public roles, project contributions, public sources, and public web connection paths. No personal email addresses, phone numbers, `mailto:` links, precise home addresses, or availability claims are published. General organization contact details remain on external source pages rather than being copied.
- **No leadership inference.** Public speakers are not promoted to community leads. MAC and AI Creativity + Design remain explicit coverage gaps. Project contribution and community leadership are separate flags and labels.
- **Source integrity.** Every record requires HTTPS source and connection URLs, ISO read dates, a short evidence excerpt, a literal verified status, and valid related organization IDs. `scripts/export-data.mjs` fails the build on violations.
- **External links.** New profile, source, and connection links use `target="_blank" rel="noreferrer"`; no `javascript:` or `mailto:` destinations are allowed. Related directory navigation uses the existing local event.
- **Local deterministic search.** Queries remain in the browser and are capped at 240 characters. No query, profile view, or selection is sent to a remote AI or analytics service. Multi-term search performs bounded work over 21 local records.
- **Open-data parity.** `people.json` contains the same public fields shown in the UI, with privacy and availability caveats. It adds no credential, contributor form data, or server environment values.

## OWASP A01–A10 check

1. **A01 Broken access control:** no new authenticated or privileged route; read-only public directory.
2. **A02 Cryptographic failures:** no new credential, token, or sensitive stored value; HTTPS required for published links.
3. **A03 Injection:** React escapes profile and query content; no HTML injection, SQL, shell, or remote query execution.
4. **A04 Insecure design:** explicit privacy and source constraints fail at build time; no claim of personal availability.
5. **A05 Security misconfiguration:** no server or deployment configuration changed; existing CSP remains applicable.
6. **A06 Vulnerable components:** no dependency added; `npm audit --audit-level=low` must remain clean.
7. **A07 Identification/authentication failures:** no authentication flow changed.
8. **A08 Software/data integrity failures:** People records are compiled, validated, tested, and exported from source; organization data hash remains pinned.
9. **A09 Logging/monitoring failures:** no personal search or profile data added to logs; existing server logging unchanged.
10. **A10 SSRF:** People URLs are rendered as links, never fetched by the server; no new server-side request path.

**Result:** no unresolved security or privacy finding. Release remains gated on the complete v4 verifier and real-browser checks.
