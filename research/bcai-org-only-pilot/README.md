# BC + AI organization data and proposed ten-org pilot

Prepared November 7, 2026 for discussion with Martin Montero. Local draft; not sent or published.

This packet contains **900 organization records**, 36 proposed same-entity mappings, seven broader-record coverage links, and ten organization review candidates. It contains no people dataset. It adds only research material and does not modify Compass's published application or registries.

## Files

| File | Purpose |
|---|---|
| `data/organizations.json` | Organization-only JSON, schema `bc-ai-organizations-only-v1`. |
| `data/organizations.csv` | The current public organizations CSV, 900 rows. |
| `organization-crosswalk.csv` | 36 same-entity mappings and seven broader-record coverage links to review. |
| `pilot-review-candidates.csv` | Ten proposed organization candidates with public source URLs and pending-review status. |
| `release.json` | Exact file hashes, source release and organization-array fingerprint. |
| `PILOT.md` | Proposed review process and completion criteria. |
| `DATA-NOTES.md` | Schema, identity and evidence limitations. |
| `PRIVACY-CHECK.md` | Scope and results of the packet's privacy screen. |
| `ATTRIBUTION.md`, `LICENSE` | Credits and CC BY 4.0 terms. |
| `verify_packet.py` | Dependency-free integrity and publication-boundary checks. |

Run from the repository root:

```sh
python3 research/bcai-org-only-pilot/verify_packet.py
```

The JSON has an `organizations` array and an organization count; it is a purpose-specific organization-only projection. Use it directly for this pilot. For a later refresh, the [public organizations CSV](https://kk-portal.vercel.app/directory/organizations.csv) is available without repository access. Review and record a new version rather than silently replacing this dated snapshot.

The data is reusable under **CC BY 4.0**, with credit to **BC + AI Ecosystem Association — https://bc-ai.ca**. Compass-derived organization fields retain credit to **bc-aicompass.ca**. Public release is distinct from verification of every factual claim. Records remain research candidates until they meet the receiving project's evidence policy.

The proposed exchange can combine Compass's detailed lab, infrastructure and regional-support coverage with BC + AI's broader organization directory. Each project retains its editorial decisions. No partnership or reciprocal maintenance commitment is assumed.
