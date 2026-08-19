# GAPS — what a current BC AI dataset must contain, and artifact A does not

**Compiled:** 2026-08-19
**Against:** artifact A, `database-backup-2025-08-04.json`, dated 2025-08-04

Artifact A predates today by **just over a year**. Artifact C, the newest signal
anywhere in the reference repository, is dated 2025-10-19 — **ten months old** — and
carries no field values. Everything in this file is a gap in *both*.

Claim labels as in [AUDIT.md](AUDIT.md): **CONFIRMED** (read at a cited URL on a
stated date), **INFERRED** (reasoned to, from what is stated), **UNKNOWN**.

Every entry in §§1–8 carries a source URL and a date. **Anything without one is in
§9 and never enters the dataset.**

---

## 0. Why the gap is structural, not incremental

**INFERRED, reasoning stated.** The single largest development in British Columbia's
AI landscape since artifact A was taken is not a company or a lab. It is **electricity
and concrete** — multi-hundred-megawatt AI compute buildout in Kamloops, Merritt and
Vancouver, and a provincial process that rations the power it needs.

Artifact A cannot express any of it. **CONFIRMED** from [AUDIT.md](AUDIT.md) §5: not
one of the 85 raw category labels across artifacts A and C names AI compute
infrastructure. The predecessor taxonomy has `Crypto Unicorn`, `Wildfire Tech` and
`Deep-water Terminal`, and no word for a data centre.

That is why [PLAN.md](PLAN.md) §2 makes `Compute & Infrastructure` category one, and
why every member of that category comes from this file rather than from the seed list.

---

## 1. Compute & Infrastructure — the anchor gap

### 1.1 TELUS Sovereign AI Factory cluster

**CONFIRMED** — TELUS media release via Cision Newswire, dated **2026-05-11**, read
2026-08-19:
<https://www.newswire.ca/news-releases/telus-and-government-of-canada-advance-work-to-scale-canada-s-sovereign-ai-infrastructure-854223505.html>

| Facility | Location | Timeline | In artifact A? |
|---|---|---|---|
| Kamloops AI Factory (expansion of the existing TELUS Kamloops data centre) | Kamloops | online later in 2026 | **No** |
| M3 | Vancouver, Mount Pleasant | end of 2026, scaling through 2028 | **No** |
| 150 West Georgia | Vancouver | 2029 | **No** |

- Advanced with the **Government of Canada** under the federal **Enabling Large-Scale
  Sovereign AI Data Centres** initiative. **CONFIRMED.**
- **Initial 85 MW** of clean renewable power secured from **BC Hydro**. **CONFIRMED.**
- Cluster scales to **"over 60,000 GPUs and 150 MW by 2032"** — quoted verbatim.
  **CONFIRMED.**
- Named partners in the release: Government of Canada, **Westbank**, BC Hydro,
  **NVIDIA**, **Creative Energy**, City of Vancouver, Province of BC. **CONFIRMED.**
- TELUS states an expected ~$9B in economic value to BC, 1,000+ construction jobs.
  **CONFIRMED as a statement by TELUS**; it is a company projection, not an
  independently verified figure, and will be published as such or not at all.

**Records this creates:** TELUS (as `infrastructure-operator`, Kamloops and Vancouver),
Westbank, Creative Energy. **BC Hydro and the Province appear via §1.3, not here.**
NVIDIA is not a BC organization and does not get a record.

### 1.2 Bell AI Fabric

**CONFIRMED** — BetaKit, dated **2025-05-28**, read 2026-08-19:
<https://betakit.com/bell-to-build-six-ai-data-centres-in-canada-as-telcos-compete-on-infrastructure/>
and DataCenterDynamics:
<https://www.datacenterdynamics.com/en/news/bell-ai-fabric-bell-canada-plans-ai-data-center-supercluster-with-500mw-in-british-columbia/>

**A date correction worth recording.** The brief presents Bell AI Fabric as a current
item. It is **two waves**: announced 2025-05-28, with construction on the larger
facilities beginning in 2026. Both waves are gaps in artifact A — the announcement
predates the 2025-08-04 dump by nine weeks and **still did not make it in**, which is
itself a finding about how stale the artifact was even when taken.

