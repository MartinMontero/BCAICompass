# Proposed PR

Title: Propose BC + AI organization data and a ten-org review pilot

Adds a dated, organization-only BC + AI research packet and proposes a ten-organization pilot for reviewing identities, sources and useful corrections together. Records remain candidates subject to Compass's evidence policy; the published registry and application are unchanged.

The packet in `research/bcai-org-only-pilot/` contains:

- 900 organization records in JSON and CSV, with schema notes, provenance, exact hashes, attribution and CC BY 4.0 terms.
- 36 proposed same-entity mappings and seven broader-record coverage links. The latter are not identity matches or proof of ownership/operator relationships.
- Ten pilot candidates: UBC Data Science Institute, TrustML, Human-AI Interaction @ UBC, SFU Trustworthy Artificial Intelligence Lab, iViz Lab, Metacreation Lab for Creative AI, BCNET, New Ventures BC, AI@UVic and KAST.
- A proposed review process and a dependency-free packet verifier.

The packet excludes individual profile records, transcripts, private source notes, member/CRM exports and individual-profile download links. Public founder names can occur in organization business descriptions. Privacy screening does not certify every factual claim.

The proposed pilot first agrees the candidates, resolves lab/parent/facility identities, checks current primary sources and records accepted, unresolved or excluded outcomes with attribution. Some starting links are broad or secondary and need that review. Where both projects accept an addition or correction, try one complete exchange in each direction before expanding. Swaps are welcome; no partnership or maintenance commitment is assumed.

The public organizations CSV is available at https://kk-portal.vercel.app/directory/organizations.csv. No access to a private repository is required. The separate outreach note remains a draft in `research/bcai-org-only-pilot-notes/MARTIN-NOTE-DRAFT.md`.

Validation: `python3 research/bcai-org-only-pilot/verify_packet.py` and `git diff --check` pass. The verifier covers the exact organization fingerprint, file hashes, CSV parity, crosswalk destinations and ten pending candidates. Application data/build/lint checks could not run because the upstream lockfile does not match `package.json`: `npm ci` fails before dependency installation. The PowerShell exit-condition gate is unavailable locally. No runtime or registry files are changed.
