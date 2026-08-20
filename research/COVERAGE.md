# COVERAGE — what has been searched, and what has not

**Updated:** 2026-08-19

This file exists to stop one specific misreading of the dataset: **a zero is not a
finding.**

A region with no records has not been shown to have no AI activity. It has been
shown that nobody searched it. Those are completely different claims, and a map that
renders them identically is lying by omission. The site marks uncovered regions and
categories **"not yet surveyed"** for exactly this reason, and this file is the
long-form version.

---

## 1. Regions

| Region | Verified records | State |
|---|---:|---|
| Metro Vancouver | 81 | Searched, far from exhausted |
| Vancouver Island & Coast | 15 | Victoria well covered; Nanaimo, Comox partially; rest of the Island **not searched** |
| Thompson-Okanagan | 10 | Kamloops/Merritt infrastructure covered; Kelowna partially; Vernon, Penticton, Salmon Arm **not searched** |
| Province-wide | 7 | Organizations with a provincial mandate |
| Kootenay | 1 | **One record only** — KAST. Nelson, Trail, Cranbrook, Castlegar, Revelstoke otherwise **not searched** |
| Cariboo | 1 | **One record only** — Innovation Central Society, Prince George. UNBC, Quesnel, Williams Lake **not searched** |
| Northeast | 1 | **One record only** — the Prophet River First Nation data centre LOI. Fort St. John, Dawson Creek, Northern Lights College **not searched** |
| Fraser Valley | 1 | **One record only** — FV+AI. Abbotsford, Chilliwack, Langley, UFV **not searched** |
| **North Coast & Nechako** | **0** | **NOT SEARCHED TO CONCLUSION.** See §1.1. |

### 1.1 North Coast & Nechako — what was actually searched

The only region with zero records, so the search behind that zero is recorded in full
rather than left implied.

**Searched on 2026-08-19:**

- Web search for technology/innovation/AI organizations across Terrace, Prince Rupert,
  Smithers and Vanderhoof. Returned Coast Mountain College and UNBC's northwest
  campuses, plus general province-level AI coverage. No regional AI or technology
  association surfaced.
- **Coast Mountain College** — fetched `coastmountaincollege.ca`. Campuses confirmed
  at Terrace, Prince Rupert, Smithers, Hazelton and Haida Gwaii, and an "Innovation
  lab" is listed among its facilities. **No AI or applied-research programme is stated
  on the page read**, so no record was created. A third-party aggregator claimed an AI
  offering; aggregators are not sources.
- **Prince Rupert Port Authority** — searched for AI or machine-learning use in
  terminal operations. Results were generic industry material about ports and AI
  worldwide, plus a 2019 item on possible automation. **Nothing specific to Prince
  Rupert was found.**
- **UNBC northwest campuses** — Terrace and Prince Rupert campuses confirmed to exist.
  `unbc.ca/research` returned HTTP 403 to automated fetch, so UNBC's research units
  could not be enumerated at all — a gap that also affects the Cariboo region.

**Conclusion: not searched to conclusion.** Three candidate paths were tried and none
produced a sourceable AI connection. That is a weak search, not a strong negative.
**The correct reading is that this region is unmapped, not empty.**

**Next pass should try:** UNBC research units once the 403 is worked around; the
Nechako valley agricultural technology sector; Haisla, Nisga'a and Gitxsan economic
development corporations; the Kitimat LNG industrial corridor's operational
technology; and Coast Mountain College's innovation lab directly rather than via its
homepage.

---

## 2. Categories

All seven categories currently have at least one record, so none renders as "not yet
surveyed" today. The UI supports that state and will show it if a category ever
empties.

| Category | Records | State |
|---|---:|---|
| Research & Academia | 72 | Over-represented — see §4 |
| Compute & Infrastructure | 13 | The 2026 buildout is covered; BC Hydro allocation results pending |
| Companies & Applied AI | 11 | **Badly under-searched** — see §4 |
| Capital & Accelerators | 8 | Regional accelerators partially covered; most VC funds **not searched** |
| Public Sector & Policy | 5 | Provincial level only; most municipalities **not searched** |
| Community & Convening | 5 | BC + AI chapters covered; independent meetups **not searched** |
| Talent & Education | 3 | **Barely started** — bootcamps, colleges, training providers **not searched** |

---

## 3. Sectors not searched to conclusion

None of the following has been worked systematically. Each is a plausible source of
records and several are likely to be significant.

