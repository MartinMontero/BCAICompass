# AUDIT — the BC AI ecosystem dataset as it actually exists

**Project:** BC AI Compass (bcaicompass.ca)
**Audit date:** 2026-08-19
**Auditor:** automated analysis + manual reading, run against read-only reference clones
**Scope:** the three surviving artifacts of `bc-ai--ecosystem-map`, and the
`builderworkshop.ca` code pattern this project adapts.

Every factual statement in this file carries one of three labels:

- **CONFIRMED** — read in a named file at a stated path, or produced by a PowerShell
  command recorded here that you can re-run.
- **INFERRED** — reasoned to from confirmed facts; the reasoning is stated.
- **UNKNOWN** — not established, and not guessed.

Nothing here is copied forward as a published value. Per the licensing position in
[PLAN.md](PLAN.md), artifact A is used **only as a list of organization names to go
and check.**

---

## 0. How to reproduce every count in this document

All analysis scripts live in `research\audit\` and are read-only — they open the
reference clones and write nothing to them.

```powershell
powershell -NoProfile -File .\research\audit\Analyze-ArtifactA.ps1 -Section fields
powershell -NoProfile -File .\research\audit\Analyze-ArtifactA.ps1 -Section urls
powershell -NoProfile -File .\research\audit\Analyze-ArtifactA.ps1 -Section names
powershell -NoProfile -File .\research\audit\Analyze-ArtifactA.ps1 -Section categories
powershell -NoProfile -File .\research\audit\Analyze-ArtifactA.ps1 -Section domains
powershell -NoProfile -File .\research\audit\Analyze-ArtifactA.ps1 -Section fuzzy
powershell -NoProfile -File .\research\audit\Analyze-ArtifactA.ps1 -Section filters
powershell -NoProfile -File .\research\audit\Analyze-FieldContamination.ps1
powershell -NoProfile -File .\research\audit\Find-EntityKindDefects.ps1
powershell -NoProfile -File .\research\audit\Find-SynthesizedUrls.ps1
powershell -NoProfile -File .\research\audit\Analyze-ArtifactsBC.ps1
```

Each section below names the script and `-Section` that produced its numbers.

> **A PowerShell trap worth recording, because it cost a cycle.** Windows PowerShell
> 5.1 decodes a BOM-less `.ps1` as CP1252. A UTF-8 em dash (`E2 80 94`) then decodes
> to `â€` plus `U+201D`, and the 5.1 lexer accepts `U+201D` as a string delimiter —
> so a single em dash in a comment silently unbalances every quote after it and the
> file fails to parse hundreds of lines later. Every script in `research\audit\` is
> therefore **pure ASCII**, with non-ASCII regex characters built from `[char]`
> codes. **CONFIRMED** — observed, diagnosed and fixed during this audit.

---

## 1. The three artifacts, and why none of them is the dataset

**CONFIRMED.** The source of truth is a private Notion database
(`databaseId 1f0c6f799a3381bd8332ca0235c24655`, read from artifact A's own header)
requiring `NOTION_TOKEN`. It is not in the repository and is not available here.
`CONTRIBUTING.md:77` in the reference clone names the same database id.

| | Artifact A | Artifact B | Artifact C |
|---|---|---|---|
| Path | `archive\2025-08-04-project-cleanup\cleanup-files\database-backup-2025-08-04.json` | `data\reports\refined-database-completeness-analysis-2025-08-04.json` | `tools\data\quality-reports\database-quality-2025-10-19.json` |
| Dated | 2025-08-04T03:05:53.411Z | 2025-08-04T04:53:44.824Z | 2025-10-19T05:26:14.446Z |
| Rows | 1,399 | 1,224 | 839 |
| Field values | **yes — the only one** | nulled | absent |
| Useful for | the name list, and evidence of damage | its `summary` block | proof of a later cleanup, and 67 new names |

All three rows of that table: **CONFIRMED** by `Analyze-ArtifactA.ps1` and
`Analyze-ArtifactsBC.ps1`.

### 1.1 Artifact B's summary, read directly

**CONFIRMED** (`Analyze-ArtifactsBC.ps1`, and `$b.summary` printed verbatim):

```
total                         1224
missingWebsite                 853  (69.7%)
missingEmail                   999  (81.6%)
missingFoundingYear            702  (57.4%)
missingDescription            1224  (100%)
missingKeyPeople               980  (80.1%)
missingFunding                 755  (61.7%)
completeOrganizations            0
nearCompleteOrganizations      173
emptyOrganizations             451
```

`analysis_notes` reads: `Refined analysis with better filtering of system/meta
entries` — the maintainers knew system and meta entries were in the database and
filtered 175 of them out to get from 1,399 to 1,224. **CONFIRMED.** They did not
filter enough; see §3.

### 1.2 Artifact C, and the 6% that matters most

**CONFIRMED.** `analysis.totalOrgs` = 839, `analysis.overallScore` = 45.
Field completeness as of 2025-10-19:

| Field | complete | of 839 |
|---|---|---|
| BC Region | 745 | 89% |
| Category | 743 | 89% |
| Short Blurb | 702 | 84% |
| City/Region | 580 | 69% |
| Year Founded | 552 | 66% |
| Size | 463 | 55% |
| Email | 447 | 53% |
| Latitude / Longitude | 414 | 49% |
| LinkedIn | 337 | 40% |
| Key People | 300 | 36% |
| Funding | 273 | 33% |
| AI Focus Areas | 265 | 32% |
| Employee Count | 235 | 28% |
| Revenue | 190 | 23% |
| Phone | 181 | 22% |
| Valuation | 120 | 14% |
| Logo | 19 | 2% |
| **Data Sources** | **49** | **6%** |
| Website | 520 | 62% |

**The single most important number in this audit is that last block: `Data Sources`
was populated on 49 of 839 rows.** **CONFIRMED.** Even in its healthiest observed
state, 94% of the database could not say where any of its values came from. This is
not a gap that a cleanup pass fixes — it is the reason the whole dataset has to be
rebuilt from sources rather than corrected in place.

### 1.3 The gap between A and C is real, and it cuts both ways

**CONFIRMED** (`Analyze-ArtifactsBC.ps1`). Distinct names: A = 1,398 (1,399 rows,
one exact-duplicate pair), C = 285 enumerated, B = 1,223.

- **67 names appear in artifact C that do not appear in artifact A.** These are
  organizations added to Notion between 2025-08-04 and 2025-10-19. They are a
  legitimate second lead source and are folded into the seed list. Examples,
  verbatim: `Digital Democracies Institute - SFU`, `SFU Metacreation Lab`,
  `Central Interior Business Accelerator`, `Northern Innovation Network`,
  `InBC Investment Corp`, `PacifiCan Regional AI Initiative`, `GeologicAI`,
  `Innovation Island`, `IM4 Lab (Emily Carr University)`, `Tech Yukon`.
- **1,180 names in A do not appear in C's enumerated lists.** **INFERRED** — this
  number overstates deletions, because artifact C enumerates only 285 names out of
  the 839 it counts; the remaining 554 are counted but not named. The honest
  statement is: C names 285 organizations, 67 of which are new; the fate of the
  other 1,180 A-names is **UNKNOWN**.
- `Tech Yukon` in that list is **not British Columbia**. **CONFIRMED** from the
  name; Yukon is a separate territory. Even the newest artifact carries scope errors.

**INFERRED, and stated plainly wherever it bears on a conclusion:** the drop from
1,399 rows (2025-08-04) to 839 (2025-10-19) means a Notion cleanup happened *after*
the only value-bearing dump was taken. **Neither artifact reflects current state.**
Artifact A is the only source of field values and is known-contaminated; artifact C
is the newest signal and carries no field values. There is no artifact that is both
current and value-bearing. **UNKNOWN:** what the database contains today, 2026-08-19,
roughly ten months after artifact C.

---

## 2. Artifact A — full defect inventory

Produced by `Analyze-ArtifactA.ps1`, `Analyze-FieldContamination.ps1`,
`Find-EntityKindDefects.ps1` and `Find-SynthesizedUrls.ps1`. **All counts CONFIRMED.**

### 2.1 Shape and field presence

`-Section fields`. 1,399 rows; `properties` carries exactly eight keys across the
whole file: `category, email, funding, keyPeople, name, status, website, yearFounded`.

| Field | present | % | missing |
|---|---:|---:|---:|
| name | 1,399 | 100.0% | 0 |
| category | 850 | 60.8% | 549 |
| yearFounded | 562 | 40.2% | 837 |
| funding | 480 | 34.3% | 919 |
| website | 466 | 33.3% | 933 |
| status | 290 | 20.7% | 1,109 |
| keyPeople | 255 | 18.2% | 1,144 |
| email | 244 | 17.4% | 1,155 |

**Rows carrying a name and nothing else usable: 477.**

> **Disagreement with the ESTABLISHED FINDINGS block, stated rather than silently
> reconciled.** The brief says "region is empty on every row" and "description is
> empty on every row". More precisely: **the `region` and `description` keys do not
> exist in artifact A at all** — not on any row, empty or otherwise. **CONFIRMED**
> by `Analyze-FieldContamination.ps1`, which tests for `description, region, city,
> latitude, longitude, lat, lng, linkedin, size, employees` and reports all ABSENT.
> The practical consequence is identical (no region, no description to carry
> forward) but the mechanism differs, and it matters: artifact B's normalized records
> *do* name `description`, `size` and `region` keys (all null), and artifact C shows
> the live Notion schema had grown to include BC Region, Latitude, Longitude, Short
> Blurb, Size and AI Focus Areas by October 2025. The schema expanded after the dump;
> **the values are UNKNOWN to us.**

### 2.2 The `website` field

`-Section urls`.

| Measure | Count |
|---|---:|
| non-empty `website` values | 466 |
| of those, real `http(s)` values | **403** |
| of those, the literal placeholder `**` | **63** |
| rows with no usable URL at all | 996 |
| `http://` (insecure scheme) | 0 |
| leading/trailing whitespace in URL | 0 |