| Facility | Location | Capacity | Timeline |
|---|---|---|---|
| First AI Fabric facility, with **Groq** LPUs | Kamloops | 7 MW | online June 2025 |
| Second | **Merritt** | 7 MW | 2025 |
| Kamloops 1, at **Thompson Rivers University** | Kamloops (TRU) | 26 MW | launching 2026 |
| Kamloops 2, 1452 McGill Road | Kamloops | 26 MW | broke ground April 2026, completion late 2027 |
| Two further high-density facilities | TBD | 400+ MW combined | advanced planning |

All rows **CONFIRMED** from the sources above plus BeBeez International, dated
**2026-04-14**, read 2026-08-19:
<https://bebeez.eu/2026/04/14/bell-canada-breaks-ground-on-data-center-in-kamloops-british-columbia/>

- **Six facilities**, initial supercluster capacity reported as **~500 MW**.
  **CONFIRMED** as the reported figure. **Note the discrepancy:** BetaKit's own
  facility-by-facility arithmetic sums to 866+ MW because it counts the two
  advanced-planning sites at 400+ MW each. **The 500 MW figure and the 866 MW figure
  are not reconcilable from public sources.** Recorded as reported, not averaged, not
  chosen between. The published record will carry the ~500 MW initial figure with its
  source, and will not assert a total.
- The TRU facility integrates with **BCNET** to give students and faculty compute
  access, and routes waste heat into TRU's district energy system. **CONFIRMED.**
- Lead developer on Kamloops 2: **TrueNorth Sustainable Infrastructure Inc.**
  **CONFIRMED** (BeBeez).

**Records this creates:** Bell Canada (as `infrastructure-operator`, Kamloops and
Merritt), Thompson Rivers University, BCNET, TrueNorth Sustainable Infrastructure.
**Groq is not a BC organization** and does not get a record; it appears in Bell's
sourced description.

### 1.3 BC Hydro competitive electricity allocation

**CONFIRMED** — Province of British Columbia news release **2026ECS0005-000095**,
dated **2026-01-30, 9:15 AM**, read 2026-08-19:
<https://news.gov.bc.ca/releases/2026ECS0005-000095>

- Authorized by **Bill 31, the Energy Statutes Amendment Act**, plus new regulation.
  **CONFIRMED.**
- Application window **opened 2026-01-30**; successful applicants notified
  **September 2026**. **CONFIRMED.**
- Target: **up to 400 MW over the first two years.** **CONFIRMED.**
- Evaluated on "price and their economic, community, **data sovereignty** and
  environmental benefits" — quoted verbatim. **CONFIRMED.**
- Traditional industries (mining, LNG, forestry, manufacturing, hydrogen) are exempt
  from the competitive requirement. **CONFIRMED.**
- Named in the release: BC Hydro, Ministry of Energy and Climate Solutions, First
  Nations, local governments. Minister **Adrian Dix**; BC Hydro CEO **Charlotte
  Mitha**. **CONFIRMED** — named here for provenance; per
  [PLAN.md](PLAN.md) §1.1 no personal names are published on the site.

**Secondary detail, reported not primary.** The 400 MW is reported elsewhere as split
**300 MW for AI data centres and 100 MW for conventional data centres** for the
two-year period commencing 2026-02-01, and BC Hydro is reported to have received
**15 applications totalling close to 800 MW** — roughly double the available
allocation. **CONFIRMED as reported** by BLG (law firm analysis, 2026-07)
<https://www.blg.com/en/insights/2026/07/data-centre-regulation-in-british-columbia-competing-for-a-limited-supply>
and TheMinerMag (2026-01-31)
<https://www.theminermag.com/news/2026-01-31/canada-ai-british-columbia>.
**The 300/100 split is not in the government release I read** and is labelled as
secondary-sourced accordingly.

**Records this creates:** BC Hydro (`government-or-crown`), Ministry of Energy and
Climate Solutions (`government-or-crown`).

**Why this matters more than its size suggests.** **INFERRED:** an oversubscribed,
criteria-scored power allocation with a September 2026 notification date means the
map of BC AI infrastructure **will change materially within weeks of this dataset
shipping.** A directory with no `verified` stamp and no re-verification cadence would
be wrong by October and unable to tell. This single fact is the strongest argument for
[PLAN.md](PLAN.md) §6.5.

### 1.4 Indigenous-led AI infrastructure

**CONFIRMED as reported** — The Hub, 2026-05-29, read 2026-08-19:
<https://thehub.ca/2026/05/29/why-first-nations-should-be-all-in-on-ai-data-centres/>

**Prophet River First Nation** has advanced plans for a large-scale data-centre
partnership near **Fort St. John** (Northeast region). **CONFIRMED as reported by that
source.** Not in artifact A. Not in artifact C.