- **Health institutions** — beyond VCHRI, BC Cancer and OVCARE. PHSA, Fraser Health,
  Island Health, Interior Health, Northern Health, Providence, BC Children's.
- **Forestry and wildfire** — including the wildfire-prediction work that is one of
  BC's more distinctive AI applications.
- **Fisheries and aquaculture.**
- **Ocean technology** — beyond Open Ocean Robotics.
- **Ports and logistics** — and note the scope test in PLAN.md §2.4: a terminal
  written about in an AI article is not thereby an AI organization.
- **Utilities' internal AI use** — BC Hydro is recorded as the allocator of power,
  not as an AI user; those are different records.
- **Most accelerators and incubators.**
- **Most 2026 events** — Web Summit Vancouver, Vancouver Startup Week, the Western
  Angel Investment Summit and Futureproof are known but not all recorded.
- **Municipalities** — everything outside Vancouver and the Comox Valley Regional
  District. Kelowna in particular is reported to be the most advanced municipality in
  the province on AI adoption and is **not yet a record**: `kelowna.ca` returned
  HTTP 403 to automated fetch on 2026-08-19. Surrey, Burnaby, Abbotsford, Richmond and
  Courtenay are all reported to have AI policies or deployments and none is recorded.

---

## 4. The composition skew — corrected in part, 2026-08-19

**The method change described in §4.1 below was executed. Here is what moved.**

| Category | Before | After |
|---|---:|---:|
| Research & Academia | 72 | 72 |
| **Companies & Applied AI** | **11** | **18** |
| Compute & Infrastructure | 13 | 13 |
| **Community & Convening** | **5** | **11** |
| Capital & Accelerators | 8 | 8 |
| Public Sector & Policy | 6 | 6 |
| **Talent & Education** | **3** | **6** |
| **Total** | **118** | **134** |

**Academic share fell from 61% to 54%.** Not one academic record was added; the
denominator moved instead. That is the correct shape of the fix — the problem was
never that the university records were wrong, it was that nothing else was being
found at the same rate.

| Region | Before | After |
|---|---:|---:|
| Metro Vancouver | 81 | 90 |
| Vancouver Island & Coast | 15 | 16 |
| Thompson-Okanagan | 11 | 12 |
| Province-wide | 7 | 9 |
| **Fraser Valley** | **1** | **2** |
| **Kootenay** | **1** | **2** |
| **Cariboo** | **1** | **2** |
| Northeast | 1 | 1 |
| **North Coast & Nechako** | **0** | **0** |

**The method change worked exactly as predicted.** Every company added came from a
contact page, a careers page or a campus footer — pages whose job is to state a
city — and not one from a marketing homepage. Salmon Arm, Abbotsford, Castlegar and
Prince George each entered the dataset this way.

**What is still wrong.** Metro Vancouver still holds 67% of all records. Research &
Academia is still the largest category by a factor of four. North Coast & Nechako
still holds nothing, after a second search (§1.1). Capital & Accelerators did not
move at all — most BC venture funds remain unsearched, and they are the obvious next
target because a fund's own site almost always states its city.

**Talent & Education is no longer thin, and the "Learn the craft" onramp reflects
that.** Three records became six, spanning Metro Vancouver, Vancouver Island, the
Fraser Valley, the Kootenays and the Cariboo. It is usable; it is not finished.
Bootcamps and private training providers are still unsearched, and BrainStation
failed verification because its own Vancouver campus page does not name Vancouver.

---

## 4.1 The original diagnosis, kept for the record

**72 of 117 records — 62% — are academic research units. 11 are companies.**

That is not what British Columbia's AI ecosystem looks like. It is what is *cheap to
verify*: a university publishes one page that names a lab, states its research field
and identifies its campus, and a single fetch satisfies every verification condition
at once. A company's marketing site says "AI" on every screen and its address on
none, so it takes two or three fetches, and roughly half of those are blocked by
bot protection.

**The method verified what was verifiable, and the shape of the dataset is a
fingerprint of the method rather than of the province.** Anyone reading these
proportions as a description of BC's AI economy will be badly misled.

Correcting it is the top priority for the next pass. The approach that works is
**structured registries rather than marketing sites**: member directories from BC
Tech Association, DigiBC, DIGITAL, Innovate BC, Accelerate Okanagan, VIATEC, KAST and
Innovation Central Society; provincial and federal funding announcements that name
recipient companies and their cities; and municipal economic development directories.
All of those state a city in a structured field, which is the thing company homepages
never do.
