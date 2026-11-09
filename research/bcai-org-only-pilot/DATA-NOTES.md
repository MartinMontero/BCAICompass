# Data notes

The organization-only JSON has schema `bc-ai-organizations-only-v1`, `counts.organizations`, and an `organizations` array. It intentionally does not carry the combined directory's other collections or aggregate metadata.

Organization fields are `id`, `type`, `slug`, `name`, `summary`, `excerpt`, `profileUrl`, `lastUpdated`, and optional `categories`, `locations`, `tags`, `websiteUrls`. Every record has `type: "organization"`. Public profile paths resolve against `https://kk-portal.vercel.app` and point into `/bc-ai-directory/organizations/`.

`lastUpdated` is a profile update date, not the date every claim was checked. A website or directory profile link is a research starting point, not a per-claim evidence ledger. Location strings are not sourced coordinates or precise premises addresses. CSV array values use `|` separators.

The 900 organization records were projected from source release SHA-256 `1cb132fcc4e018230398657936959665440150a1f6bb0907d359c59a8e828042`. `release.json` separately hashes this packet's organization-only JSON and CSV. Its organization-array fingerprint is derived using UTF-8 JSON with sorted keys and compact separators, retaining Unicode.

## Identity crosswalk

- `same-entity`: 36 previously reviewed name/alias decisions that still resolve in this release. These are identity proposals to review together, not certification of every claim.
- `broader-record-coverage`: seven individual TELUS/Bell facilities covered by broader BC + AI records. This is not an identity match or proof of a parent/operator relationship.

A lab, its university, a facility, its operator and a program can be distinct entities. Similar names and shared domains do not settle identity. Existing alternate or duplicate records still need editorial resolution. Keep affiliations, geographic proximity, discovery pathways and proven relationships separate.

Pilot and crosswalk fields come from Compass organization source at `4d0de44c99e482100d9946c6f494093b393cec36`, plus the reviewed BC + AI organization projection. The packet does not assert a fresh check of every Compass source page or parity with its live endpoints.

For accepted additions, retain the original public source, checked date, supported claim, caveat and contributor. A download or release date must not become a new verification date. Apply future corrections, withdrawals and identity changes before rebuilding imported projections; an old snapshot must not restore a withdrawn record.