**Handled with care, and the care is the point.** Per [PLAN.md](PLAN.md) §1.1, this
project does not assign an "Indigenous-led" attribute to anyone. A record for this
project enters the dataset only when the Nation or its economic development
corporation states it on its own site, in its own words, and that page is the
`sourceUrl`. A third-party opinion column is enough to know to go and look. It is not
enough to publish. **Status: lead, pending a first-party source.**

### 1.5 Other infrastructure leads

| Item | Detail | Label |
|---|---|---|
| Nanaimo data centre proposal | ~200,000 sq ft proposed; reported water use peaking at 69,000 L/day | **CONFIRMED as reported** — The Discourse / Martlet coverage; needs a first-party or municipal source before publication |

---

## 2. Research & Academia — what changed since October 2025

### 2.1 BC AI Research-to-Adoption Summit

**CONFIRMED** — SFU School of Computing Science, May 2026, read 2026-08-19:
<https://www.sfu.ca/fas/computing/news-events/news/2026/may/sfu-ubc-collaborates-on-bc-ai-research-to-adoption-summit.html>
and UBC Computer Science:
<https://www.cs.ubc.ca/news/2026/05/bc-ai-summit>

First-ever summit, **2026-05-07**, jointly hosted by SFU School of Computing Science
and UBC Computer Science, with UVic participation. **CONFIRMED.** Not in either
artifact — it did not exist when they were taken.

### 2.2 UBC initiatives launched in 2026

| Item | Detail | Source | Label |
|---|---|---|---|
| **UBC AI and Health Network** | Brings together UBC's AI, health-systems research and biomedical innovation | <https://research.ubc.ca/ai> | **CONFIRMED** |
| **Learning Technology Innovation Centre (LTIC)** | Launched 2026-04-07; helps faculty apply AI in teaching | <https://ubctoday.ubc.ca/news/april-04-2026/ubc-accelerate-ai-enabled-teaching-new-computing-infrastructure-and-services> | **CONFIRMED** |
| **UBC advanced machine learning training network** | Announced by UBC Science | <https://science.ubc.ca/news/whats-next-ai-ubc-launch-advanced-machine-learning-training-network> | **CONFIRMED** |
| New undergraduate AI curriculum | UBC Science, May 2026 | <https://science.ubc.ca/news/2026-05/new-curriculum-preps-undergrads-ai-driven-future> | **CONFIRMED** — a programme, not an organization; no record |

### 2.3 SFU

**CONFIRMED** — SFU garnered approximately **$20M** to deploy and operate the
**Vancouver Quantum Network**, and will establish a secure computing network to train
AI models and process sensitive data for defence and civilian use.
<https://techcouver.com/2026/02/24/ubc-sfu-federal-support-defence-innovation-projects/>
Read 2026-08-19. Federal defence-innovation support, February 2026. Not in either
artifact.

**CONFIRMED** — inaugural **Salish SIGCHI Celebration**, June 2026, SFU, uniting BC's
human-computer-interaction community:
<https://www.sfu.ca/fas/computing/news-events/news/2026/june/building-momentum-in-the-age-of-ai-inaugural-salish-sigchi-celebration-unites-bcs-growing-hci-community.html>

### 2.4 Research units artifact A missed entirely, present only in artifact C

**CONFIRMED** by name-set diff (`Analyze-ArtifactsBC.ps1`) — these appear in artifact
C's enumerated lists and **not** in artifact A, meaning they were added to Notion
between 2025-08-04 and 2025-10-19:

`Digital Democracies Institute - SFU` · `SFU Metacreation Lab` · `SFU Big Data Hub` ·
`Health & Climate Data Lab (UBC)` · `UBC Cognitive Systems` · `UBC Neuroethics` ·
`UBC Sauder Data + AI Research Group` · `UBC Space Centre` ·
`IM4 Lab (Emily Carr University)` · `AIM Lab - Artificial Intelligence in Medicine Lab` ·
`UVic Advanced Control and Intelligent Systems Lab` · `Cascadia Scientific`

**Note the duplicate already forming in artifact C:** `Digital Democracies Institute -
SFU` and `Digital Democracies Institute (SFU)` are both present in C, as separate
entries. **CONFIRMED.** The cleanup that took the database from 1,399 rows to 839 did
not stop it re-accumulating duplicates.

---

## 3. Public Sector & Policy — programs artifact A cannot see