**Confirms the established finding of 403.** Extends it: the 63 non-http values are
not varied junk — they are 63 identical instances of the two-character string `**`,
a markdown bold marker that survived a scrape with its content lost. Verbatim, all
63 are `**`.

**Defect: LinkedIn company page in the `website` field — 15 rows.** Confirms the
established finding exactly. Three verbatim:

| name | website |
|---|---|
| `SandboxAQ` | `https://www.linkedin.com/company/sandboxaq` |
| `MetaOptima / MetaOptima (DermEngine)` | `https://www.linkedin.com/company/metaoptima-technology-inc-` |
| `Visier` | `https://ca.linkedin.com/company/visier-analytics` |

**Defect: meetup.com group page in the `website` field — 6 rows.** New; not in the
established list. Three verbatim:

| name | website |
|---|---|
| `Web 3.0 Vancouver` | `https://meetup.com/blockchain-vancouver` |
| `Ethereum Vancouver (EthVan)` | `https://meetup.com/ethvancouver-meetup-group` |
| `Women in ML & Data Science (WiMLDS YVR)` | `https://meetup.com/Vancouver-Women-in-Machine-Learning-and-Data-Science` |

These are not a defect in the same sense — a meetup group's Meetup page may be its
only real home — but the URL is a platform page, not a domain the organization
controls, and the distinction must be recorded rather than flattened.

### 2.3 The `website` field cannot be trusted row-by-row — the sharpest finding

`Find-SynthesizedUrls.ps1`. `FAKE_DATA_AUDIT_REPORT.md` lists "Website URLs:
Auto-generated patterns, not verified" under *POSSIBLY FAKE/OUTDATED* but gives no
count. This audit measures it.

Test: does the registered domain equal `slug(name)` plus a common TLD, where
`slug` is the name lowercased with all non-alphanumerics stripped?

| Measure | Count | of 403 |
|---|---:|---:|
| website whose registered domain == `slug(name)` + common TLD | **176** | 44% |
| of those, the bare shape `https://www.<slug>.<tld>` with no path | 122 | 30% |
| of those, exactly `https://www.<slug>.com` | 110 | 27% |

**INFERRED, with the reasoning stated and the limit stated.** 176 is an **upper
bound on synthesis, not a count of fakes.** Hootsuite, Thinkific, Trulioo,
Procurify, Terramera and Kabam genuinely are `www.<name>.com` — a real company
matching a template is not evidence of a generated value. The finding is not "176
URLs are fabricated". The finding is: **for 176 of the 403 URLs, the URL's own shape
carries no information about whether anyone ever checked it.** Combined with
`Data Sources` populated on 6% of rows (§1.2), there is no row-level basis for
trusting any URL in artifact A without re-checking it.

