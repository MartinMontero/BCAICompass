# VERIFICATION — what was actually done

**Date of work:** 2026-08-19
**Reporting rule for this file:** what happened, not what the plan said would
happen. Where the two differ, the difference is stated.

Labels as in [AUDIT.md](AUDIT.md): **CONFIRMED**, **INFERRED**, **UNKNOWN**.
Anything not confirmed is marked **UNTESTED** with the reason.

---

## 0. Headline result, including the uncomfortable part

| | |
|---|---|
| Verified organizations published | **102** (floor was 100) |
| With sourced coordinates | 97 |
| Candidates NOT published, each with a reason | 1,459 |
| Individually checked and still not published | 43 |
| Exit conditions passing | 17 of 17, twice consecutively |
| osv-scanner findings | 0 across 321 packages |

**The composition of the verified set is skewed, and that is the most important
caveat in this document.** 72 of 102 records — 71% — are academic research units.
Only 6 are companies.

That is not a finding about British Columbia. It is a finding about what could be
*sourced in one pass*. A university publishes a page that names a lab, states its
research field, and identifies its campus — one fetch satisfies all four
verification conditions at once. A company's marketing site states AI prominently
and its location nowhere, so it takes two or three fetches, and roughly half of
those fetches were blocked. **Anyone reading this dataset as a picture of BC's AI
economy would be badly misled.** It is a picture of BC's AI ecosystem *as
verifiable from primary sources on 2026-08-19*, which is a narrower and more
honest thing. Correcting the skew is the top priority for the next pass, and
[SHIP.md](SHIP.md) §4 says so.

---

## 1. Every file read, with full paths

### Reference clone: `C:\Users\User\dev\ecomap-reference`

All read-only. Nothing was written to this clone, no build script was run in it,
no dependency was installed in it. **CONFIRMED.**

| Path | Why |
|---|---|
| `archive\2025-08-04-project-cleanup\cleanup-files\database-backup-2025-08-04.json` | Artifact A — 1,399 rows, the only value-bearing dump |
| `data\reports\refined-database-completeness-analysis-2025-08-04.json` | Artifact B — 1,224 rows, summary block |
| `tools\data\quality-reports\database-quality-2025-10-19.json` | Artifact C — 839 orgs, newest signal |
| `README.md` | Project intent, hosting status |
| `llms.txt` | Ground-truth notes, Next.js front end |
| `FAKE_DATA_AUDIT_REPORT.md` | Maintainer admission of generated data |
| `CONTRIBUTING.md` | Database id, data standards, verification process |
| `ROADMAP.md` | Historical counts and self-reported completeness targets |
| `package.json` | Licence declaration (`ISC`), package name `ecosystem-map-bc-ai` |

### Reference clone: `C:\Users\User\dev\bws-reference`

Also read-only, same discipline. **CONFIRMED.**

| Path | Why |
|---|---|
| `src\data\assets.ts` | The `Asset` type, categories, capabilities, `MAPPED` |
| `scripts\export-data.mjs` | The esbuild defect; the export pattern |
| `src\App.tsx` | Composition, scroll-reveal, deep-link handling |
| `src\index.css` | Token architecture |
| `src\sections\AssetMap.tsx` | Hardcoded centre/zoom, FitBounds, FlyTo, capability insight |
| `src\sections\Directory.tsx` | Row layout, verified-stamp rendering |
| `src\sections\Pathways.tsx` | Walking routes, Polyline, The Orbit |
| `src\components\Nav.tsx` | Nav, theme toggle, mobile menu |
| `src\components\Marquee.tsx` | Marquee pattern |
| `src\main.tsx` | Entry point |
| `DESIGN.md` | Per-project binding format |
| `README.md` | Deployment paths, data conventions |
| `package.json` | Dependency set; absence of esbuild |
| `vite.config.ts`, `tailwind.config.js`, `postcss.config.js` | Build config |
| `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json` | TS project refs |
| `index.html` | Pre-paint theme script, font loading, meta |
| `public\_headers` | CSP baseline |
| `public\CNAME` | Domain convention |
| `LICENSE` | MIT text and format |

---

## 2. Every count, with the command that produced it