| Item | Detail | Source | Label |
|---|---|---|---|
| **Regional Artificial Intelligence Initiative (RAII)** | Delivered in BC by **PacifiCan** with **$32.2M**; funds up to **$3M per project** for BC businesses commercializing or adopting AI | <https://www2.gov.bc.ca/gov/content/employment-business/economic-development/funding-and-grants/regional-artificial-intelligence-initiative> and <https://www.canada.ca/en/pacific-economic-development/news/2024/10/regional-artificial-intelligence-initiative-will-support-ai-innovation-and-adoption-in-british-columbia.html> | **CONFIRMED** |
| **PacifiCan AI & quantum commercialization investment** | **$17.3M** to **eight BC tech businesses**, May 2026 | <https://www.canada.ca/en/pacific-economic-development/news/2026/05/accelerating-commercialization-and-adoption-of-ai-and-quantum-technologies-in-british-columbia.html> | **CONFIRMED** |
| **PacifiCan defence innovation investment** | **$13.8M** for AI and aerospace defence innovation in BC, March 2026 | <https://www.canada.ca/en/pacific-economic-development/news/2026/03/pacifican-invests-138-million-to-advance-defence-innovation-in-ai-and-aerospace-in-british-columbia.html> | **CONFIRMED** |
| **Bill 31 / BC Hydro allocation** | See §1.3 | — | **CONFIRMED** |
| **Comox Valley Regional District AI Governance Policy** | Adopted **2026-05-01**; AI traffic analytics (Miovision) in use since January 2026 | <https://thediscourse.ca/comox-valley/how-do-comox-valley-governments-and-public-organizations-use-ai> | **CONFIRMED as reported** — a local government adopting AI governance is a real signal that BC AI activity reaches well past the Lower Mainland |

**Artifact A's coverage of this whole area:** the raw label `Government` on 13 rows,
`Government & Public Sector` on 6, `Government Agency` on 1, and a row literally named
`11. PacifiCan AI Initiative` with markdown list numbering still attached and no URL.
**CONFIRMED** from seed.json.

---

## 4. Regional activity outside the Lower Mainland

This is the section artifact A is worst at, and the reason
[PLAN.md](PLAN.md) §3 makes region a first-class field.

| Region | What is there | Source | Label |
|---|---|---|---|
| **Thompson-Okanagan (Kamloops)** | TELUS Kamloops AI Factory; **four** Bell AI Fabric facilities (7 MW + two 26 MW + Kamloops 2); Thompson Rivers University compute + district energy | §§1.1–1.2 | **CONFIRMED** |
| **Thompson-Okanagan (Merritt)** | Bell AI Fabric 7 MW facility | §1.2 | **CONFIRMED** |
| **Thompson-Okanagan (Kelowna)** | Accelerate Okanagan named in artifact A with the `**` placeholder as its website | seed.json | **CONFIRMED** as a lead only |
| **Vancouver Island & Coast (Comox Valley)** | **CV + AI** regional meetup launched; regional district AI governance policy adopted 2026-05-01; local activity in genomics, drone systems, quantum | <https://bc-ai.ca/news/launch-of-comox-valley-ai-community-meetup-cv-ai> and <https://thediscourse.ca/comox-valley/how-do-comox-valley-governments-and-public-organizations-use-ai> | **CONFIRMED** |
| **Vancouver Island & Coast (Nanaimo)** | ~200,000 sq ft data centre proposed | §1.5 | **CONFIRMED as reported** |
| **Vancouver Island & Coast (Victoria)** | VIATEC / Fort Tectoria, UVic AI research; artifact A holds three separate conflated VIATEC rows | seed.json, AUDIT.md §3.4 | **CONFIRMED** |
| **Cariboo / North Coast & Nechako (Prince George)** | `Central Interior Business Accelerator` and `Northern Innovation Network` — **present in artifact C, absent from artifact A** | `Analyze-ArtifactsBC.ps1` | **CONFIRMED** |
| **Northeast (Fort St. John)** | Prophet River First Nation data-centre partnership plans | §1.4 | **CONFIRMED as reported** |
| **Kootenay** | Nothing found in any artifact or search. | — | **UNKNOWN.** Stated as unknown rather than filled in. Per [PLAN.md](PLAN.md) §4, a region with no verified records gets **no card** — an empty region card would assert the region has nothing, which is a claim this project cannot source. |