The tail of that list is where the pattern shows itself. Verbatim:

| name | website |
|---|---|
| `Service BC AI Search Platform` | `https://www.service.io` |
| `ChildCare Services BC AI Platform` | `https://www.childcare.com` |
| `Swipe Right App` | `https://www.swipe.com` |

`service.io`, `childcare.com` and `swipe.com` are generic domains that do not
plausibly belong to a BC government AI search platform, a BC childcare AI platform,
or a BC startup. **INFERRED** from the mismatch between a specific BC-scoped name and
a generic global domain.

Cross-check: only **2** rows carry both a name-derived URL and a bare-dollar funding
value (`Fintel Connect`, `Theory+Practice`). **CONFIRMED.** The two contamination
mechanisms are largely disjoint, which means they were introduced by different tools
in different passes — consistent with `FAKE_DATA_AUDIT_REPORT.md` naming several
separate offending scripts.

### 2.4 Fabricated `funding` — quantified

`Analyze-FieldContamination.ps1`. `FAKE_DATA_AUDIT_REPORT.md` (2025-08-09) is a
maintainer-written admission that the funding tooling generated mock investment data.
This is the measurement.

| Measure | Count |
|---|---:|
| rows carrying a `funding` value | 480 |
| values of the bare shape `$NNN[KMB]` | **230** |
| **distinct** bare-dollar values among those 230 | **26** |

Frequency of the top values, verbatim:

```
26x [$5M]    21x [$25M]   19x [$500K]  16x [$18M]   15x [$1.5M]
14x [$12M]   13x [$50M]   12x [$3M]    12x [$4M]    11x [$8M]
11x [$1M]     9x [$35M]    9x [$75M]    9x [$20M]    8x [$2M]
```

**CONFIRMED as a count. INFERRED as to meaning, reasoning stated:** 230 funding
figures drawn from a pool of 26 round numbers, with `$5M` appearing 26 times and
`$25M` 21 times, is not what independently researched funding data looks like. Real
funding rounds do not cluster on two dozen round values. This is a generator. It
corroborates `FAKE_DATA_AUDIT_REPORT.md` from the data side rather than taking the
report's word for it.

**Every `funding` value in artifact A is unusable and is discarded.** Not
re-verified — discarded, because "verifying" a generated number means researching the
real figure from scratch, at which point the artifact A value contributed nothing.

### 2.5 `keyPeople`, `yearFounded`, `email`, `status`

| Field | Finding | Label |
|---|---|---|
| `keyPeople` | 255 rows populated; **72 carry an inline `(Source: ...)` tag**, of which 52 say `Company website`. **20 name no identifiable person at all** — e.g. `Tangam Systems` = `Leadership team`, `AgriSense AI` = `Agricultural technology team`, `Apple Vancouver` = `Vancouver office leadership`. | CONFIRMED |
| `keyPeople` | The 72 source tags are the only provenance anywhere in artifact A, and they are free text inside a person field, not a URL. `TechCouver`, `Browse AI`, `Industry reports`, `Company research` are not resolvable citations. | CONFIRMED / INFERRED as to usability |
| `yearFounded` | 562 rows; **0 implausible or non-4-digit values**. But **2018 appears 105 times** (19% of all populated values), 2017 64 times, 2015 62 times, 2010 53 times. | CONFIRMED |
| `yearFounded` | **INFERRED:** a fifth of a BC-wide organization set sharing one founding year is not a natural distribution. Consistent with a default or a name/pattern inference. Not proven per row. Treated as a **lead**, never published without an independent source. | INFERRED |
| `email` | 244 rows; **0 malformed**, and **0 of the npm-package shape `name@1.2.3`**. | CONFIRMED |
| `email` | The `aos@2.3.1` / `webcomponentsjs@2.2.7` scraper damage described in `FAKE_DATA_AUDIT_REPORT.md` **is not present in artifact A**. That damage was in the separate *funding* database the report audits, not in the ecosystem database dumped here. **This is a place my findings differ from a plain reading of the brief and I am stating it rather than reconciling it silently.** | CONFIRMED |
| `status` | Only two distinct values exist: `Researching` (289 rows) and `Partnership Established` (1 row). This is a workflow field, not an organization status field, and carries nothing publishable. | CONFIRMED |

### 2.6 Name-field defects

`-Section names` and `Find-EntityKindDefects.ps1`.

#### 2.6.1 Section headings imported as organizations — 3 rows

Confirms the established finding exactly. All three, verbatim:

```
[Investment & Accelerators (15)]
[Academic & Research (12)]
[Major Tech Companies & Enterprise (15)]
```

And a detail the established list did not carry: `Investment & Accelerators (15)`
carries the website `https://www.spring.is/` — **the same URL as the real
organization `Spring Activator`**. **CONFIRMED** by `-Section domains`. The heading
absorbed the URL of the first organization listed beneath it in the source document.
That is a fingerprint of the scrape, and it means a heading row can look like a
credible record on any check that only asks "does it have a URL".

#### 2.6.2 Markdown / list-numbering artifacts in the name — 20 rows

The established list says 5. **The real count is 20.** **CONFIRMED.** The established
5 are the `**bold**` cases; the other 15 are bare list numbering (`8. Quantum
Algorithms Institute`), which the established list mentions as an example without
counting the class. Three verbatim from each sub-shape:

*Bold markers (4 rows):*
```
[5. **Thales Canada**]
[4. **SandboxAQ (Good Chemistry Acquisition)**]
[1. **Unblocked**]
```

*List numbering only (16 rows):*
```
[8. Quantum Algorithms Institute]
[11. PacifiCan AI Initiative]
[3. Mangrove Lithium (Strategic Investment Target)]
```

Note `3. Mangrove Lithium (Strategic Investment Target)` — the scrape carried the
*analyst's editorial annotation* into the organization's name.

#### 2.6.3 Unmerged duplicates — 25 rows, not 1

The established list names 1 (`MetaOptima / MetaOptima (DermEngine)`).
**25 rows carry the ` / ` conflation shape.** **CONFIRMED.** Three verbatim:

```
[VRFY Inc. / VRIFY Technology]
[Microsoft Research Asia Vancouver / Microsoft Vancouver]
[DevFest YVR / AI Summit Vancouver]
```

**INFERRED, reasoning stated:** these are not all the same failure. `VRFY Inc. /
VRIFY Technology` is one organization with a misspelled variant. `Microsoft Research
Asia Vancouver / Microsoft Vancouver` conflates two distinct entities into one row.
`DevFest YVR / AI Summit Vancouver` conflates two distinct *events*. All three are
unusable as a single record, for different reasons. Each needs splitting or dropping
by hand.

#### 2.6.4 The largest defect class in artifact A: rows that are not entities

**This class is absent from the established findings and is larger than every other
class combined.** `Find-EntityKindDefects.ps1`.

| Sub-class | Count | Three verbatim examples |
|---|---:|---|
| Name ends in a colon — a markdown field label | **142** | `[Headquarters:]` `[CEO:]` `[Team Size:]` |
| Report-section / analysis phrase (no payload, no org token) | **86** | `[Talent Mapping]` `[Revenue Metrics]` `[Ecosystem Maturity Indicators]` |
| Database schema field label | **31** | `[Year Founded]` `[Employee Count]` `[Last Verified]` |
| Imperative to-do line | **13** | `[Deep dive specific sectors]` `[Track exits and acquisitions]` `[Monitor funding announcements]` |
| Bare year or year range | **4** | `[2025]` `[2023-2024]` `[2019-2020]` |
| Filename | **1** | `[batch-15-formatted.json]` |
| **Union (deduplicated)** | **262** | |

**All CONFIRMED.** Every one of the 262 carries **zero** `http(s)` websites — checked
explicitly, the count is 0. That is a clean structural signature: these rows entered
the database as text, never as records.

**INFERRED, reasoning stated.** A row named `Headquarters:` next to rows named `CEO:`
and `Team Size:` is not a failed organization record. It is a **markdown table or
bulleted profile that was ingested line by line**, with each label becoming a row.
The maintainers saw this — artifact B's `analysis_notes` says "better filtering of
system/meta entries" and removed 175 rows — but 262 of them are still present in the
1,399, and by B's own count 451 rows remained empty after their filter.

**The residual is where automated classification runs out.** 477 rows have no payload
beyond a name; 262 are machine-classified as non-entities; **215 are not.**
**CONFIRMED.** That residual is a genuine mix — it contains both real organizations
with no data (`Microsoft Vancouver`, `General Fusion`, `Neptune Terminals`) and more
report fragments the patterns did not catch. The full 215 are printed by
`Find-EntityKindDefects.ps1` so a human can settle each one. **I am not asserting a
split. The split is UNKNOWN without human review, and that is the honest finding.**

#### 2.6.5 Person-not-organization — the expected class that is not there

**CONFIRMED, and it is a negative result worth recording.** A heuristic for personal
names (2–3 capitalised words, no organization token) returns 122 candidates.
**Reading all 122: not one is a person.** They are report fragments (`Key People`,
`Technical Founders`, `Domain Expertise`) and genuine two-word company names
(`Moment Energy`, `General Fusion`, `Corvus Energy`, `Carbon Engineering`).

**Artifact A does not appear to contain person-rows.** The `person-not-org` flag is
retained in the seed schema because the brief defines it in the closed set and
because the GAPS.md additions may surface one, but **its count against artifact A is
0**, and the flag's false-positive class is report fragments, not people.

#### 2.6.6 Product-not-organization — 9 candidates, 5 substantive

**CONFIRMED.** Nine rows match a product-shaped name; four are report fragments
already counted above (`Platform:`, `Platform Integration:`, `Hootsuite Platform
Integrations`, `Otter Platform`). The five substantive ones, verbatim:

```
[Flento app (by Acrostrong)]        -> https://www.flento.com
[Swipe Right App]                   -> https://www.swipe.com
[ChildCare Services BC AI Platform] -> https://www.childcare.com
[Service BC AI Search Platform]     -> https://www.service.io
[CoPilot AI]                        -> https://www.copilot.ca
```

`Flento app (by Acrostrong)` is explicit: the row is a *product*, and it names its
*maker* parenthetically. The organization is Acrostrong; the row is the app. Four of
the five carry a name-derived URL (§2.3). **CoPilot AI is a real Vancouver company**
and is a false positive of the pattern — recorded so the flag is not read as a verdict.

#### 2.6.7 Encoding damage, truncation, placeholders, whitespace

| Class | Count | Finding | Label |
|---|---:|---|---|
| Mojibake / `U+FFFD` in names | **0** | Tested for `Ã`, `Â`, `â`, `ƒ` and the replacement character. **Artifact A has no encoding damage.** The established-findings brief lists encoding damage as something to look for; it is not present. Stating the negative rather than omitting it. | CONFIRMED |
| Non-ASCII in names | **4** | All four are legitimate, not damage: `Good Chemistry → SandboxAQ` (a real arrow), `WillowTree®`, `LōD Technologies Inc.`, `VR/AR Association – Vancouver Chapter` (en dash). | CONFIRMED |
| Truncated / dangling punctuation | **142** | Entirely the colon-terminated fragment class of §2.6.4. No genuinely truncated organization names found. | CONFIRMED |
| Placeholder *names* | **0** | No `N/A`, `TBD`, `Unknown`, `-`, `?`, `test`, `untitled`. | CONFIRMED |
| Placeholder *values* | **63** | All in `website`, all the literal `**`. No other field carries a placeholder. | CONFIRMED |
| Names ≤ 3 chars | **3** | `[UBC]` `[Cmd]` `[T4G]` — all three are real organizations, not defects. | CONFIRMED |
| Names ≥ 55 chars | **12** | Long but legitimate — e.g. `[BCIT Applied Research Centre for Sustainability Energy and Resource Innovations]`. **No sentence or description was imported as a name.** | CONFIRMED |
| Whitespace hygiene | **1** | `[CAIDA ]` — one trailing space. It causes a real problem: `CAIDA ` will not match `CAIDA` on any exact join. | CONFIRMED |

---

## 3. Collision analysis

`-Section domains` and `-Section fuzzy`. Exact matching finds almost nothing; the
duplicates are real and hide behind punctuation, legal suffixes and shared domains.

