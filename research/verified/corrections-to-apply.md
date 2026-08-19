# Corrections to apply to the BC + AI ecosystem dataset

Generated 2026-08-19. Every correction below has a source. Corrections are graded by evidence tier:

- **Tier A — fetch-verified.** The supporting quote was copied from a page fetched at the given URL on 2026-08-19. Apply directly.
- **Tier B — sourced, not fetch-verified.** Drawn from search results and reputable press rather than a fetched page. Apply, but re-verify against a primary page before the record ships publicly.

---

## 1. Domain corrections — apply first

These send users to the wrong organization or to nothing. They are the highest-severity defect class in the dataset.

| Organization | Dataset value | Correct value | Tier |
|---|---|---|---|
| CAIDA | `caida.ca` | `caida.ubc.ca` | A |
| Quantum Algorithms Institute | `quantumalgorithms.ca` and `quantumalgorithms.org` (three rows) | `qai.ca` | A |
| First Nations Technology Council | `technologycouncil.ca` | `firstnationstech.ca` | A |
| BC + AI Ecosystem Association | `vancouver.bc-ai.net` | `bc-ai.ca` | A |
| DIGITAL | `digitalsupercluster.ca` (correct, but recorded under the retired name) | keep URL, rename to DIGITAL | A |

**CAIDA carries a collision hazard that needs a note on the record.** `caida.org` is the Center for Applied Internet Data Analysis in San Diego — unrelated, same acronym, and the first result a naive search returns. Anyone re-verifying this record without the note will "confirm" the wrong organization.

---

## 2. Merges and deletions

**New Media BC → merge into DigiBC. Do not list separately.** (Tier A)
DigiBC's own history page states it was founded in 1997 under the name New Media BC, with a merger and renaming recorded on its timeline in January 2009. The dataset lists New Media BC as a live organization at `newmediabc.com` with an Executive Director who is not DigiBC's current ED (Loc Dao). Keep "New Media BC" as a name variant on the DigiBC record.

**Merge duplicate rows** (Tier A, counts from the 2025-08-04 backup):
- Quantum Algorithms Institute — 3 rows, 2 conflicting domains, one name markdown-damaged as `8. Quantum Algorithms Institute`
- Digital Technology Supercluster — 2 rows, inconsistent categories
- TELUS — 4 rows
- Creative Destruction Lab — 3 rows
- SFU Trustworthy AI Lab — 3 rows
- PLAI, UVic AI/ML Lab, Microsoft Research, RBC Borealis, entrepreneurship@UBC, CICE — 2 rows each
- `MetaOptima / MetaOptima (DermEngine)` — single unmerged row

**Delete: rows that are research-note fragments, not organizations** (Tier A). At least twenty exist in the institutional slice alone. Confirmed examples:
`Research:` · `Before Research:` · `After Research:` · `Research Team:` · `Research Focus:` · `Research Areas:` · `Research Methods` · `Associated Labs:` · `Research Connections:` · `Follow-up Research Needed` · `Additional Metadata Available` · `Competitive Positioning Research` · `University Partnerships` · `Academic-Industry Collaborations` · `Commercializing university research` · `Research Commercialization` · `Research University Access` · `Quantum Computing` · `Quantum Applications`

**Delete: section headings imported as organizations** (Tier A):
`Investment & Accelerators (15)` · `Academic & Research (12)` · `Major Tech Companies & Enterprise (15)`

**Quarantine, do not delete: speculative entities** (Tier A). Plausible-sounding institutional constructs with no URL and no evidence. Each needs an individual check; expect most to evaporate:
`Site C Hydroelectric AI Integration` · `Site C Hydroelectric Project AI Division` · `BC Data Centre AI Initiative` · `Upper Nicola Band AI Data Centre` · `BC Hydro Clean Power Action Plan` (filed as category "Company")

**Remove: not British Columbia** (Tier B): Grammarly, SandboxAQ, Thales, BrainBox AI (Montreal), Flash Forest (Ontario), Cohere (Toronto), CoLab Software (Newfoundland). Also name-collision imports that are not BC AI organizations: Caliber Data Labs (`caliber.com`), ThinkLabs AI (`thinklabs.com`), Leaders of Tomorrow Institute (`leaders.com`), MoogleLabs, ValueLabs.

---

## 3. Status corrections — add a `status` field

The dataset has no way to say an organization is gone. Add `status` with values: `active` · `acquired` · `branch-office` · `relocated` · `defunct` · `unverified`.

| Organization | Status | Detail | Tier |
|---|---|---|---|
| Nexii Building Solutions | acquired / relocated | CCAA creditor protection January 2024; assets acquired by 3 Gates; relaunched as Nexii Inc. with Dallas headquarters, Squamish manufacturing retained | B |
| mCloud Technologies | delisted | Nasdaq delisting September 2023 | B |
| Coho Data | defunct | no longer an independent BC entity | B |
| Canalyst | acquired | no longer an independent BC entity | B |
| Finn AI | acquired | Glia, 2022 | B |
| Motion Metrics | acquired | Weir Group, 2021 | B |
| Goldpan | acquired | Klue, March 2025 | B |
| Ignition | acquired | Klue, September 2025 | B |
| Microsoft Research Vancouver, Workday Vancouver, Apple Vancouver, Amazon Vancouver, RBC Borealis, Silo AI, Wayve | branch-office | present in BC, headquartered elsewhere — do not classify as BC organizations | B |

