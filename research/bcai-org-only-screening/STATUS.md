# Status of this packet: candidates, not records

Written 2026-11-09 on the local branch `pr2-screened`, and copied unchanged in substance into this folder (`research/bcai-org-only-screening/`) on the branch `screening-sibling`. Nothing here was pushed, posted or merged.

## What this folder is

**Where the packet is.** Kris Krüg's packet is in pull request #2, in the folder `research/bcai-org-only-pilot/` of that pull request. **It is not in this repo's `main`**, and that folder does not exist on this branch. The ids in `SCREENING.csv` and `CROSSWALK-CHECK.csv` (for example `organization:telus`) refer to rows in that packet. Where this file says "this folder" below, it means the packet folder as it was when it was screened, with these three files added beside Kris's twelve.

The packet holds 900 organizations that someone thinks belong in a map of British Columbia's AI ecosystem. Each of the 900 rows is a **candidate**. A candidate is a claim waiting to be checked. It is **not** a verified record, and **none of the 900 is published**: nothing here is published to the site, the Compass map or the Compass data files. Kris's original twelve files were left unchanged; the screening added only three files (`SCREENING.csv`, `CROSSWALK-CHECK.csv` and this `STATUS.md`), which are the three files in this folder.

## How a candidate becomes a Compass record

One row at a time, and only when all four of these are true:

1. The record's source link is the organization's **own current page**, not a news story, a directory or a list.
2. A person or tool actually **opened and read** that page on the day it is checked.
3. The record carries a **short exact quote** copied from that page that **names a place** (an address or a city in British Columbia), and the quote matches the page character for character.
4. Any map coordinates come with their **own source link** for the coordinates.

A page that cannot be read leaves the candidate "unresolved". Nothing is filled in from a guess.

## What has and has not been checked

- **Checked against the organization's own pages:** the ten pilot records. Their results are in `research/pilot/` (written on the branch `pilot-ten`).
- **Compared, but mostly not opened:** the 43 pairings in Kris's `organization-crosswalk.csv` (36 "same organization" pairs and 7 "broader record" pairs). `CROSSWALK-CHECK.csv` compares each pair by name, website and the packet's own text. Only two pairs were actually opened in a browser. All 43 came out "yes".
- **Not checked at all:** the other candidates' claims. The packet's descriptions are Kris's summaries, cut off at 420 characters, and have not been matched to any page.

## What the screening did

`SCREENING.csv` has one line for each of the 900 rows: `id`, `name`, `website`, `flags`, `include_in_queue` (yes or no) and `reason`. A row is marked **no** only when the packet's own text gives a hard reason. Every judgment below came from reading the row's summary; the lists that needed judgment were read in full, row by row.

**Hard flags (a row with any of these is marked no):**

| Flag | Rows | What it means |
|---|---|---|
| `no-location` | 39 | The row gives no location. |
| `location-names-no-bc-place` | 64 | A location is given but none is in BC (Toronto, Montreal, Calgary, Seattle, London UK, Denver and others). Two of the 64 say "(unconfirmed)"; count them as naming BC and the figure is 62. |
| `listed-only` | 20 | The summary only says the organization is listed or referenced in "BC + AI" sources. |
| `linkedin-only-stub` | 2 | The summary rests on a LinkedIn mention and describes nothing else. |
| `no-ai-relevance` | 23 | The summary itself says there is no AI product or relevance. 17 of these also name a BC place (for example BC Liquor Distribution Branch, Beem Credit Union, Boxcar Marketing, Cardeo Creative). |
| `dissolved` | 2 | The summary begins "Dissolved." (Cloudburst Research and CrossPacific Capital Partners). |
| `no-longer-operating` | 3 | The summary says it is inactive or absorbed into another company (PostAid, T4G Limited, Point Grey Research Inc.). |
| `individual-practice` | 11 | The summary describes a one-person advisory practice mainly through that person's career (Ben Nyland Consulting, Aligned Interests and nine others). |
| `person-named-row` | 1 | The row is a person's name (Lise Alain); the business described is her company. |
| `no-bc-entity-per-summary` | 10 | The summary says no BC office, registration or identifiable BC entity was found. |
| `not-an-independent-organization` | 2 | A student club and a chapter of a global association. |

143 rows carry at least one hard flag. The numbers above add up to more than 143 because 33 rows carry two or more.

**Result:** 757 rows are marked **yes** (plausible to check against their own page) and 143 are marked **no**.

- 38 of the 757 are already Compass records according to Kris's crosswalk, so **719** would be new to Compass.
- Five softer problems are flagged but do **not** remove a row: no website listed (36 rows in all), a location that names only the province (33), a website shared with another row (71 rows flagged, 65 distinct rows across 30 web addresses), a website that is only a third-party page such as meetup.com or crunchbase.com (11), and a BC location the summary calls unconfirmed (1). If you also hold back every row with one of those, **654** remain (627 not yet in Compass).
- Five more rows (DevRel.Agency, GetFresh Ventures, OrpheusKey R&D, ScalableHR, Sense and Motion) lean on the founder's background but also describe services. They are flagged `founder-career-borderline` and kept in the queue.
- Rows that share a website with a differently named row may be duplicates (for example Able and "Able (able.co)", or the three Larlee Rosenberg rows). They are kept in the queue and flagged, so the queue count can double-count some organizations until each pair is resolved.

## A note on Kris's verifier script

`verify_packet.py` checks the packet's file hashes, row counts and publication-boundary rules. Two things to know:

- **On Windows it fails before it checks anything**, because its list of expected files uses forward slashes (`data/organizations.json`) and Windows reports backslashes. With only that one line changed (in a scratch copy, not in this folder) it prints `PASS: 900 screened organizations, exact hashes and CSV parity, 43 mappings, ten pending candidates; no individual records or download links.`
- **Adding any file to the packet folder makes it fail on purpose**, because the script requires that folder to hold exactly its twelve original files. The three files kept here are therefore outside what it checks (and they now live in a separate folder, so the packet folder is not touched). To re-verify the original packet, run the script against the packet as it sits in pull request #2 (the local `pr2` ref), not against this folder.

The four hashed files listed in `release.json` match their stated SHA-256 values and byte counts, both on disk and in the `pr2` branch.

## Other things noticed in the packet

- The packet's University of Victoria row calls `uvicai.ca` "a dedicated AI research hub". That site's own page says it is a student club and community.
- Kris's crosswalk is missing the SFU Trustworthy AI Lab (`organization:trustworthy-ai-lab-sfu`), which is the same lab as the Compass record `sfu-tai-lab`.
- Three Compass records disagree with their packet row about the city (Novarc, Niricson, 4AG Robotics). In each case the Compass city comes from a quote recorded from the company's own page, so the packet row may be out of date. Only reading each page again will settle it.