### 3.1 Exact name duplicates — 2 rows

**CONFIRMED.** One group only: `Digital Technology Supercluster` appears twice, with
two different URLs (`https://www.digitalsupercluster.ca` and
`https://digitalsupercluster.ca`).

### 3.2 Normalized name duplicates — 30 groups, 61 rows

Normalization lowercases, strips leading list numbering, strips `**`, strips
parentheticals, expands `&`, drops legal and generic suffixes (`inc`, `ltd`, `labs`,
`technologies`, `canada`, `bc`, …), and collapses to alphanumerics. **CONFIRMED.**

Three verbatim groups showing three distinct causes:

```
[sandboxaq]      <- "SandboxAQ" | "4. **SandboxAQ (Good Chemistry Acquisition)**" | "SandboxAQ (Good Chemistry Acquisition)"
[finn ai]        <- "Finn AI" | "Finn.ai"
[viatec]         <- "VIATEC (Victoria Innovation, Advanced Technology & Entrepreneurship Council)" | "VIATEC"
```

The full 30 include `[unblocked]`, `[thales]`, `[phaidra]`, `[growlyn]`,
`[hugo]`, `[origen air]`, `[ekona power]`, `[mangrove lithium]`,
`[quantum algorithms institute]`, `[beatdapp software]`, `[aqua intelligent]`,
`[pacifican ai initiative]` — **twelve groups whose sole cause is that the same
organization was scraped twice, once with list numbering and once without.**
**INFERRED** from the pairing shape (`N. Name` vs `Name`), which is unambiguous.

Four of the 30 are collisions *between report fragments*, not organizations:
`[expansion]`, `[focus]`, `[key]`, `[technical leadership]`. Their presence in a
duplicate report is itself evidence for §2.6.4.

### 3.3 Fuzzy name pairs — 11 pairs at Levenshtein ≤ 3 and similarity ≥ 0.82

**CONFIRMED.** Computed over 1,352 distinct normalized names of length ≥ 4, blocked
by first letter, using a Levenshtein implementation compiled via `Add-Type`.

Two are **real duplicates exact and normalized matching both missed**:

```
d=1 r=0.889  [This Fish]                ~  [ThisFish Inc.]
d=1 r=0.909  [WellHealth Technologies]  ~  [WELL Health Technologies Corp]
```

One is a **false positive that would corrupt the dataset if applied blindly**:

```
d=2 r=0.846  [Lila Sciences]  ~  [Life Sciences BC (LSBC)]
```

Lila Sciences and Life Sciences BC are unrelated. **This is why fuzzy matching feeds
a human review queue and never an automatic merge.** The remaining eight pairs are
collisions between report fragments (`[Year 2] ~ [Year 1]`, `[Description:] ~
[Company Descriptions:]`).

### 3.4 Containment pairs — 133

One normalized name is a token-prefix of another (≥ 6 chars). **CONFIRMED.** Three
verbatim, showing that this class is mostly *legitimate hierarchy*, not duplication:

```
[Microsoft]   <  [Microsoft Vancouver]
[AbCellera]   <  [AbCellera Biologics]
[Vancouver]   <  [Vancouver Tech Journal]
```

`Microsoft` vs `Microsoft Vancouver` vs `Microsoft Research Asia Vancouver` vs
`Microsoft Canada AI Hub` are four different things and correctly four rows — except
that a fifth row conflates two of them (§2.6.3). **INFERRED:** containment is a
signal to review, not a duplicate detector. Of the 133, a large share involve the
`[Vancouver]`, `[Research:]`, `[Funding:]`, `[Notable:]` and `[Market]` fragment
prefixes and are artifacts of §2.6.4 rather than organization duplication.

### 3.5 Registered-domain collisions — 10 domains, 38 rows

**CONFIRMED.** 403 rows resolve to 375 distinct registered domains.

| Domain | Rows | Reading | Label |
|---|---:|---|---|
| `linkedin.com` | 15 | Not a collision — the LinkedIn-as-website defect (§2.2). | CONFIRMED |
| `meetup.com` | 6 | Not a collision — six distinct meetup groups on one platform. | CONFIRMED |
| `ubc.ca` | 3 | Three distinct UBC units on subdomains. Legitimate. | CONFIRMED |
| `sfu.ca` | 2 | Two distinct SFU units. Legitimate. | CONFIRMED |
| `uvic.ca` | 2 | Two distinct UVic units. Legitimate. | CONFIRMED |
| **`ainbc.ai`** | 2 | **Real duplicate:** `Artificial Intelligence Network of BC (AInBC)` and `AI Network of BC (AInBC)` — same organization, same URL, two rows. | CONFIRMED |
| **`bc-ai.net`** | 2 | **Real conflation:** `BC + AI Ecosystem Association` and `Vancouver AI` both point at `https://vancouver.bc-ai.net`. | CONFIRMED |
| **`digitalsupercluster.ca`** | 2 | **Real duplicate** — also the only exact name duplicate (§3.1). | CONFIRMED |
| **`spring.is`** | 2 | **The section heading `Investment & Accelerators (15)` sharing `Spring Activator`'s URL.** | CONFIRMED |
| `innovatebc.ca` | 2 | `Innovate BC` and one of its programs. Legitimate parent/child, but a directory must decide which it lists. | CONFIRMED |

**Domain matching found four duplicates that name matching missed** (`ainbc.ai`,
`bc-ai.net`, `digitalsupercluster.ca`, `spring.is`) — including the one that proves
the heading-absorbs-URL mechanism. **This is the return on doing both.**

---

## 4. The filter cascade — how 1,399 becomes 384

`-Section filters`. **CONFIRMED**, and it reproduces the established figure exactly.

```
0. all rows                                  : 1399
1. + has an http(s) website value            :  403
2. + website is not a LinkedIn company page  :  388
3. + name is not a section heading           :  385
4. + name carries no markdown/list artifact  :  384
5. + name is not an unmerged duplicate       :  384
```

**A precision the established statement hides.** The brief says "384 rows survive
those four filters", listing the unmerged duplicate as one of them. The cascade shows
the unmerged duplicate — `MetaOptima / MetaOptima (DermEngine)` — was **already
removed at stage 2**, because its website field holds a LinkedIn URL. Stage 5 removes
zero additional rows. Likewise only **1** of the 20 markdown-artifact rows reaches
stage 4: the other 19 have no http website, or a LinkedIn one. The arithmetic is
right; the attribution is not. Recorded here so the next person does not
double-count.