**INFERRED:** BC + AI's own site describes "33 active BC regions" and members "from
Vancouver to Surrey to the Comox Valley" (**CONFIRMED** by fetch of
<https://bc-ai.ca>, 2026-08-19). Whatever the exact figure means, it is
categorical evidence that provincial AI activity is distributed — and artifact A
carries `region` on **zero** rows because the key does not exist in it at all
(AUDIT.md §2.1).

---

## 5. Capital & Accelerators

| Item | Detail | Source | Label |
|---|---|---|---|
| Vancouver's 2026 funding position | Vancouver hosted **three of the ten largest Canadian startup funding rounds** in mid-2026; AI accounted for more than half of all Canadian capital deployed | <https://beststartup.ca/canada-startup-funding-rounds-june-2026/> | **CONFIRMED as reported** — an aggregator, not a primary source. Context only; **no record is created from it.** |
| **Trulioo** Series D | **$150M** led by Goldman Sachs Asset Management, Vancouver identity verification | <https://fundraiseinsider.com/blog/vancouver-startups/> | **CONFIRMED as reported.** The company gets a record from its own site; the funding figure is **not published** — [PLAN.md](PLAN.md) §1.1 puts `funding` permanently out of scope. |
| BC tech M&A volume | **82+** M&A deals closed by BC tech companies in 2025; top 10 worth $5.1B | <https://www.bctechnology.com/news/2026/1/26/BC-Tech-Companies-Close-82-Merger-and-Acquisition-Deals-in-2025-Top-10-Deals-Worth-5.1-Billion.cfm> | **CONFIRMED as reported.** **This is the most important number in this section:** 82+ ownership changes in one year, against a dataset whose newest signal is ten months old and which records no acquisition status at all. |
| **SPUD** acquired by GrubMarket | Vancouver online grocery, acquired 2026-07 by a San Francisco AI-enabled buyer; SPUD stated to continue under its existing leadership | <https://www.bctechnology.com/news/2026/7/27/Vancouver-based-Online-Grocery-Services-Company-SPUD-Acquired-by-GrubMarket.cfm> | **CONFIRMED as reported.** Illustrative of the class, not itself an AI organization. |
| **InBC Investment Corp**, **New Ventures BC**, **Innovation Island**, **Central Interior Business Accelerator**, **Northern Innovation Network** | Present in artifact C, **absent from artifact A** | `Analyze-ArtifactsBC.ps1` | **CONFIRMED** as leads |

**INFERRED, and it is the core argument of this file.** 82+ BC tech M&A deals in 2025
alone means a directory of BC companies decays at a rate of several percent per year
from ownership change *before* counting closures, relocations and renames. Artifact A
records ownership status nowhere. That is not a data-entry gap; it is the absence of
the field that would make the dataset maintainable. Hence
[PLAN.md](PLAN.md) §6.2's explicit `rejected` state for "materially changed such that
the record would mislead", with **Nexii** as the worked example.

---

## 6. Community & Convening

| Item | Detail | Source | Label |
|---|---|---|---|
| **BC + AI Ecosystem Association** | Non-profit, "300+ paying members", 94+ events since 2023, certifications ("AI Animation Accelerator", "Responsible AI Professional", "AI Upgrade"), **AI Builders Fellowship**, **Futureproof Festival** 28–30 Oct 2026 at H.R. MacMillan Space Centre | <https://bc-ai.ca> fetched 2026-08-19 | **CONFIRMED** |
| **CV + AI** (Comox Valley AI meetup) | Launched as its own regional node after two gatherings in Courtenay | <https://bc-ai.ca/news/launch-of-comox-valley-ai-community-meetup-cv-ai> | **CONFIRMED** |
| **First Nations Technology Council** | Mandated by the BC Assembly of First Nations, the Union of BC Indian Chiefs and the First Nations Summit; publishes First Nations perspectives on AI research | <https://technologycouncil.ca/research/digital-transformation-ai/> | **CONFIRMED** |
| **Mindstone Community**, **Circles of AI**, **AI Tinkerers Vancouver**, **Indigenous Tech Symposium** | Present in artifact C, **absent from artifact A** | `Analyze-ArtifactsBC.ps1` | **CONFIRMED** as leads |

**Note on artifact A's community coverage.** Six of its community rows carry a
`meetup.com` group page as their website (AUDIT.md §2.2). Meetup groups are exactly
the class most likely to have gone dormant in a year, and a Meetup URL is the one URL
shape that reveals nothing about whether the group still meets. Community
organizations are verified **last** in [PLAN.md](PLAN.md) §6.3 for this reason, and
re-verified **most often** per §6.5.

