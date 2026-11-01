# v3 security review — 2026-11-01

Scope: the new Public AI browser workflow, mobile navigation/filter/comparison changes, guided contribution form, shared Zod contract, Hono REST route, GitHub pull-request service, Cloudflare Pages Function, dependency updates, and production static/API startup. Method: manual OWASP Top 10 (2021) review plus route/integration tests, browser failure-state tests, standalone cold start, and `npm audit --audit-level=low`.

## Findings by category

| Category | Result | Evidence and reasoning |
|---|---|---|
| A01 — Broken Access Control | Pass | The public endpoint can create only a contribution branch, one JSON submission file, and a pull request in the fixed server-configured repository. Users cannot select the repository, ref, destination path, token, or merge operation. No automatic merge or directory write exists. The API 404 remains after the contribution route and is covered by a route test. |
| A02 — Cryptographic Failures | Pass | `GITHUB_TOKEN` is read only from `process.env` or Cloudflare `context.env`; it has no `VITE_` variant and is absent from `src/`. GitHub calls use HTTPS and an Authorization header. The public submission JSON omits the token, honeypot, and timing field. No password/session/auth feature was added. No contributor email is collected. |
| A03 — Injection | Pass | Strict `z.strictObject` validation rejects unknown fields, including token/email fields. URLs are bounded and restricted to HTTP(S). React renders form values as escaped text. GitHub file content is JSON serialized and UTF-8/Base64 encoded; no shell, SQL, template evaluation, or raw request-body logging is used. GitHub owner/repository values are restricted to a safe character set and the API origin is fixed. |
| A04 — Insecure Design | Pass | The form has a review step and explicit public-source consent. The server applies content-type checks, a 32 KiB limit, field lengths, timing/honeypot checks, and five-per-hour in-memory per-connection rate limiting as defense in depth. The UI offers a download instead of pretending success. The in-memory limiter is intentionally only supplemental protection, not represented as a globally consistent production control. |
| A05 — Security Misconfiguration | Pass | API errors are generic and cache-disabled; stack details are not returned by the contribution handler. The production standalone check returned 200 for HTML, 503 with `configured:false` when no token was present, and 404 for an unknown API route. Unused `APP_ID`/`APP_SECRET` boot requirements were removed rather than replaced with dummy credentials. |
| A06 — Vulnerable and Outdated Components | Pass | Initial review found 14 moderate findings. A non-forced attempted fix exposed an additional high finding in an older Hono line, so the final update moved all Hono server copies to 2.1.5 and all minimatch copies to 11.0.3 through explicit overrides. Type-check, lint, unit/integration tests, build, and browser tests passed afterward. Final `npm audit --audit-level=low`: 0 vulnerabilities. No `npm audit fix --force` was used. |
| A07 — Identification and Authentication Failures | Pass | No user authentication was introduced or bypassed. The only privileged identity is the server’s GitHub credential; it is never accepted from the request. Missing credentials produce an explicit unavailable state, and upstream failure produces a 502 fallback rather than a fabricated PR link. |
| A08 — Software and Data Integrity Failures | Pass | The trusted organization file remains byte-identical to its accepted SHA-256 baseline. Public AI resources are a separate dataset. A PR URL enters success UI only from a confirmed 201 server response containing GitHub’s returned URL/number. Dependency resolution is locked in `package-lock.json`; no binary or base64 source artifacts were hand-edited. |
| A09 — Security Logging and Monitoring Failures | Pass | Existing access logs record method, route, status, duration, and request ID, not submission bodies or Authorization headers. The contribution service does not log credentials or upstream response bodies. Client-visible errors distinguish validation, unavailable configuration, rate limiting, upstream failure, and network failure without exposing internals. |
| A10 — Server-Side Request Forgery | Pass | The server never fetches contributor-supplied website/source URLs. Every outbound request uses the fixed `https://api.github.com` origin plus a server-constructed repository path. Owner/repository/base branch values are character-restricted and URL-encoded. No redirects to user-controlled origins are implemented in application code. |

## Unresolved findings

None.

## Residual operational requirement

The website cannot create real pull requests until a fine-grained GitHub token is configured server-side with Contents and Pull requests read/write access to `MartinMontero/BCAICompass`. The implementation and mocked request-sequence tests are complete, but the assistant’s GitHub authorization is not automatically available to the website runtime. Cloudflare deployment is a separate action and is not claimed by this review.