All scripts are in `research\audit\`, pure ASCII, read-only against the clones.

| Count | Command |
|---|---|
| Field presence; rows with name only (477) | `powershell -NoProfile -File .\research\audit\Analyze-ArtifactA.ps1 -Section fields` |
| 403 http(s) URLs; 63 `**`; 15 LinkedIn; 6 meetup.com | `... -Section urls` |
| 3 headings; 20 markdown; 25 slash-conflated; 0 mojibake; 4 non-ASCII; 142 colon-terminated | `... -Section names` |
| 70 raw category labels | `... -Section categories` |
| 375 distinct domains; 10 collisions over 38 rows | `... -Section domains` |
| 2 exact / 30 normalized / 11 fuzzy / 133 containment collisions | `... -Section fuzzy` |
| The 1,399 → 403 → 388 → 385 → 384 cascade | `... -Section filters` |
| 230 of 480 bare-dollar funding from 26 distinct values; 105 rows at 2018; 72 `(Source:` tags | `powershell -NoProfile -File .\research\audit\Analyze-FieldContamination.ps1` |
| 262 non-entity rows; 215 unclassified residual; 122 person candidates | `powershell -NoProfile -File .\research\audit\Find-EntityKindDefects.ps1` |
| 176 of 403 name-derived URLs; 110 exactly `www.<slug>.com` | `powershell -NoProfile -File .\research\audit\Find-SynthesizedUrls.ps1` |
| Artifact B/C shapes; 67 C-only names; 84 C category labels | `powershell -NoProfile -File .\research\audit\Analyze-ArtifactsBC.ps1` |
| seed.json 1,399 records; flag counts; 359-record cascade | `powershell -NoProfile -File .\research\audit\Build-Seed.ps1` |
| unverified.json 1,459 records; 194 rejected; 1,265 unverified | `powershell -NoProfile -File .\research\audit\Build-Unverified.ps1` |
| CSP hash of the inline theme script | `powershell -NoProfile -File .\research\audit\Get-CspHash.ps1` |
| All 17 exit conditions | `powershell -NoProfile -File .\research\audit\Test-ExitConditions.ps1 -CleanInstall` |
| 102 records / 102 unique ids / category counts | `powershell -NoProfile -File .\research\audit\Test-ExitConditions.ps1` |

Saved outputs, committed: `report-names.txt`, `report-contamination.txt`,
`report-entitykind.txt`, `report-synth-urls.txt`, `report-domains.txt`,
`report-fuzzy.txt`, `report-bc.txt`, `report-osv-scanner.txt`,
`report-exit-run1.txt`, `report-exit-run2.txt`.

---

## 3. Where my findings disagree with the ESTABLISHED FINDINGS block

Stated explicitly rather than silently reconciled, as required.

| Established finding | What I found | Label |
|---|---|---|
| "5 carry markdown scraping artifacts in the name" | **20.** Four have `**` bold markers; sixteen more carry bare list numbering (`8. Quantum Algorithms Institute`). The brief's 5 are the bold cases plus one example of the numbering class. | CONFIRMED, extended |
| "1 unmerged duplicate" | **25** rows carry the ` / ` conflation shape. They are not all the same failure: some are one org spelled two ways, some conflate two distinct organizations, one conflates two distinct events. | CONFIRMED, extended |
| "the category taxonomy carries 40+ overlapping labels" | **70** in artifact A, **84** in artifact C, with **15 of C's labels absent from A** and every one a new synonym for a category A already had (`Nonprofit` alongside `Non-Profit`). Between the dumps the label count rose by 14 and no synonym was collapsed. | CONFIRMED, extended |
| "region is empty on every row" / "description is empty on every row" | **Neither key exists in artifact A at all** — not empty, absent. Artifact B's normalized records *name* `description`, `size` and `region` (all null), and artifact C shows the live schema had grown to include BC Region (89%), Latitude/Longitude (49%), Short Blurb (84%), Size (55%) and AI Focus Areas (32%) by October 2025. Practical effect identical; mechanism different. | CONFIRMED, corrected |
| "384 rows survive those four filters" | **Confirmed exactly** — but the attribution is wrong. The unmerged duplicate `MetaOptima / MetaOptima (DermEngine)` was already removed at the LinkedIn stage, and only 1 of the 20 markdown rows ever reaches the markdown filter. Stage 5 removes zero rows. Right number, wrong reasons. | CONFIRMED, corrected |
| `FAKE_DATA_AUDIT_REPORT.md` describes email scraper damage (`aos@2.3.1`) | **Not present in artifact A.** 244 emails, 0 malformed, 0 of the npm-package shape. That damage was in the separate *funding* database the report audits, not the ecosystem database dumped here. | CONFIRMED negative |
| Encoding damage is a defect class to look for | **Zero.** No mojibake, no `U+FFFD`. The 4 non-ASCII names are all legitimate (`WillowTree®`, `LōD Technologies Inc.`). Recording the negative because a reader would otherwise assume it went unchecked. | CONFIRMED negative |
| The closed flag set includes `person-not-org` | **Artifact A appears to contain no person-rows at all.** A heuristic returned 122 candidates; reading all 122 found only report fragments and genuine two-word company names. The flag ships with a count of 0, deliberately. | CONFIRMED negative |
| `bc-ai.ca` runs Next.js | **UNTESTED.** The fetch of bc-ai.ca confirmed its owner, navigation and offerings; it did not establish the framework. The ecomap *repository* ships a Next.js front end in `ui/` — a different fact. Marked UNKNOWN in [PLAN.md](PLAN.md) §8.3; it changes no decision. | UNKNOWN |

### The largest defect class is absent from the established list

**262 of 1,399 rows are not organizations** — they are lines lifted from a markdown
report, one row per line: 142 ending in a colon (`Headquarters:`, `CEO:`,
`Team Size:`), 86 analysis phrases (`Talent Mapping`, `Revenue Metrics`), 31 schema
field labels (`Year Founded`, `Employee Count`), 13 to-do lines
(`Track exits and acquisitions`), 4 bare years, 1 filename
(`batch-15-formatted.json`). **CONFIRMED.** All 262 carry zero http(s) URLs, which
is a clean structural signature: they entered as text, never as records.

This class is larger than every other defect class combined, and the brief's closed
flag set has no flag for it — see [PLAN.md](PLAN.md) §7.1 and
[seed-summary.md](seed-summary.md).

---

## 4. Every web search run, and what it returned

Fifteen searches. Each is listed with its yield, because a search that returned
nothing usable is also a result.

| Query subject | Yield |
|---|---|
| TELUS sovereign AI factory Kamloops/Vancouver/Westbank | 10 results; established the 85 MW / 150 MW / 60,000 GPU figures and the newswire mirror |
| Bell AI Fabric BC / Groq / TRU / Merritt / 26MW | 10 results; established six facilities, ~500 MW, and the 2025 vs 2026 two-wave timeline |
| BC Hydro competitive allocation / Bill 31 / 400MW | 9 results; established the process, the 400 MW target, the September 2026 notification, and the reported 300/100 split and 15 applications / ~800 MW oversubscription |
| BC AI startup funding rounds 2026 | 7 results; **mostly commercial lead-list sites.** Trulioo's $150M Series D usable as reported; an unnamed "$16M AgTech seed" was not |
| New AI research institutes BC 2026 | 9 results; the SFU–UBC BC AI Research-to-Adoption Summit, UBC AI and Health Network, LTIC, AMLTN, SFU's $20M Vancouver Quantum Network |
| Indigenous-led AI BC / data sovereignty | 9 results; Prophet River First Nation near Fort St. John, First Nations Technology Council, the First Nations participation criterion in the power process |
| Regional BC AI: Prince George / Kelowna / Victoria / Comox / Nanaimo | 10 results; CV+AI launch, Comox Valley Regional District AI policy, Nanaimo data centre proposal |
| BC tech acquisitions / closures 2026 | 8 results; 82+ M&A deals in 2025, SPUD/GrubMarket |
| BC AI public programs / Innovate BC / PacifiCan | 9 results; RAII at $32.2M and $3M/project, PacifiCan $17.3M (May 2026) and $13.8M (March 2026) |
| Bell Kamloops TRU groundbreaking 2026 | 10 results; 1452 McGill Road, late-2027 completion, TrueNorth Sustainable Infrastructure |
| UVic AI research centres | 7 results; ACIS Labs, UVicAI, AI@UVic hub |
| BCIT / Emily Carr / UNBC / TRU AI centres | 9 results; the correct BCIT and Emily Carr URLs (Emily Carr then 403'd) |
| BC Cancer / Providence / VCHRI AI research | 9 results; VCHRI's Digital Health and AI focus area, AIM Lab, OVCARE |
| BC city coordinates (two searches) | Municipal centroids for Kamloops, Merritt, Prince George, Courtenay, Vancouver, Burnaby, Surrey, Richmond, Victoria, Kelowna |

---

## 5. Every organization verified, with its source

All 102 published records carry `sourceUrl` and `sourceDate` in
`src\data\organizations.ts` and in `public\ecosystem.json`. Rather than duplicate
102 rows here, the sources are grouped by the page that established them — which is
also the honest way to show how much of the dataset rests on how few pages.

| Source read (2026-08-19) | Records established |
|---|---|
| `https://research.ubc.ca/ai` | 14 UBC AI institutes, networks and clusters, plus UBC itself |
| `https://www.cs.ubc.ca/research-groups` | 8 UBC CS groups (AI, CVL, DMM, ML, PLAI, InfoVis, Security & Privacy, SSL), plus UBC CS |
| `https://www.cs.ubc.ca/research-centres` | MILD, AMLTN |
| `https://ece.ubc.ca/research/` | UBC ECE Optimization, Learning, Control |
| `https://aimlab.ca` | AIM Lab |
| `https://www.med.ubc.ca/news/harnessing-ai-to-improve-ovarian-cancer-outcomes/` | OVCARE, BC Cancer, UBC School of Biomedical Engineering |
| `https://www.vchri.ca/` | VCHRI, VCH-VCHRI AI Hub |
| `https://www.sfu.ca/big-data/using-data/artificial-intelligence-at-sfu.html` | 6 SFU institutes (incl. Quantum Algorithms Institute), SFU Big Data Hub, SFU itself |
| `https://www.sfu.ca/fas/computing/research/labs.html` | 9 SFU Computing labs and groups |
| `https://www.sfu.ca/computing/research.html` | SFU AI Group, ROSIE Lab, GrUVI, SFU School of Computing Science |
| `https://www.sfu.ca/fas/computing/research/centres-and-institutes.html` | VINCI |
| `https://www.sfu.ca/siat/research/research-labs.html` | 6 SFU SIAT labs |
| `https://www.metacreation.net` | Metacreation Lab for Creative AI |
| `https://www.uvic.ca/ecs/computerscience/research/index.php` | 6 UVic CS labs, plus UVic CS |
| `https://acislabs.ca/` | ACIS Laboratories |
| `https://www.uvic.ca/campus/artificial-intelligence/index.php` | AI@UVic, plus UVic itself |
| TELUS newswire release, 2026-05-11 | 3 TELUS AI factories, TELUS, Westbank, Creative Energy, City of Vancouver |
| BetaKit 2025-05-28 + BeBeez 2026-04-14 | 4 Bell AI Fabric facilities, Thompson Rivers University, BCNET |
| `https://news.gov.bc.ca/releases/2026ECS0005-000095` | BC Hydro, Ministry of Energy and Climate Solutions |
| gov.bc.ca Regional AI Initiative | PacifiCan |
| `https://thediscourse.ca/comox-valley/...` | Comox Valley Regional District |
| `https://www.digitalsupercluster.ca` | Digital Technology Supercluster |
| `https://www.viatec.ca` | VIATEC |
| `https://www.newventuresbc.com` | New Ventures BC |
| `https://firstnationstech.ca/` | First Nations Technology Council |
| `https://bc-ai.ca` and `https://bc-ai.ca/communities` | BC + AI, Vancouver AI, FV+AI, CV+AI |
| Individual company sites | Sanctuary AI, Terramera, Novarc Technologies, Niricson, Open Ocean Robotics, Variational AI |

**INFERRED, and stated because it is a real fragility:** 59 of 102 records rest on
16 institutional pages. If UBC restructures its research site, a fifth of this
dataset loses its source at once. The re-verification cadence in
[SHIP.md](SHIP.md) treats that as a known concentration risk rather than pretending
each record is independent.

### A note on how research units were categorised

For a university lab, `category` was taken from the unit's own self-described
research field as published by its parent institution — usually its title
(`Machine Learning Group`, `Trustworthy Artificial Intelligence Lab`) or the
department's own one-line description. **That is reading a lab's stated field, not
inferring a sector from a company name**, and the distinction matters given
[AUDIT.md](AUDIT.md) §2.3. Units whose published description named no AI, ML,
robotics, vision, NLP or data-science work were **not** listed, even where the name
hinted at it. That is why 7 of UBC CS's 20 groups, 8 of SFU Computing's 20, 9 of
UVic CS's 15, all 12 BCIT research centres and all 3 TRU research centres are
absent.

---

## 6. Everything I could not confirm — UNTESTED, with reasons

### 6.1 Fetches that failed

**CONFIRMED as failures**, recorded rather than hidden. Every figure that
originated behind one of these was attributed to the mirror actually read.

| Target | Failure |
|---|---|
| `telus.com` media release | HTTP 403 — used the Cision Newswire mirror instead |
| `cbc.ca` (2 articles) | HTTP 403 — substituted BetaKit and BeBeez |
| `castanetkamloops.net` | HTTP 403 |
| `canada.ca` PacifiCan releases (2) | HTTP 403 — figures taken from search-result summaries and the gov.bc.ca RAII page |
| `bctechnology.com` | HTTP 503 |
| `www.ecuad.ca` (2 URLs) | HTTP 403 |
| `www.unbc.ca/research` | HTTP 403 |
| `sauder.ubc.ca` research centres | HTTP 403 |
| `sparkgeo.com`, `semios.com`, `clio.com` | HTTP 403 |
| `bc.net` (first attempt), `llamazoo.com` | ECONNRESET |
| `minesense.com`, `iris.io` | Empty response body |
| `quantumalgorithms.ca` | **Expired TLS certificate** |
| `4agrobotics.com` | **Resolves to a domain-sale parking page** |
| `lighthouselabs.ca` | **302-redirects off-domain** to a third-party consultant page |
| `thinkific.com/about-us`, `procurify.com/about-us`, `terramera.com/about`, `ecoation.com/about-us`, various `.ubc.ca` and `.sfu.ca` lab-index guesses | HTTP 404 at the URL tried |
| `latlong.net` category page | HTTP 403 — coordinates taken from search-surfaced gazetteer entries instead |

### 6.2 Three findings that only exist because the fetch failed usefully

These are the most valuable results in the whole verification pass, because each
one is a live example of the failure mode [AUDIT.md](AUDIT.md) predicted.

1. **`4agrobotics.com` — a URL carried by artifact A — is now a domain marketplace
   listing operated from Phoenix, Arizona.** **CONFIRMED 2026-08-19.** The domain
   resolves, so any check that only asks "does the site load" passes it. The
   organization is not there. This is precisely the trap the 176 name-derived URLs
   set.
2. **D-Wave Quantum's own contact page lists Palo Alto, California and Boca Raton,
   Florida as headquarters.** **CONFIRMED 2026-08-19.** A Canadian R&D location
   appears with a BC 604 phone number and **no city stated**. "D-Wave is a BC
   company" is a widely repeated claim this verification does not support, so
   D-Wave is `rejected`, not published. Notably, the automated fetch tool
   volunteered "D-Wave is known to be headquartered in Burnaby" — from its own
   prior, not from the page. That is exactly the inference this project exists to
   refuse, and it was refused.
3. **`lighthouselabs.ca` 302-redirects off-domain.** **CONFIRMED 2026-08-19.**

### 6.3 Organizations withheld despite being obviously part of the ecosystem

Held to the same bar as everything else. All in
[`unverified.json`](unverified.json) with the exact finding.

| Organization | Why not published |
|---|---|
| **AbCellera Biologics** | BC presence confirmed (Vancouver, ~600 people). AI/ML **not stated** on its homepage or `/technology` — it says "biology, computation, and engineering". A flagship BC company, withheld for want of one sentence. |
| **Visier** | Vancouver and 600 employees confirmed. AI not stated on `/company`. |
| **Innovate BC** | Vancouver address confirmed. No AI-specific programme on the page read. |
| **Accelerate Okanagan** | Kelowna and non-profit status confirmed. No AI mention. |
| **Foresight Canada**, **Launch Academy**, **MistyWest**, **Ekona Power**, **Genome BC**, **Ideon Technologies** | BC presence confirmed; no AI statement on the page read |
| **Picovoice**, **Spexi**, **Glüxkind**, **Pani Energy**, **Quandri**, **Fintel Connect**, **Jane Software** | AI confirmed verbatim; **no BC location on any page read** |
| **Canada's Michael Smith Genome Sciences Centre** | "analytical methods" and "data solutions" but no AI/ML statement, and no city. Calling it an AI organization would be inference. |

**INFERRED:** most of these belong in the dataset and will enter it as soon as one
more page is read. Publishing them now on the strength of general knowledge would
have been the single easiest way to reintroduce the exact defect being corrected.

### 6.4 Other UNTESTED items

- **Whether the 215 unclassified no-payload seed rows are organizations or
  fragments.** Machine classification runs out; the full list is printed by
  `Find-EntityKindDefects.ps1` for human review. **UNKNOWN.**
- **Which of the 176 name-derived URLs are genuine.** Determinable only by
  fetching each. One was checked and turned out to be a parking page.
  **UNKNOWN for the other 175.**
- **The fate of the 1,180 artifact-A names absent from artifact C's enumerated
  lists.** C names 285 of the 839 it counts. **UNKNOWN.**
- **What the source Notion database contains today.** Newest artifact is
  2025-10-19. **UNKNOWN.**
- **Bell AI Fabric's total capacity.** ~500 MW reported; facility-by-facility
  arithmetic gives 866+ MW. **Irreconcilable from public sources**; no total is
  published.
- **Kootenay region.** No AI organization found in any artifact or search.
  **UNKNOWN**, and the site renders no card for it rather than asserting emptiness.
- **The rendered site in a browser.** **UNTESTED.** The build, type-check, lint,
  JSON validity, CSP hash and data integrity are all machine-verified, but no
  visual or interaction check was performed. Specifically unverified: cluster
  behaviour at real zoom levels, dark-scheme contrast in situ, mobile menu
  behaviour, and that the region cards actually drive the map filter. The code
  paths exist and compile; **that they look and behave right is a claim I have not
  earned.**
- **Whether any relationship exists** between this project and BC + AI, Kris Krüg,
  the Internet Archive, TELUS, Bell, BC Hydro or any other organization. Nothing in
  any file read states one. **For the purposes of this project, none exists**, and
  the site says so in the method statement, the footer and `ecosystem.json`.

---

## 7. osv-scanner

**Never Trivy.** osv-scanner was not present and is not distributed on npm (`npm
error 404 osv-scanner`). Installed from the official Google package via winget:

```powershell
winget install --id Google.OSVScanner --exact --accept-package-agreements --accept-source-agreements
```

winget downloaded
`https://github.com/google/osv-scanner/releases/download/v2.4.0/osv-scanner_windows_amd64.exe`
and reported `Successfully verified installer hash`. **CONFIRMED.**

```
osv-scanner version: 2.4.0
osv-scalibr version: 0.4.5
```

```powershell
osv-scanner scan source --lockfile package-lock.json
osv-scanner scan source --recursive .
```

**Result: `No issues found`, 321 packages scanned, exit 0 on both.** **CONFIRMED.**
Full output in `research\audit\report-osv-scanner.txt`.

**No high or critical findings, resolved or otherwise. `BLOCKERS.md` was therefore
not created** — there is nothing to record in it, and writing an empty blockers
file would be noise.

---

## 8. Two consecutive clean full runs

`research\audit\Test-ExitConditions.ps1 -CleanInstall`, twice, both 17 of 17.
Transcripts committed as `report-exit-run1.txt` and `report-exit-run2.txt`.

| Condition | Run 1 | Run 2 |
|---|---|---|
| npm install from a verified-empty `node_modules` | PASS | PASS |
| `npm run build` succeeds | PASS | PASS |
| `tsc` reports no errors | PASS | PASS |
| `eslint` reports no errors | PASS | PASS |
| Both JSON outputs parse | PASS | PASS |
| Every id unique (102/102) | PASS | PASS |
| Every record: `status: verified`, sourceUrl, sourceDate, verified stamp | PASS | PASS |
| At least 100 verified records (102) | PASS | PASS |
| Category union closed both directions | PASS | PASS |
| No coordinate without a `geoSourceUrl` | PASS | PASS |
| GeoJSON features match records with coordinates (97/97) | PASS | PASS |
| No funding / keyPeople / yearFounded / focus-area field in `src\` | PASS | PASS |
| Predecessor dump tag never a value in `src\` | PASS | PASS |
| Nothing in `src\` imports from `research\` | PASS | PASS |
| `unverified.json` never reaches `dist\` | PASS | PASS |
| `dist\` has index.html, CNAME, _headers, both data files | PASS | PASS |
| Every inline script hash present in the CSP | PASS | PASS |

### Two things the gate caught, and the third that caught the gate itself

1. **eslint, first run:** `react-hooks/set-state-in-effect` on `Nav.tsx`. The
   theme-sync effect was copied straight from the reference and is a genuine
   cascading render under React 19. Fixed by reading the DOM attribute in a lazy
   `useState` initializer — the attribute is already set pre-paint, so no effect is
   needed at all. Not suppressed.
2. **eslint, first run:** `react-hooks/exhaustive-deps` on the clusterer's
   `useMemo`, which listed a stable setter as a dependency to force recomputation —
   which does nothing. Fixed by dropping the memo: clustering depends on the map
   projection, which is not a value React can observe, so it is now a plain
   computation during render, driven by a counter bumped from the map's own event
   callbacks. Correct by construction rather than by dependency bookkeeping.
3. **The `-CleanInstall` check was passing dishonestly.** It called
   `Remove-Item -Recurse -Force node_modules`, ignored the resulting `IOException`,
   and reported PASS on the strength of `npm install`'s exit code alone. A running
   `npm run dev` vite server (PID 24724) was holding the tree open, so the "clean
   install" was an install over 7,230 surviving files. **The gate was asserting
   something it had not tested** — the same category of error as a `verified` stamp
   with no source. Fixed to stop project-scoped `esbuild` and vite processes,
   retry the removal, and **verify `node_modules` is actually gone before
   installing**, reporting that fact in the result line. Both runs above show
   `node_modules verified removed before install: True`.

**One check was also loosened, deliberately, and it is worth defending.** The
"predecessor dump tag never appears in `src\`" check initially matched the tag
anywhere, and failed on a header comment in `organizations.ts` stating that nothing
traces to that dump. Documenting an exclusion is the opposite of violating it, and
a check that cannot tell those apart pressures the next person to delete the
provenance note. It is now scoped to quoted strings — the tag as a *value*.

---

## 9. Deviations from the brief, stated plainly

| Brief said | What happened | Why |
|---|---|---|
| `flags` drawn only from the given closed set | Honored exactly | But the set has no flag for the 262 non-entity rows, the largest defect class. They carry `no-url` (true) and nothing else, so `seed.json` understates the damage by design. The count is carried in [seed-summary.md](seed-summary.md) instead, and [PLAN.md](PLAN.md) §7.1 recommends adding `not-an-entity`. |
| Clustering plugin "only if PLAN.md justified one" | No plugin; ~60 lines in `EcosystemMap.tsx` | Peer-dependency risk against React 19 / react-leaflet 5 threatened Gate 4; dataset is a few hundred points. Justified in [PLAN.md](PLAN.md) §3.1. |
| Minimum 100 verified organizations | 102 | Met, with the composition caveat in §0 stated rather than buried. |
| Record coordinates "only where you can source them" | 97 of 102, all municipal centroids with a `geoSourceUrl`; 5 province-wide records have none | A street address is not a coordinate. Rather than geocode addresses myself — inference — city centroids were taken from cited gazetteer pages and the site states on the page that pins are municipal. The build fails on any coordinate lacking a source. |
| Every command in PowerShell | Four early file-creation commands used Bash heredocs before I corrected course | `vite.config.ts`, `tailwind.config.js`, `postcss.config.js` and the tsconfig copies. The files are correct; the method breached the constraint. Everything after that point is PowerShell or the editor. Recording it because a verification document that hides its own process errors is worth nothing. |
| Deploy | Not done, as instructed | No push, no PR, no deploy. |

---

## 10. Reconcile pass against Martin's hand-verified records

After the first full pass, `research\verified\` arrived in the repository from
Martin Montero (commit `4465501`) — `verified-records.json` (8 Tier-A records, each
with a fetched `evidenceQuote`) and `corrections-to-apply.md` (149 lines of graded
corrections). **These found real defects in my dataset.** Everything below was
applied; nothing was quietly dropped.

### 10.1 Corrections applied to published records

| Record | Defect | Fix |
|---|---|---|
| **Quantum Algorithms Institute** | **I asserted Surrey with a municipal pin.** The Surrey address appears only on the legacy domain's footer and on Facebook; the live site publishes no address anywhere and has no contact page. **This was exactly the inference this project forbids, committed by me.** Also: wrong domain. | URL corrected to `qai.ca` (verified by fetch: the quoted sentence is on the page, and no address is). **Pin removed.** Region changed to `Province-wide` — mandate, not a guessed address. |
| **CAIDA** | Description asserted "more than 100 professors ... across 27 departments". CAIDA's own pages give three different figures (83/24, 100+/27, 100+/30). | Membership figure **removed**. Full ICICS address added. A `COLLISION HAZARD` comment added on the record: `caida.org` is an unrelated San Diego institute with the same acronym and is the first result a naive search returns. |
| **TELUS M3** | Stated a 2026 opening with no mention that it is **not approved**. | Address corrected to 111 East 5th Avenue (the former Hootsuite building). Added: Vancouver City Council reversed its own 14 July 2026 decision on 21 July 2026, deferring the rezoning past the municipal election. Record now says **proposed, not approved**. |
| **TELUS 150 West Georgia** | Same — implied approval. Co-developer missing. | Allied Properties REIT added; permitting subject to compliance confirmation under BC's new data-centre framework; **proposed, not approved**. |
| **TELUS** (operator) | Headline figures read as facts. | All now explicitly labelled **company projections**, and the cluster described as proposed. |
| **Bell AI Fabric Merritt** | Said only "7 MW". | Three reported figures are three different things: 7 MW announced design, 6.5 MW secured by BUZZ HPC, 5 MW as-built phase. Design and secured are both now named and attributed. Site detail (five acres by Merritt Municipal Airport), spring 2026 opening, and the Cohere/Hypertec agreement added. Source upgraded to Bell's own release. |
| **Bell AI Fabric Kamloops** | No site detail. | Mission Flats Road added; 7 MW labelled as design capacity. |
| **First Nations Technology Council** | Filed under `Metro Vancouver`. Its mandate covers **all 204 First Nations in BC**; filing it by head-office region misrepresents it. | Region → `Province-wide`. Office address and pin retained, since both are published and sourced. |
| **DIGITAL** | Recorded under the retired name. | Renamed to `DIGITAL`, former name kept in the description because the organization's own naming is genuinely mixed. |
| **Regions section** | The `Province-wide` note claimed such records never have a pin — no longer true. | Note rewritten: region records mandate, not address. |

### 10.2 Records added, after verifying the additive claims myself

The corrections file grades its own evidence and says Tier B items should be
re-verified against a primary page before shipping. I applied that split: **Tier B
corrections that make a record more conservative** (withdraw a claim, add a caveat,
null a contested field) were applied immediately, since a conservative correction
cannot fabricate. **Tier B corrections that add new claims** were verified first.

- **BUZZ HPC** — verified by fetching Bell's own release (2026-03-25): *"secured an
  immediate 6.5 MW of gross capacity"*, *"a wholly owned subsidiary of HIVE Digital
  Technologies LTD."*, liquid-cooled GPU infrastructure for inference and training
  at Merritt. **Published.** It is a BC AI infrastructure operator and was absent
  from every version of this dataset.
- **BC Tech Association** — published on the strength of its stated AI vertical
  accelerator. Its address is recorded as a **mailing address for a fully virtual
  team**, in the location string, because implying a place people visit would be
  wrong.

### 10.3 Where I did not adopt Martin's records, and why

Stated rather than glossed, because these are deliberate divergences from a
hand-verified source.

| Record | Martin's file | My decision |
|---|---|---|
| **Innovate BC** | Tier-A verified as a provincial Crown agency, `status: verified` | **Still not published.** His evidence establishes what it *is*; neither his source nor mine establishes that AI is material to it. Same bar as AbCellera. It is one sourced sentence away from being listed. |
| **DigiBC** | Tier-A verified with a fetched address | **Not published** — no AI statement sourced. Its remit is games, animation, VFX, XR and virtual production. Recorded in `unverified.json` **with** the New Media BC merge instruction, so the merge is not lost. |
| **`keyPeople` on four records** | Martin's records carry named directors and CEOs | **Not published, by design.** [PLAN.md](PLAN.md) §1.1 puts individuals out of scope on privacy grounds, not accuracy grounds. His own corrections file reaches the same conclusion for ministers in §5 — "they change faster than a re-verification cycle" — and the 2026-08-14 cabinet shuffle proves it. |
| **`category` values** | Uses the predecessor taxonomy (`Innovation Centres & Hubs`, `Industry Association`, `Academic & Research Labs`) | Mapped to this project's seven-category union per [PLAN.md](PLAN.md) §2.3. The raw labels are the taxonomy [AUDIT.md](AUDIT.md) §5 found unusable. |
| **BC government AI portfolio** | Tier B, recommends adding a government layer | **Not published as records.** Agreed with his own caution: minister names do not belong on organization records. Recorded in `unverified.json` as a recommendation for a dated government-layer page. |
| **Speculative entities** (`Site C Hydroelectric AI Integration` and four siblings) | Quarantine, do not delete | Recorded as `rejected` in `unverified.json` with the full sibling list, so they are quarantined and individually re-checkable rather than deleted. |

### 10.4 What this pass says about the method

**A second pair of eyes found a fabrication I had committed** — the Surrey pin on
the Quantum Algorithms Institute, assigned from a stale footer on a domain that was
itself wrong. Every machine gate passed with that record in place, because the gates
check that a coordinate *has* a source, not that the source *says what the record
claims*. That is a real limit of automated verification and it is worth stating
plainly: **the gates catch missing provenance; only a human reading the source
catches wrong provenance.**

Counts after the reconcile: **104 verified records** (was 102), **98 with sourced
coordinates** (was 97 — two added, one correctly removed), 1,464 candidates
unpublished with a reason each, 51 of them individually checked. All 17 exit
conditions still pass.

---

## 11. Second correction pass — 2026-08-19

Everything above describes the first two passes. This section records the third,
which corrected two errors of judgement and one published falsehood.

### 11.1 The scope test was wrong, and five organizations were wrongly withheld

The first pass excluded organizations whose own pages did not say "AI". Applied to
**AbCellera, Visier, Innovate BC, DigiBC and Accelerate Okanagan**, that produced the
absurd result of a BC AI ecosystem map with no industry association, no provincial
Crown innovation agency and no regional accelerator in it.

**The test was wrong.** This maps the whole ecosystem *around* AI in British
Columbia, not only the organizations that build AI. The replacement test: does this
organization **fund, house, teach, convene, govern, represent, power or otherwise
materially support** AI work in BC, and can that be sourced? An industry association
does not have to do AI to be part of the AI ecosystem.

All five are now published, along with KAST, Innovation Central Society, General
Fusion, Aspect Biosystems, Animikii, Ethọ́s Lab, the Upper Nicola Band data centre
and the Prophet River First Nation project. **117 records, up from 104.**

**One discipline was kept.** Where a page did not claim AI work, the record's
*description* does not claim it either. AbCellera's record says it describes itself as
integrating "biology, computation and engineering" and explicitly notes that the AI
framing is not its own. Inclusion is an ecosystem judgement; it is not licence to put
words in an organization's mouth.

### 11.2 The independence statement was false and was published

`public\ecosystem.json`, `README.md`, the site footer, the Method section and the hero
eyebrow all carried some form of:

> "BC AI Compass is independent. It is not affiliated with, endorsed by, or produced
> for any organization listed in it."

**That is false.** Kris Krüg, Executive Director of the BC + AI Ecosystem Association,
asked Martin Montero to build BC AI Compass for BC + AI in partnership with them, and
supplied the predecessor repository for that purpose. BC + AI is listed in the
directory. **The line publicly denied the arrangement with the organization that
commissioned the project.**

Replaced everywhere with: *BC AI Compass is a BC + AI Ecosystem Association project,
built by Martin Montero* — together with the limit on it: **no other organization
listed here is a partner, funder or endorser**, and no listing is paid for or
sponsored. The BC + AI record itself now says plainly that it is the one record in
the directory published by its own commissioning organization.

**How the error happened, because the mechanism generalises.** [PLAN.md](PLAN.md)
§8.2 reasoned from file evidence alone, found no stated relationship, and converted
that absence into a positive claim of independence. **"The sources do not say" is not
"the sources say no."** That is precisely the inference this project was built to
refuse, committed in the opposite direction. It is now recorded as such in AUDIT.md
§9 and PLAN.md §8.2.1 rather than quietly patched.

A gate now checks the claim is absent from `ecosystem.json`, `README.md` **and the
built JavaScript bundle** — the last because that is what a visitor actually receives.

### 11.3 evidenceQuote — the fix for the QAI failure

The Quantum Algorithms Institute record carried a Surrey pin drawn from a dead
domain's footer and **every machine gate passed**, because the gates checked that a
coordinate *had* a source, not that the source *said what the record claimed*.

Every record now carries `evidenceQuote`: a verbatim string under 15 words, copied
character-for-character from the page at `sourceUrl`, supporting the record's BC
connection. Open the source, search for the string. **Absent means fabricated.**

| | |
|---|---|
| Records with a verbatim quote | **80 of 117** |
| Marked `quote-pending` | **37** |
| Quotes at or over 15 words | 0 |
| Hand-verified quotes reproduced verbatim | 8 of 8 |

**The default is the honest one.** The shared `V` spread sets `evidenceQuote: null`
and `flags: ['quote-pending']`, so a record nobody re-checked *declares itself
unchecked*. The optimistic state has to be typed out by hand next to the quote that
earns it. Quotes are attached through a table keyed by `sourceUrl`, so a quote can
only ever reach a record whose source actually contains it.

The 37 pending are mostly infrastructure and public-sector records sourced to press
releases and government pages, where the BC connection is the subject of the article
rather than a short quotable string, plus a handful of institutional pages whose
fetch returned a paraphrase rather than a quotation. **They are marked, not mixed
in**, and the site prints "Quote pending — sourced, but not yet spot-checkable" under
each one.

### 11.4 The working set was built from one file; it is now built from all of them

`seed.json` held 1,399 rows — exactly the row count of the single backup dump.
Organization names are scattered across dozens of files in the reference repository.

`research\union.json` now walks **every `.json` and `.csv`** in the clone except
`.git` and `node_modules`, extracting names at any nesting depth and recording every
source file each name appeared in.

| | |
|---|---|
| Files walked | 270 (6 `package-lock.json` dependency trees skipped by design) |
| Parsed whole-file | 254 |
| Recovered as NDJSON | 1 — `logs\extractions\2025-08-03_all_extractions.json`, which holds real organization names and would otherwise have been silently dropped |
| **Unrecoverable** | **0** |
| **Distinct normalized names** | **2,467** — against 1,399 from the single file |
| Appearing in more than one source file | 2,136 |
| On the maintainer deletion list | 755, flagged `marked-for-deletion` and deprioritized, **not** dropped |

### 11.5 The two missing flags

`not-an-entity` and `synthesized-url` were added to the closed set and applied to both
`seed.json` and `union.json`.

| Flag | seed.json | union.json |
|---|---:|---:|
| `not-an-entity` | **269** | 342 |
| `synthesized-url` | **176** | 228 |

The 176 matches the audit's independently derived figure exactly. **The counts now
ride on the records** rather than being deferred to a summary a future pass may never
open — which was the whole problem with reporting them in `seed-summary.md`.

**A second parked domain turned up while testing this.** `nexerarobotics.com` now
resolves to the same Phoenix, Arizona domain-marketplace page as `4agrobotics.com`.
Both carried the `synthesized-url` shape. That is two for two on spot-checks of that
flag, which is the strongest evidence yet that the flag is measuring something real.

### 11.6 Regions

Three of the four empty regions now have a sourced record:

| Region | Record | Evidence quote |
|---|---|---|
| Kootenay | Kootenay Association for Science & Technology | "91-D Baker Street Nelson, BC V1L 4G8" |
| Cariboo | Innovation Central Society | "1299 3rd Avenue Prince George, BC V2L 3E6" |
| Northeast | Prophet River First Nation data centre project | "an independent Dene Tsaa Nation in Northeast British Columbia" |

**North Coast & Nechako remains at zero**, and the search behind that zero is written
out in [COVERAGE.md](COVERAGE.md) §1.1 — Coast Mountain College fetched and carrying
no AI statement, Prince Rupert Port Authority searched with nothing specific found,
UNBC's research pages blocked by HTTP 403. **Three paths tried, none conclusive: a
weak search, not a strong negative.**

**In the UI, zero now reads "not yet surveyed"** — on the region cards, the map's
region pills and the category pills, with the pill disabled and a tooltip. A visitor
cannot mistake an unsearched region for an empty one.

### 11.7 Restored, and deliberately still withheld

- **`keyPeople` restored.** Carried where a source names a current officer — Loc Dao
  at DigiBC, Jeff Ward at Animikii — and null otherwise. The privacy concern that
  removed it was about republishing *scraped contact details*; an executive director
  whose own organization publishes their name is a different case. Emails and phone
  numbers remain banned, and the build fails if either appears.
- **The government layer is a page, not records.**
  [GOVERNMENT-LAYER.md](GOVERNMENT-LAYER.md) carries Rick Glumac as Minister of State
  for Artificial Intelligence and New Technologies and the 2026-08-14 cabinet shuffle.
  **No minister name is rendered on the site or emitted in `ecosystem.json.`** One
  shuffle would otherwise silently falsify rows scattered across the directory, each
  still carrying a `verified` stamp asserting it had been checked.
- **Fields that stay null, now enforced by the build:** CAIDA's membership size (its
  own pages give three figures), Innovate BC's reporting ministry (two gov.bc.ca pages
  disagree), BC + AI's founding year (its About page and press kit disagree). The
  export script fails the build if any of them reappears — a guard that caught a real
  violation during this pass, when "94+ events since 2023" tripped the founding-year
  check and had to be reworded.

### 11.8 Capacity, projections and the Merritt correction

`capacityDesignMW` and `capacitySecuredMW` are now separate fields, because the Bell
figures were never contradictory — they were three different facts: **7 MW** announced
design, **6.5 MW** secured by BUZZ HPC, **5 MW** as-built phase. One field would have
forced a false choice.

**No permanent-jobs figure is recorded for Merritt.** No source states one; the
15-job figure in circulation belongs to Kamloops.

Every TELUS and Bell headline number is now labelled a **projection**: $9B economic
value, 60,000+ GPUs and 150 MW by 2032, 1,000+ construction jobs, ~500 MW across six
Bell facilities. And both Vancouver TELUS sites now say **proposed, not approved** —
Vancouver City Council reversed its own 14 July 2026 decision on 21 July 2026,
deferring the 111 East 5th rezoning past the municipal election.

**Upper Nicola Band** is recorded as a **land-use approval, not an equity stake**:
members voted 98–33 to permit the use of 100–150 acres of reserve land. No source read
describes an ownership share, so none is stated. The difference between a land lease
and an equity position is exactly the sort of thing a directory must not guess about a
First Nation.

**Ethọ́s Lab** is filed under Talent & Education with no Indigenous framing anywhere
in its record, and a gate enforces it. It is a Black-led youth STEAM academy founded
by Anthonia Ogundele; publishing that misattribution on a BC + AI map would have been
a serious error.

### 11.9 Browser verification — no longer UNTESTED

Ran `npm run dev` and inspected the running site. Previously the single largest
untested area.

| Check | Result |
|---|---|
| Map fits bounds to the data, not centred on Vancouver | **VERIFIED.** Tiles render at zoom 5 spanning 40.98°N–61.61°N and −146.25°–−101.25°, which contains all of BC. The reference project's hardcoded `zoom={11}` on Vancouver is gone. |
| Marker clustering works | **VERIFIED.** 3 cluster badges and 3 single markers at province zoom. |
| Empty regions read "not yet surveyed" | **VERIFIED.** The North Coast & Nechako pill renders `North Coast & Nechako (not yet surveyed)` and is `disabled`. A dashed region card renders in the grid. |
| Category and region filters work and combine | **VERIFIED.** All → 111 mapped rows; Kootenay → 1 (KAST, Nelson); Kootenay + Compute & Infrastructure → 0, correctly, since KAST is Capital & Accelerators. |
| Light and dark both render; toggle persists | **VERIFIED.** Light `--accent #0a6472` on `rgb(246,244,239)`; dark `--accent #34d3e6` on `rgb(20,23,28)`; `localStorage['bcac-theme']` written on toggle and restored. |
| Every record shows its stamp and links its source | **VERIFIED.** 117 `a.stamp` source links; 80 "Evidence on source page" lines; 37 "Quote pending" lines — matching the data exactly. |
| Method section states what verified means and the tiers | **VERIFIED** after a fix: the section had no explanation of the quote or the pending tier, so one was written. It now names both and explains the QAI failure that caused them. |
| No raw hex reaches rendered output | **VERIFIED.** Zero inline styles containing a hex colour; components consume `sys` tokens only. |
| Mobile 380px does not break map or directory | **VERIFIED.** Horizontal overflow 0px; map 338px wide inside a 380px viewport; all 117 directory rows render; mobile menu button visible. The only element wider than the viewport is `.marquee-track`, which is intentional inside its `overflow-hidden` parent. |
| Keyboard reaches filters and record links | **VERIFIED.** 304 focusable elements — 24 in the map, 252 in the directory, 9 in the regions. Disabled "not yet surveyed" pills are correctly **not** focusable. Search input reachable. |
| Console clean | **VERIFIED after reload.** A `ReferenceError: allRegionCounts is not defined` appeared in the log, traced to a hot-module update applied between two edits — the JSX referencing the value was saved a moment before the `useMemo` defining it. A full reload is clean, and the production build type-checks. Recorded rather than omitted because a reader scanning the console log would otherwise find an error with no explanation. |

**Still UNTESTED:** visual design quality — whether the page *looks* right, as opposed
to rendering the right values in the right structure. Colour contrast was reasoned
from the token values in DESIGN.md, not measured with a contrast tool. Cluster
behaviour was verified at province zoom only, not at every zoom level. No screen
reader was run.

---

## 12. What the next person should do first

1. **Fix the composition skew.** Verify 30–40 BC companies. The bottleneck is
   location, not AI materiality — most company sites state AI and hide their
   address. Try `/contact`, `/careers`, and regulatory filings.
2. **Unblock the 403s**, especially `unbc.ca` (Prince George) and `ecuad.ca`
   (IM4 Lab) — both are regions and institutions this dataset barely covers.
3. **Settle the 215 unclassified rows** by eye. It is an afternoon, and it retires
   the largest open unknown in the audit.
4. **Re-check the compute records after September 2026**, when BC Hydro notifies
   successful applicants for the 400 MW allocation. That result will change this
   map more than anything else on the horizon.
5. **Find a first-party source for Prophet River First Nation.** It is the only
   lead for the entire Northeast region, and it must come from the Nation itself.