**Everything else in the dataset defaults to `unverified` until it has been through the evidence check.** An unverified record does not ship.

---

## 4. Date corrections

**Klue — every event was recorded a year late.** (Tier B)
- Goldpan acquisition: **March 2025**, not March 2026
- Ignition acquisition: **September 2025**, not September 2026
- Layoffs of approximately 85 people, over 40% of staff: **June 2025**, not June 2026

---

## 5. Government and portfolio layer — add, with a caution

The dataset has no government layer. BC now has a dedicated AI portfolio, which the map should carry.

- **Rick Glumac** — Minister of State for Artificial Intelligence and New Technologies, a post created 2025-07-17. (Tier B)
- **A cabinet shuffle on 2026-08-14** moved several relevant portfolios. Any record naming Ravi Kahlon as Minister of Jobs and Economic Growth is now out of date. (Tier B)

**Do not publish minister names on organization records.** They change faster than a re-verification cycle, and the shuffle above proves it. Carry them on a single dated government-layer page instead, so one edit updates everything.

---

## 6. The 2026 infrastructure layer — absent from every version of the dataset

This is the largest structural change in BC AI since the data froze, and none of it is present. All Tier B; re-verify against primary pages before shipping.

**TELUS sovereign AI factory cluster**, announced May 2026 with the federal government under the Enabling Large-Scale Sovereign AI Data Centres initiative:
- Kamloops — expansion of the existing facility
- M3, 111 East 5th Avenue, Mount Pleasant, Vancouver — the former Hootsuite building, developed with Westbank
- 150 West Georgia, Vancouver — developed with Westbank and Allied Properties REIT

**Both Vancouver sites are subject to unresolved municipal process.** On 2026-07-21 Vancouver City Council unanimously reversed its 2026-07-14 decision to send the 111 East 5th rezoning to a public hearing, deferring it past the municipal election. A council member's motion additionally seeks confirmation of compliance with a new regulatory framework before any Council decision, extending to permitting at 150 West Georgia. **Any record stating these are approved is wrong.** The referral report records approximately 579 public submissions.

**Bell AI Fabric** — six BC facilities, roughly 500 MW planned:
- Kamloops, Mission Flats Road — 7 MW, with Groq
- Kamloops, Thompson Rivers University — 26 MW
- **Merritt — opened spring 2026**, five-acre site adjacent to Merritt Municipal Airport, in partnership with **BUZZ High Performance Computing, a subsidiary of HIVE Digital Technologies**. BUZZ secured an initial 6.5 MW of gross capacity. A June 2026 agreement adds Cohere and Hypertec to the Merritt deployment.

**BUZZ HPC and HIVE Digital Technologies are absent from the dataset entirely** and are now operators of BC AI infrastructure. Add them.

**BC Hydro competitive electricity allocation** — opened 2026-01-30 under Bill 31; up to 400 MW over two years; 15 applications received representing close to 800 MW; successful applicants to be notified mid-September 2026. **This is a scheduled data revision, not a static record.**

---

## 7. Capacity figures — record design and secured capacity as separate fields

The Bell figures conflicted across sources until the reason became clear: they are different things.

- **7 MW** — announced design capacity (Bell, press)
- **6.5 MW** — capacity actually secured by BUZZ HPC at Merritt
- **5 MW** — as-built phase capacity per Quasar Consulting Group, Bell's engineering contractor

All three are correct about different things. One `capacity` field forces a false choice. Use `capacityDesignMW` and `capacitySecuredMW`.

**Withdraw the claim of 15–25 permanent jobs at Merritt.** No permanent-jobs figure appears in any Merritt source. The 15-job figure belongs to the Kamloops facility.

**Label all TELUS and Bell headline numbers as projections**, not delivered facts: $9 billion in economic value, over 60,000 GPUs and 150 MW by 2032, more than 1,000 construction jobs, 525 permanent jobs, 500 MW across six Bell facilities.

---

## 8. Fields that must stay null

Recording a plausible value here is how the original dataset broke.

- **CAIDA membership size** — the centre's own pages give three different figures (83 professors / 24 units, 100+ / 27, 100+ / 30).
- **Quantum Algorithms Institute address and region** — the current site publishes no address anywhere.
- **Innovate BC reporting ministry** — two government pages disagree; the later one says Finance.
- **BC + AI founding year** — the association's own About page says 2023, its press kit says 2024.
- **All `funding`, `description`, `keyPeople` and focus-area values inherited from the 2025 backup** — the maintainers' own FAKE_DATA_AUDIT_REPORT establishes these were generated, not researched.

---

## 9. Two rules the map needs before it ships

Both surfaced from real records, not hypotheticals.

**Virtual-first organizations.** BC Tech Association states it operates as a fully virtual team; its address is a mailing address, not a place. QAI publishes no address at all. Decide whether these appear as directory-only records without map pins, or are pinned to a mailing address with a qualifier.

**Province-wide organizations.** The First Nations Technology Council's mandate covers all 204 First Nations in BC. Forcing it into one regional chapter misrepresents it. The region field needs a province-wide value.