---

## 7. The 67 names in artifact C that artifact A does not have

**CONFIRMED** by `Analyze-ArtifactsBC.ps1`. These were added to the Notion database
between 2025-08-04 and 2025-10-19. They are a legitimate second lead source and are
worked alongside seed.json. Complete list, nothing omitted:

`3 Lions AI Solutions` · `Above Sensing Ltd.` · `AccessAI` · `ADG Tech` ·
`AI Tinkerers Vancouver - Profile` · `AIM Lab - Artificial Intelligence in Medicine Lab` ·
`Ainome Inc.` · `Audette` · `Avigilon (Motorola Solutions)` · `Be Pacific(TM)` ·
`Borealis AI (RBC Research Lab)` · `BrainBox AI` · `Cascadia Scientific` ·
`Central Interior Business Accelerator` · `Circles of AI` · `Cisco Systems Vancouver` ·
`DaoAI` · `Digital Democracies Institute - SFU` · `Digital Democracies Institute (SFU)` ·
`Fuelix AI` · `FYBR Solutions` · `Geco Strategic Weed Management` · `GeologicAI` ·
`Gluxkind` · `Health & Climate Data Lab (UBC)` · `IM4 Lab (Emily Carr University)` ·
`Immersio Learning Inc.` · `InBC Investment Corp` · `Indigenous Tech Symposium` ·
`Innovation Island` · `Insporos` · `Intelautomatics` · `Intronic` · `Intuitive AI` ·
`Iris AI` · `Langbase.com` · `Legible AI` · `Lunar AI` · `Mindstone Community` ·
`Ministry JEDI` · `MyAni EdTech` · `NCellular AI` · `New Ventures BC` · `NordAI` ·
`Northern Innovation Network` · `Novatone Consulting Ltd.` ·
`PacifiCan Regional AI Initiative` · `Quartech Systems Ltd.` · `Revela Systems` ·
`Segev LLP` · `SensorUp Inc.` · `SFU` · `SFU Big Data Hub` · `SFU Metacreation Lab` ·
`Skyward Wildfire` · `SmartLumber AI` · `Softmax Data` · `Spexi Geospatial` ·
`Tech Yukon` · `Technocrat AI` · `UBC Cognitive Systems` · `UBC Neuroethics` ·
`UBC Sauder Data + AI Research Group` · `UBC Space Centre` ·
`UVic Advanced Control and Intelligent Systems Lab` · `Vodasafe` ·
`Zero Inbox Technologies`

**Two things this list proves, both CONFIRMED:**

1. **`Tech Yukon` is not in British Columbia.** Even the newest artifact carries a
   scope error. It is flagged `non-bc-suspected` in seed.json's pattern list so the
   flag is reusable.
2. **`BrainBox AI` is Montreal** — an established out-of-scope entity, added to the
   database *after* the cleanup that removed 560 rows.

**INFERRED:** artifact C is newer but not cleaner. The same intake process that
produced artifact A's damage was still running in October 2025.

---

## 8. What this changes about the schema — already reflected in PLAN.md

| Gap found here | Schema consequence |
|---|---|
| Compute infrastructure is the biggest 2026 development and has no raw label | `Compute & Infrastructure` is category one ([PLAN.md](PLAN.md) §2.2) |
| Activity in Kamloops, Merritt, Comox, Prince George, Fort St. John | `region` is a first-class enum, not a substring of a display string (§1) |
| 82+ M&A deals in one year | `rejected` is a distinct state from `unverified`, with "materially changed" as an explicit ground (§6.2) |
| BC Hydro allocation results land September 2026 | Re-verification cadence with oldest-stamp-first, and `verified` required on every record (§6.5) |
| A data centre operator and a two-person startup are both "organizations" | `orgType` and `size` separated from `category` (§1) |
| Prophet River First Nation reported by a third party, not a first party | No `indigenousLed` attribute; self-identification only, in the record's own sourced description (§1.1) |

---

## 9. Unsourced leads — recorded, and never entering the dataset

Everything below is a name or claim encountered without a primary or reputable-press
source attached. **None of it enters `organizations.ts`. None of it appears on the
site.** It is written down so the next pass knows where to look.

