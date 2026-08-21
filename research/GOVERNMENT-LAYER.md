# GOVERNMENT LAYER — BC's AI portfolio, on one dated page

**Updated:** 2026-08-19
**Next mandatory review:** after any cabinet shuffle, and after 2026-09-15

---

## Why this is a page and not a set of records

Ministers change faster than any re-verification cycle this project can run. **The
2026-08-14 British Columbia cabinet shuffle already invalidated one holder** while
this dataset was being built.

If minister names sat on organization records, a single shuffle would silently
falsify a scattering of rows across the directory, each carrying its own `verified`
stamp asserting it had been checked. **One edit here updates everything instead**, and
the staleness is visible in one place rather than distributed and invisible.

This is the same reasoning that keeps `keyPeople` on organization records limited to
officers an organization publishes about itself, and keeps founding years out
entirely where sources disagree.

---

## Current portfolio

| Item | Detail | Label |
|---|---|---|
| **Minister of State for Artificial Intelligence and New Technologies** | **Rick Glumac.** Post created 2025-07-17, the office newly established rather than inherited. Re-checked 2026-08-21 and he still holds it. | CORROBORATED — the province's own biography page <https://news.gov.bc.ca/ministries/ai-and-new-technologies/biography> states the July 2025 appointment, and the Wikipedia office box shows the post assumed 2025-07-17 with no end date. Both read through search extraction, not fetched, so this is stronger than Tier B and short of fetch-verified. **There is no "BC Ministry of AI"** — the correct style is Minister of State, a junior post, not a standalone ministry. That wrong name appears in the BC + AI Ecosystem Association's own database and must not be carried forward. |
| **Cabinet shuffle** | 2026-08-14. Moved several relevant portfolios. **Any source naming Ravi Kahlon as Minister of Jobs and Economic Growth is now out of date.** | Tier B — **AND NOW IN DOUBT.** A search on 2026-08-21 for a 2026-08-14 shuffle returned nothing: every result describes the 2025-07-17 shuffle, which is the one that put Kahlon in Jobs and Economic Growth and created Glumac's post. Absence of results is not proof it did not happen, but this claim is the basis for treating Kahlon as out of date, and it is uncorroborated. Resolve before anything downstream depends on it. |
| **Ministry of Energy and Climate Solutions** | With BC Hydro, established the competitive clean-power process for AI and data centres under Bill 31, the Energy Statutes Amendment Act. Minister quoted in the 2026-01-30 release: Adrian Dix. | CONFIRMED — <https://news.gov.bc.ca/releases/2026ECS0005-000095> |
| **BC Hydro** | Crown utility running the allocation. CEO quoted in the same release: Charlotte Mitha. | CONFIRMED — same source |
| **Innovate BC reporting ministry** | **STAYS NULL.** Two gov.bc.ca pages disagree: one dated 2026-03-09 says Ministry of Jobs and Economic Growth, one dated 2026-06-22 says Ministry of Finance. The later date favours Finance; the 2026-08-14 shuffle complicates both. **Not published on the Innovate BC record, and the build fails if it appears there.** | UNKNOWN, deliberately |

**Personal names appear on this page and nowhere else on the project.** They are not
rendered on the site, not emitted in `ecosystem.json`, and not carried on any
organization record.

---

## The scheduled revision that matters most

**BC Hydro notifies successful applicants for the 400 MW AI and data-centre
allocation in mid-September 2026.**

- Opened 2026-01-30 under Bill 31.
- 15 applications received, representing close to 800 MW — roughly double the
  available allocation, so **around half will be refused.**
- **Applicants are not publicly named.**

**Source conflict, recorded rather than resolved.** The January 2026 government
release and BC Hydro state **up to 400 MW over two years**. An earlier Province
framework page describes **300 MW AI plus 100 MW data centre plus 200 MW hydrogen**.
The 400 MW figure is more recent and more authoritative and is the one used in the
dataset; the earlier framing is recorded here so a future reader who finds it does not
assume this project missed it.

**What must happen after 2026-09-15:** every TELUS and Bell record must distinguish
**awarded** megawatts from **applied-for** megawatts, and any newly named winners
become new records. Until then, every capacity figure in the dataset is design or
secured capacity, never awarded capacity. See [SHIP.md](SHIP.md) §4.3.

---

## Municipal layer — a real gap

British Columbia municipalities are adopting AI faster than this dataset reflects, and
municipal records are one of the few reliable sources of **non-Metro-Vancouver**
entries. All Tier B, none yet a published record except the Comox Valley Regional
District.

| Municipality | Reported | Status here |
|---|---|---|
| **City of Kelowna** | Reported the most advanced municipality in BC: first Canadian municipality to launch an AI-powered building-permit digital assistant (2023), chatbots since 2020, built with a $350,000 provincial grant and Microsoft | **Not published** — `kelowna.ca` returned HTTP 403 to automated fetch on 2026-08-19 |
| **City of Vancouver** | Published an AI task-force report in 2026; Copilot approved for staff; the Mayor described using AI agents for administrative and research work, explicitly not for policy decisions | Published as a record, but sourced to its role in the TELUS AI factory cluster — **not** to its own AI programme |
| **Surrey, Burnaby, Abbotsford** | Microsoft Copilot approved for staff | Not published |
| **City of Richmond** | Uses GovAI rather than org-wide Copilot | Not published |
| **Comox Valley Regional District** | Adopted an AI Governance Policy 2026-05-01; AI traffic analytics since January 2026 | **Published** |
| **City of Courtenay** | Developing an AI policy; completed an AI Impact Assessment for its Intelligent Intersections project | Not published |

**Kelowna is the highest-value single record missing from this dataset.** It is a
Thompson-Okanagan entry, a municipal entry and a genuinely notable Canadian first, and
it is absent for no better reason than a bot block.