**INFERRED:** the defect classes overlap heavily. Summing per-class counts against
1,399 overstates the damage. The cascade is the honest arithmetic because each stage
applies to the survivors of the previous one.

**384 is not 384 usable organizations.** It is 384 rows that pass four structural
checks. Of those, 176 carry a URL whose shape cannot be distinguished from a
generated one (§2.3), and none carries a source. **The correct reading of 384 is: a
starting list of names worth checking, and nothing more.**

---

## 5. All 70 raw category labels, in full, with row counts

`-Section categories`. **CONFIRMED.** The established finding says "40+ overlapping
labels". **The real count is 70 distinct labels, plus 549 rows with no category at
all.** Complete list, nothing omitted:

| Rows | Raw label |
|---:|---|
| 549 | *(no category)* |
| 224 | Start-ups & Scale-ups |
| 112 | AI Companies |
| 46 | Healthcare & Biotech |
| 42 | Technology Companies |
| 31 | Company |
| 29 | Enterprise / Corporate Divisions |
| 28 | Fintech |
| 26 | Academic & Research Labs |
| 25 | Service Studios / Agencies |
| 24 | Media Tech |
| 22 | CleanTech |
| 21 | Industry Association |
| 20 | Robotics |
| 18 | Cybersecurity |
| 16 | Grassroots Communities |
| 13 | Government |
| 11 | Community |
| 10 | Innovation Centres & Hubs |
| 9 | Academic |
| 9 | EdTech |
| 8 | Industry Conferences & Events |
| 8 | Investor |
| 7 | Accelerators / Incubators |
| 7 | Education & Training Providers |
| 6 | Government & Public Sector |
| 5 | Investors & Funds |
| 4 | AgTech |
| 4 | Game Development Studio |
| 4 | Non-Profit |
| 3 | Healthcare AI |
| 3 | Indigenous Tech & Creative Orgs |
| 3 | Mining |
| 3 | Port Terminal |
| 3 | PropTech Startup |
| 3 | Social-Impact & Climate-Tech Hubs |
| 2 | Academic Research Lab |
| 2 | Advocacy & Policy Groups |
| 2 | AI Startup |
| 2 | Digital Therapeutics |
| 2 | Marketing Tech |
| 2 | Media & Storytellers |
| 2 | Open-Source Projects |
| 2 | Service Providers |
| 1 | 3PL Company |
| 1 | AgTech Company |
| 1 | AI Research Organization |
| 1 | Construction Tech Startup |
| 1 | Consulting & Services |
| 1 | Corporate Partnership |
| 1 | Crypto Unicorn |
| 1 | Deep-water Terminal |
| 1 | Developer Community |
| 1 | E-commerce |
| 1 | Game Development Services |
| 1 | Government Agency |
| 1 | Industry-Healthcare Partnership |
| 1 | Innovation Consortium |
| 1 | Innovation Lab |
| 1 | Investment Fund |
| 1 | Legal Tech Leader |
| 1 | Logistics Tech |
| 1 | Port Development |
| 1 | Research Institute |
| 1 | Smart Logistics Services |
| 1 | Training Program |
| 1 | Unicorn |
| 1 | User Group |
| 1 | VR/AR |
| 1 | Web3 Startup |
| 1 | Wildfire Tech |

**CONFIRMED overlaps that make the taxonomy unusable as-is:**

- Four labels for "a company": `AI Companies` (112), `Technology Companies` (42),
  `Company` (31), `AI Startup` (2) — confirms the established finding, and adds
  `Start-ups & Scale-ups` (224), which is a fifth.
- Three for academic: `Academic & Research Labs` (26), `Academic` (9),
  `Academic Research Lab` (2).
- Three for government: `Government` (13), `Government & Public Sector` (6),
  `Government Agency` (1).
- Three for investors: `Investor` (8), `Investors & Funds` (5), `Investment Fund` (1).
- Two for agtech: `AgTech` (4), `AgTech Company` (1).
- Two for healthcare: `Healthcare & Biotech` (46), `Healthcare AI` (3).

**INFERRED:** 31 labels apply to exactly one row. A taxonomy with 31 singleton
categories is not a taxonomy — it is a free-text field. Several are not categories at
all but editorial verdicts: `Crypto Unicorn`, `Unicorn`, `Legal Tech Leader`. Those
are claims about an organization's status, unsourced, and are discarded rather than
mapped.

**The taxonomy was getting worse, not better — CONFIRMED, not inferred.** Artifact C's
`categoryBreakdown` carries **84 distinct labels** at 2025-10-19, against artifact A's
70 at 2025-08-04. **15 of C's labels do not exist in A at all**, and they are new
synonyms for categories A already had:

| New label in artifact C | Already existed in artifact A as |
|---|---|
| `Academic Lab` | `Academic Research Lab`, `Academic & Research Labs`, `Academic` |
| `Accelerator` | `Accelerators / Incubators` |
| `Innovation Center` | `Innovation Centres & Hubs` |
| `Innovation Hub` | `Innovation Centres & Hubs` |
| `Nonprofit` | `Non-Profit` |
| `Venture Capital` | `Investor`, `Investors & Funds`, `Investment Fund` |
| `Government Program` | `Government`, `Government & Public Sector`, `Government Agency` |
| `AI Community Organization` | `Community`, `Grassroots Communities`, `Developer Community` |
| `Annual Conference` | `Industry Conferences & Events` |
| `HealthTech AI` | `Healthcare AI`, `Healthcare & Biotech`, `Digital Therapeutics` |
| `EdTech AI` | `EdTech`, `Education & Training Providers` |
| `Bioprinting AI`, `Developer Tools AI`, `Regulatory Initiative`, `Business Services` | new singletons |

`Nonprofit` and `Non-Profit` coexisting in the same taxonomy is the whole problem in
two words. **Between August and October 2025 the label count rose by 14 and not one
existing synonym was collapsed.** A taxonomy that only ever grows is a free-text
field with extra steps, and it is why Phase 2 derives categories from verified content
rather than mapping the raw labels onto each other.

---

## 6. Verdict per field: carry forward, re-verify, or discard