| Lead | Where it came from | What is missing |
|---|---|---|
| `Ministry JEDI` (artifact C) | artifact C name list | Almost certainly shorthand for a BC ministry, but which one is **UNKNOWN**. BC's ministry names have changed since 2025 and guessing the expansion would be exactly the name-inference failure `FAKE_DATA_AUDIT_REPORT.md` documents. |
| `Be Pacific(TM)`, `Insporos`, `Intronic`, `NordAI`, `Technocrat AI`, `Lunar AI`, `Iris AI`, `AccessAI`, `ADG Tech`, `Fuelix AI`, `DaoAI`, `NCellular AI`, `Softmax Data`, `Zero Inbox Technologies`, `Revela Systems`, `Intelautomatics`, `3 Lions AI Solutions`, `Ainome Inc.`, `Novatone Consulting Ltd.` | artifact C name list | No URL, no location, no evidence of BC presence. Names only. **These are the exact shape of row that a name-derived URL generator would turn into a plausible-looking record** (AUDIT.md §2.3). They stay here. |
| "Vancouver AgTech AI/ML company, CAD$16M seed, March 2026" | search aggregator | **The company is not named in the source.** An unnamed company is not a record. |
| "Vancouver startups attracted over $1.4B in VC in 2024, +35% YoY"; "grown 22% in 2025" | commercial list-building sites | No primary source; these sites sell lead lists and their figures are not independently checkable. Context at best; **not published**. |
| "33 active BC regions" (BC + AI) | <https://bc-ai.ca> | **CONFIRMED as a claim by BC + AI about itself**, but the 33 are not enumerated on the page fetched, so they cannot become 33 records. |
| Bell AI Fabric total capacity | §1.2 | ~500 MW reported vs 866+ MW by facility arithmetic. **Irreconcilable from public sources.** No total is published. |
| Nanaimo data centre; Prophet River First Nation | §§1.4–1.5 | Reported by third parties. Need a first-party or municipal source before publication. |
| `Avigilon (Motorola Solutions)`, `Cisco Systems Vancouver`, `Borealis AI (RBC Research Lab)` | artifact C | Real organizations with real BC offices — but "has an office in Vancouver" and "does AI work in BC" are different claims, and only the second earns a record. Needs the scope test of [PLAN.md](PLAN.md) §2.4. |

---

## 10. Sources

