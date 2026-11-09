# Screening of Kris Krüg's BC AI packet (pull request #2)

Kris Krüg's packet of 900 candidate organizations is in **pull request #2**, in the folder `research/bcai-org-only-pilot/`. **It is not in this repo's `main`**, and that folder is not on this branch. This folder holds only the three files from the screening of that packet. Nothing here is published to the site, and none of the 900 rows is a verified Compass record.

## 1. What each file is

- **`SCREENING.csv`**: one line for each of the 900 packet rows (`id`, `name`, `website`, `flags`, `include_in_queue`, `reason`). The `id` is the packet row's id (for example `organization:telus`). A row is marked `no` only when the packet's own summary gives a hard reason.
- **`CROSSWALK-CHECK.csv`**: Kris's crosswalk pairs 43 packet-row/Compass-record pairs; this file compares each pair by name, website and the packet's own text. Its first line is a note, not data: skip it when reading the file as CSV. `crosswalk_id` is the packet row id and `compass_id` is a record id in this repo.
- **`STATUS.md`**: a plain-English account of what was and was not checked, the flag definitions, and notes on Kris's verifier script.

## 2. The packet problems found, recomputed from the two CSV files on 2026-11-09

Method: a short script read `SCREENING.csv` and counted how many rows carry each word in the `flags` column; a row is "passing" when `include_in_queue` is `yes`. The crosswalk figures come from counting the lines of `CROSSWALK-CHECK.csv` after its note line. The earlier report's figures are shown for comparison; **every one was confirmed, none differed**.

| Figure | Earlier report | Recomputed | How |
|---|---:|---:|---|
| Rows | 900 | 900 | lines in `SCREENING.csv`; 900 distinct ids |
| No location (`no-location`) | 39 | **39** | rows carrying the flag |
| Location names no BC place | 64 (62 if two "(unconfirmed)" count as BC) | **64** | rows carrying `location-names-no-bc-place`; the two whose reason says "unconfirmed" are A47L and Protein Design AI (Unidentified), so 62 without them |
| Listed only | 20 | **20** | `listed-only` |
| LinkedIn-only stubs | 2 | **2** | `linkedin-only-stub` |
| Summary says no AI relevance | 23 | **23** | `no-ai-relevance`; 17 of them also name a BC place |
| Dissolved | 2 | **2** | `dissolved` |
| No longer operating | 3 | **3** | `no-longer-operating` |
| Individual advisory practices | 11 | **11** | `individual-practice` (Aligned Interests, Ben Nyland Consulting, Carter Coaching & Consulting, Flourish Marketing Co., Happy Pedals SEO Audits & Copywriting, K Bedford Consulting, nooCore Technologies, Pico Future, RMS Vogt Consulting, Sarah Downey Consulting, Steele Consulting Group); plus 1 `person-named-row` (Lise Alain) |
| Other hard flags | 10 and 2 | **10** and **2** | `no-bc-entity-per-summary` and `not-an-independent-organization` |
| Rows with at least one hard flag, i.e. marked `no` | 143 | **143** | rows with `include_in_queue` = `no`; 33 of them carry two or more hard flags |
| Rows passing (`yes`) | 757 | **757** | 757 + 143 = 900; no `yes` row has a hard flag |
| Passing rows already in Compass per the crosswalk | 38 | **38** | passing rows carrying `in-crosswalk-same-entity` (36) or `in-crosswalk-broader-record` (2) |
| Passing rows new to Compass | 719 | **719** | 757 - 38 |
| Passing rows with none of the five soft problems | 654 | **654** (627 not in Compass) | no website 36, province-only location 33, shared website 71 flags on 65 rows, third-party-only website 11, unconfirmed BC location 1 |
| Crosswalk pairs | 43 | **43**, all `yes` | on 38 distinct packet rows, because the Bell row covers four Compass records and the TELUS row covers three |

Rows marked `yes` are only "plausible to check against their own first-party page". Nothing was checked against pages except as stated in `STATUS.md`.

## 3. Known issues in the packet itself

- **Kris's verifier fails on Windows.** I reran it on 2026-11-09 from the `pr2` ref, extracted into a scratch folder (read-only, nothing written to the packet), with `python -I -X utf8`. It stopped at its first check with:
  `File ".../research/bcai-org-only-pilot/verify_packet.py", line 10, in <module>` ... `assert {str(path.relative_to(root)) for path in root.rglob('*') if path.is_file()} == expected_files` ... `AssertionError`.
  The cause, found earlier by comparing the two sets: Windows reports `data\organizations.csv` and `data\organizations.json` with backslashes, but the script's expected list has `data/organizations.csv` and `data/organizations.json`. Earlier, a scratch copy with only that line changed to `.as_posix()` printed `PASS: 900 screened organizations, exact hashes and CSV parity, 43 mappings, ten pending candidates; no individual records or download links.` I did not repeat that patched run today, so treat that second result as an earlier finding.
- **The crosswalk omits the SFU Trustworthy AI Lab.** Reconfirmed today: the packet's `data/organizations.csv` has the row `organization:trustworthy-ai-lab-sfu` ("Trustworthy AI Lab - SFU", website `sfu-tai.github.io`, Burnaby), and the packet's `organization-crosswalk.csv` has no line mentioning it. The Compass record is `sfu-tai-lab`. That lab's page (`sfu-tai.github.io`) loads today and mentions Burnaby.
- **Three crosswalk pairs disagree on city** (from the notes in `CROSSWALK-CHECK.csv`; I did not re-read these companies' pages today): Novarc (packet: North Vancouver; Compass: Burnaby), Niricson (packet: Victoria; Compass: Vancouver) and 4AG Robotics (packet: British Columbia and Vancouver; Compass: Salmon Arm). Update: since those notes were written, Niricson's Compass quote was removed because its page no longer prints an address, so that city is no longer backed by a stored quote.
- **The First Nations Technology Council's packet website returns 404.** Reconfirmed today: `https://www.technologycouncil.ca/` answers HTTP 404. The Compass record uses `firstnationstech.ca`.
- **`uvicai.ca` calls itself a student club.** Reconfirmed today: its page says "We are a community of students from the University of Victoria" and refers to "the UVicAI club". The packet's University of Victoria row calls it "a dedicated AI research hub".