| Field in artifact A | Disposition | Reasoning | Label |
|---|---|---|---|
| `name` | **Carry forward as a lead only.** Cleaned into `name`, preserved untouched in `name_raw`. | It is the one field with a defensible provenance: a human typed or scraped an organization's name. It is still wrong on 262+ rows (§2.6.4). It is never published without the organization's own site confirming it. | INFERRED |
| `website` | **Re-verify every row. Never publish as received.** | 176 of 403 are shape-indistinguishable from generated (§2.3); 15 are LinkedIn; 63 are `**`; provenance exists on 6% of the database (§1.2). | CONFIRMED basis |
| `category` | **Discard the value; keep the raw string for audit only.** | 70 overlapping labels, 549 rows blank, 31 singletons, editorial verdicts mixed in with types (§5). Category is re-assigned in Phase 3 from content actually read on the organization's site. | CONFIRMED basis |
| `funding` | **Discard outright.** | 230 of 480 values drawn from a pool of 26 round numbers (§2.4); maintainer-admitted generation. Nothing survives. | CONFIRMED |
| `yearFounded` | **Discard as a published value; usable as a weak lead.** | 105 rows share 2018 (§2.5). No source on any row. | INFERRED |
| `keyPeople` | **Discard outright.** | 20 rows name no person; the only provenance is untraceable free text. Also: publishing named individuals from an unsourced scrape is a privacy problem, not just an accuracy one. BC AI Compass does not publish personal names. | CONFIRMED + INFERRED |
| `email` | **Discard outright.** | Well-formed but unsourced. Publishing scraped contact emails is a spam-liability and privacy problem regardless of accuracy. | INFERRED |
| `status` | **Discard outright.** | Two values, both workflow states (§2.5). | CONFIRMED |
| `description` | **Nothing to discard — the key does not exist** (§2.1), and artifact B confirms 100% missing. Every description on the site is written from the organization's own words, cited. | CONFIRMED |
| `region` | **Nothing to carry — the key does not exist** in artifact A. Artifact C shows 89% populated by Oct 2025, but those values are **UNKNOWN** to us. Region is assigned in Phase 3 from a sourced address. | CONFIRMED |
| coordinates | **Do not exist in artifact A.** Artifact C shows lat/lng at 49%, values **UNKNOWN**. Coordinates are sourced individually or the record ships without a pin. | CONFIRMED |

**Net: exactly one field crosses from artifact A into this project — the name, as a
lead.** That is the licensing position of [PLAN.md](PLAN.md) reached independently
from the data quality side: even if the data were freely licensed, only the names
would be worth taking.

---

## 7. What builderworkshop's `Asset` type cannot express

Read from `C:\Users\User\dev\bws-reference\src\data\assets.ts`. **CONFIRMED** —
quoted verbatim:

```ts
export interface Asset {
  id: string;
  name: string;
  category: Category;
  url: string;
  blurb: string;
  location: string;
  lat?: number;
  lng?: number;
  capabilities?: string[];
  verified?: string; // YYYY-MM last re-verified
}
```

It is a good type. It is a good type **for 46 venues in Greater Vancouver that a
person can walk into.** Province-wide, it breaks in six specific places.

### 7.1 No region field

`location: string` is a display string — `'328 W Hastings St · Gastown'`. The map
section derives neighbourhood by splitting on `·`
(`AssetMap.tsx:118`: `v.location.split('·')[1]?.trim() ?? v.location`). **CONFIRMED.**

That works when every asset is in one city. It fails province-wide: there is no
field to filter Vancouver Island against the Interior against the North, and string-
splitting a display label is not a filter. **Region must be a first-class enumerated
field, not a substring.** BC's AI activity is regionally distributed — Kamloops,
Merritt, Prince George, Kelowna, Victoria, the Comox Valley — and a directory that
cannot filter by region flattens the province back into "Vancouver tech", which is
the exact failure the ecomap README complains about.

### 7.2 No organization size, and no organization type

Every `Asset` is the same kind of thing: a place. A province-wide AI map holds a
340MW data centre, a two-person startup, a university lab, a Crown corporation
programme and a volunteer meetup — and the type cannot tell them apart, nor say
whether one has 4 people or 4,000. **CONFIRMED** by inspection: no `orgType`, no
`size`. Category is doing double duty as both "what sector" and "what kind of
entity", which is exactly the confusion that produced 70 raw labels (§5).

### 7.3 No per-record source — the disqualifying gap

`verified?: string` records **when** a record was checked. Nothing records **what was
checked**. **CONFIRMED.** There is no `sourceUrl`.

For builderworkshop that is defensible: the maintainer walked into the buildings. For
a dataset rebuilt from a contaminated 1,399-row scrape where the original database
had provenance on 6% of rows (§1.2), **a verification date with no source is exactly
the artifact that got us here.** `Researching` was also a status. It meant nothing
too.

`sourceUrl` is not a nice-to-have field. It is the difference between this project
and the thing it is replacing.

### 7.4 `capabilities` assumes a physical venue with equipment

```ts
export const CAPABILITY_LABELS: Record<string, string> = {
  '3d-print': '3D Printing', laser: 'Laser Cutting', cnc: 'CNC',
  wood: 'Woodshop', metal: 'Metalshop', electronics: 'Electronics',
  robotics: 'Robotics', glass: 'Glass', ceramics: 'Ceramics',
  recording: 'Recording & Podcast', digitization: 'Digitization',
};
```

**CONFIRMED.** The model is "I want to make X, where is a machine". It powers the
map's headline interaction — `AssetMap.tsx` builds a `capInsight` line reading
*"Laser Cutting: 6 venues — densest in Strathcona"*. **CONFIRMED.**

There is no province-wide AI equivalent. "I want to train a model, where is a GPU"
is not answerable by walking in. The whole capability axis is dropped, not
translated — and with it the "I want to make" filter row, which must be replaced by
region rather than left as an empty shelf.

### 7.5 `lat`/`lng` optionality is right; the map's use of it is not

The optional-coordinates model is sound and is kept: records with coordinates pin,
records without appear in the directory only. `MAPPED = ASSETS.filter(a => a.lat !==
undefined)` and the Pathways section renders the complement as "The Orbit".
**CONFIRMED** — this is the one part of the pattern that survives the scale change
untouched.