- TELUS / Government of Canada sovereign AI infrastructure (2026-05-11) — <https://www.newswire.ca/news-releases/telus-and-government-of-canada-advance-work-to-scale-canada-s-sovereign-ai-infrastructure-854223505.html>
- Telus to expand Kamloops data center, lease two new Vancouver sites — <https://www.datacenterdynamics.com/en/news/canadas-telus-to-expand-kamloops-data-center-lease-two-new-sites-in-vancouver/>
- Bell to build six AI data centres in Canada (2025-05-28) — <https://betakit.com/bell-to-build-six-ai-data-centres-in-canada-as-telcos-compete-on-infrastructure/>
- Bell AI Fabric 500MW supercluster — <https://www.datacenterdynamics.com/en/news/bell-ai-fabric-bell-canada-plans-ai-data-center-supercluster-with-500mw-in-british-columbia/>
- Bell breaks ground in Kamloops (2026-04-14) — <https://bebeez.eu/2026/04/14/bell-canada-breaks-ground-on-data-center-in-kamloops-british-columbia/>
- B.C. launching competitive process for clean power (2026-01-30) — <https://news.gov.bc.ca/releases/2026ECS0005-000095>
- BC Hydro emerging-industries connections — <https://app.bchydro.com/accounts-billing/electrical-connections/large-load/emerging-industries-connections.html>
- Data centre regulation in BC, BLG (2026-07) — <https://www.blg.com/en/insights/2026/07/data-centre-regulation-in-british-columbia-competing-for-a-limited-supply>
- BC opens 400MW power competition (2026-01-31) — <https://www.theminermag.com/news/2026-01-31/canada-ai-british-columbia>
- Why First Nations should be all-in on AI data centres (2026-05-29) — <https://thehub.ca/2026/05/29/why-first-nations-should-be-all-in-on-ai-data-centres/>
- First Nations Technology Council, digital transformation & AI — <https://technologycouncil.ca/research/digital-transformation-ai/>
- Inaugural SFU–UBC BC AI Research-to-Adoption Summit (2026-05) — <https://www.sfu.ca/fas/computing/news-events/news/2026/may/sfu-ubc-collaborates-on-bc-ai-research-to-adoption-summit.html>
- BC AI Summit, UBC CS (2026-05) — <https://www.cs.ubc.ca/news/2026/05/bc-ai-summit>
- UBC Research + Innovation, AI — <https://research.ubc.ca/ai>
- UBC AI-enabled teaching infrastructure (2026-04) — <https://ubctoday.ubc.ca/news/april-04-2026/ubc-accelerate-ai-enabled-teaching-new-computing-infrastructure-and-services>
- UBC advanced machine learning training network — <https://science.ubc.ca/news/whats-next-ai-ubc-launch-advanced-machine-learning-training-network>
- UBC, SFU federal defence innovation support (2026-02-24) — <https://techcouver.com/2026/02/24/ubc-sfu-federal-support-defence-innovation-projects/>
- Salish SIGCHI Celebration, SFU (2026-06) — <https://www.sfu.ca/fas/computing/news-events/news/2026/june/building-momentum-in-the-age-of-ai-inaugural-salish-sigchi-celebration-unites-bcs-growing-hci-community.html>
- SFU Big Data Hub, AI at SFU — <https://www.sfu.ca/big-data/using-data/artificial-intelligence-at-sfu.html>
- Regional Artificial Intelligence Initiative, Province of BC — <https://www2.gov.bc.ca/gov/content/employment-business/economic-development/funding-and-grants/regional-artificial-intelligence-initiative>
- RAII launch, PacifiCan — <https://www.canada.ca/en/pacific-economic-development/news/2024/10/regional-artificial-intelligence-initiative-will-support-ai-innovation-and-adoption-in-british-columbia.html>
- PacifiCan AI & quantum commercialization (2026-05) — <https://www.canada.ca/en/pacific-economic-development/news/2026/05/accelerating-commercialization-and-adoption-of-ai-and-quantum-technologies-in-british-columbia.html>
- PacifiCan defence innovation, $13.8M (2026-03) — <https://www.canada.ca/en/pacific-economic-development/news/2026/03/pacifican-invests-138-million-to-advance-defence-innovation-in-ai-and-aerospace-in-british-columbia.html>
- BC tech M&A 2025, T-Net (2026-01-26) — <https://www.bctechnology.com/news/2026/1/26/BC-Tech-Companies-Close-82-Merger-and-Acquisition-Deals-in-2025-Top-10-Deals-Worth-5.1-Billion.cfm>
- SPUD acquired by GrubMarket (2026-07-27) — <https://www.bctechnology.com/news/2026/7/27/Vancouver-based-Online-Grocery-Services-Company-SPUD-Acquired-by-GrubMarket.cfm>
- BC + AI Ecosystem Association — <https://bc-ai.ca>
- Launch of Comox Valley AI meetup, CV + AI — <https://bc-ai.ca/news/launch-of-comox-valley-ai-community-meetup-cv-ai>
- Comox Valley governments' AI use — <https://thediscourse.ca/comox-valley/how-do-comox-valley-governments-and-public-organizations-use-ai>
- Data centres and AI infrastructure are coming to BC, Martlet — <https://martlet.ca/data-centres-and-ai-infrastructure-are-coming-to-b-c/>
- BC data centres face power constraints, BIV — <https://www.biv.com/news/data-centres-are-coming-to-bc-but-is-there-enough-power-12044005>
- Sovereign AI data centre cluster plan, CBC — <https://www.cbc.ca/news/canada/british-columbia/b-c-ai-data-centre-plan-vancouver-kamloops-9.7195426>
- Bell to launch 6 AI data centres in BC, CBC — <https://www.cbc.ca/news/canada/british-columbia/bell-ai-new-data-centres-bc-1.7546516>
- Construction begins on Kamloops AI data centre, CBC — <https://www.cbc.ca/news/canada/british-columbia/kamloops-ai-data-centre-tru-9.7167647>
- Bell AI Fabric Kamloops 2, DataCenterMap — <https://www.datacentermap.com/canada/kamloops/bell-ai-fabric-kamloops-2/>
- BC Tech Map 2025, Techcouver — <https://techcouver.com/2025/07/23/bc-tech-map-2025/>
- Canada startup funding rounds, June 2026 — <https://beststartup.ca/canada-startup-funding-rounds-june-2026/>

**Fetch failures, recorded rather than hidden.** Three sources returned HTTP 403 to
automated fetch and were read only via search-result summaries or alternate mirrors:
`telus.com` media release (mirrored via Cision Newswire, used), `cbc.ca` (two
articles, substituted with BetaKit and BeBeez), `castanetkamloops.net`. Every figure
above that originated in a 403'd source is attributed to the mirror or alternate
actually read, not to the source that refused.