What does not survive is the map's initialisation:

```tsx
<MapContainer center={[49.26, -123.11]} zoom={11} ...>
```

**CONFIRMED** at `AssetMap.tsx:294`. Hardcoded to downtown Vancouver at city zoom.
Prince George is 500km north; at zoom 11 it is off-screen before the first paint.
`FitBounds` does run afterward, but the initial frame is wrong and, more importantly,
`FlyTo` hardcodes `map.flyTo([lat, lng], 16)` — street zoom — which is meaningless
for a record whose coordinate is a city centroid rather than a front door.

There is also **no marker clustering**. At 46 markers none is needed. With the Lower
Mainland's density at province scale, unclustered markers become one unreadable blob
and every non-Lower-Mainland organization — the ones this project exists to surface —
disappears underneath it.

### 7.6 `blurb` is required and unsourced

`blurb: string` is non-optional. **CONFIRMED.** Every record must have prose. In
builderworkshop that prose was written by someone who visited. Here, a required
description field with no source field attached is precisely the slot that
`FAKE_DATA_AUDIT_REPORT.md` describes being filled by
`generateDescription(name, type)` returning "Venture capital firm focused on
technology investments" for every VC. **The field must become optional, and must be
paired with a source.** A record with no description and a real source URL is worth
more than a record with a fluent description and none.

### 7.7 Summary

| bws `Asset` field | Province-wide verdict |
|---|---|
| `id`, `name`, `url` | Keep as-is |
| `category` | Keep the shape, replace the values; add `orgType` so category stops doing two jobs |
| `blurb` | Make optional; never generate |
| `location` | Keep as a display string, but add `region` as a real enum |
| `lat?`/`lng?` | Keep exactly as-is — the best idea in the type |
| `capabilities?` | Drop entirely; no province-wide AI analogue |
| `verified?` | Keep, and promote to required — but useless alone |
| — | **Add `region`, `orgType`, `size`, `sourceUrl`, `sourceDate`, `status`** |

Full replacement type in [PLAN.md](PLAN.md) §1.

---

## 8. The esbuild defect in the fork's build chain

**CONFIRMED**, three ways:

1. `C:\Users\User\dev\bws-reference\scripts\export-data.mjs:3` reads
   `import { build } from 'esbuild';`
2. `Select-String -Path package.json -Pattern 'esbuild' -SimpleMatch` returns
   **nothing** — esbuild appears in neither `dependencies` nor `devDependencies`.
3. `Test-Path node_modules` returns **False**, and there is no `package-lock.json` in
   the reference clone — so nothing pins the version that made it work.

`export-data.mjs` runs as `prebuild`, ahead of `tsc -b && vite build`. **CONFIRMED**
from `package.json:"prebuild": "node scripts/export-data.mjs"`.

**INFERRED, reasoning stated.** It works today because Vite depends on esbuild, npm
hoists transitive dependencies to a flat `node_modules/`, and a bare `import
'esbuild'` from a script in the same tree resolves to the hoisted copy. That is not a
contract. It breaks when: npm changes hoisting; a future Vite bundles esbuild rather
than depending on it, or moves to Rolldown (which Vite has publicly been moving
toward); the project switches to pnpm or Yarn PnP, both of which enforce strict
resolution by default; or `npm ci --omit=dev` is used, since Vite is a devDependency.
When it breaks it breaks at `prebuild` — before the type-check — with a bare module
resolution error and no obvious connection to `ecosystem.json` being stale.

The build would then **succeed** on a stale `public/ecosystem.json` if one were
committed, silently shipping yesterday's data. That is the failure mode worth
preventing.

### The fix for the fork

**Declare it.** `esbuild` is a direct, first-party build dependency of this
repository's data pipeline and belongs in `devDependencies`:

```json
"devDependencies": {
  "esbuild": "^0.25.0",
  ...
}
```

Two supporting changes, both adopted:

1. **Commit `package-lock.json`.** The reference clone has none; a build with no
   lockfile is not reproducible, which matters more than usual for a project whose
   whole claim is verifiability.
2. **Make `export-data.mjs` fail loudly.** Wrap the export so a failure exits
   non-zero with a message naming the cause, rather than letting `prebuild` die with
   a bare resolution error. Gate 4 requires the build to succeed from a clean
   `node_modules`, and that gate is only meaningful if the data step cannot fail
   quietly.

Recorded in [PLAN.md](PLAN.md) under dependency justifications.

---

## 9. What this audit did not establish

Stated as **UNKNOWN**, not guessed:

- **What the Notion database contains today.** The newest artifact is 2025-10-19,
  ten months before this audit. **UNKNOWN.**
- **The true organization/fragment split of the 215 unclassified no-payload rows**
  (§2.6.4). Machine classification runs out; human review is required. **UNKNOWN.**
- **Which of the 176 name-derived URLs were generated and which are genuine**
  (§2.3). Determinable only by fetching each one. That is Phase 3 work, and the
  result is recorded per record, not inferred. **UNKNOWN until checked.**
- **The fate of the 1,180 A-names absent from artifact C's enumerated lists**
  (§1.3). C names 285 of the 839 it counts. **UNKNOWN.**
- **Whether any relationship exists between this project and BC + AI, Kris Krüg, the
  Internet Archive, TELUS, Bell, BC Hydro or any organization named in these repos.**
  Nothing in any file read during this audit states one. **For the purposes of this
  project, none exists.** BC AI Compass is independent, unaffiliated and unendorsed.
  See [PLAN.md](PLAN.md), "Open questions for Martin".

---

## 10. The one-paragraph version

Artifact A holds 1,399 rows. 262 of them are not organizations at all — they are
lines from a markdown report ingested one per row, and that class is larger than
every other defect combined. Of the 403 rows with a real URL, 15 point at LinkedIn,
6 at Meetup, and 176 carry a domain that is character-for-character derivable from
the organization's name, which means their shape carries no evidence anyone ever
checked them. 230 of 480 funding figures are drawn from a pool of 26 round numbers.
The category field has 70 labels for what should be six or seven. Region, description
and coordinates do not exist in the dump at all. The database's own quality report,
taken at its healthiest, records a source for 6% of rows. **The correct output of
this audit is not a cleaned dataset. It is a list of names worth checking, and a
schema in which every published value must name where it came from.**
