# Ten-record pilot: what happened when each record was checked against its own page

Date of all page reads: 2026-11-08. Branch: `pilot-ten`. Nothing was pushed, merged or posted anywhere.

## How to read this

- **Compass record** means one entry in `src/data/organizations.ts`, the file that feeds the map and directory.
- **The packet** means Kris Krüg's candidate list (900 organization rows) from pull request #2. A packet row is a *candidate*, not a checked record.
- **First-party page** means the organization's own website page, not a news article or someone else's list.
- **Evidence quote** means a short run of words copied exactly from that page that names a place. I confirmed each one by downloading the page and matching the text character for character, not by trusting a summary. The export step also refuses any quote of 15 words or more.
- **Quote-pending flag** is the label a record carries when it has no verified quote yet.
- **Outcome words:** *accepted* (source and claims hold as they are), *accepted-with-source-fix* (the claim holds but the record pointed at the wrong page, so the source moved), *corrected* (a claim was wrong or unsupported and was rewritten from the page), *unresolved* (the page could not be read), *excluded* (does not belong).

Outcome count: 1 accepted, 5 accepted-with-source-fix, 4 corrected, 0 unresolved, 0 excluded. The ten rows with exact quotes, URLs and notes are in `ten-record-outcomes.csv`.

| Record | Outcome |
|---|---|
| ubc-data-science-institute | accepted-with-source-fix |
| ubc-trustml | accepted-with-source-fix |
| ubc-hai | corrected |
| sfu-tai-lab | accepted-with-source-fix |
| sfu-iviz-lab | accepted-with-source-fix |
| sfu-metacreation-lab | accepted-with-source-fix |
| bcnet | corrected |
| new-ventures-bc | corrected |
| ai-at-uvic | accepted |
| kast | corrected |

## One paragraph per record

**UBC Data Science Institute (accepted-with-source-fix).** No packet row. The record cited a UBC research-portal list page that covers dozens of groups; it now cites the institute's own site, https://dsi.ubc.ca/. The page calls the institute "a Faculty of Science initiative", so the record's word "Faculty-wide" was replaced. The place-naming quote is the footer address of the Faculty of Science's Office of the Dean (Vancouver, BC). The institute's own address is also in the footer ("EOS Main Building 6339 Stores Road, Room 113C") but names no city, so I did not use it as the quote.

**TrustML (accepted-with-source-fix).** No packet row. Source and link moved from the same UBC list page to https://trustml.ubc.ca/. The description already matched the page ("systems that are reliable, secure, explainable, and ethical"). The quote ("Research Excellence Clusters at UBC Vancouver") is the first six words of a longer sentence, because the whole sentence is 16 words, over the limit. It names UBC Vancouver but gives no street.

**Human-AI Interaction @ UBC (corrected).** No packet row. The standalone site `hai.cs.ubc.ca`, which the Computer Science department's list links to, answered "404 Not Found", so *that site is unresolved*. The department's own page for the group did load, and I used it. The old description said the group works "at the intersection of AI, human-computer interaction and cognitive science"; that phrase is not on the page and was dropped. The new description uses the group's own terms (AI-driven, human-centred interactive systems that personalize to users; user-adaptive visualization; interfaces for decision support; a vision of ethical AI systems humans can trust). The quote is the department's footer address, not the group's.

**Trustworthy AI (TAI) Lab, SFU (accepted-with-source-fix).** This is the one record with a packet counterpart: `organization:trustworthy-ai-lab-sfu`, the same lab, with the same website and Burnaby as its place. The record cited an SFU labs list that carried only the words "Simon Fraser University"; it now cites the lab's own site https://sfu-tai.github.io/, whose sentence "Our lab is located in the beautiful Burnaby campus of Simon Fraser University" names the place. The description stays empty on purpose. Kris's crosswalk file (the 43-row table that pairs packet rows with Compass records) does not list this pair, so the crosswalk is missing at least this one match.

**iViz Lab, SFU (accepted-with-source-fix).** No packet row. Source and link moved from the SIAT labs list to the lab's own site https://ivizlab.github.io/ (the older address `ivizlab.org` is only a redirect stub). The description matched the page, which says "expression, emotion, behavior, empathy and creativity". The quote is the address line "Surrey, BC, Canada V3T 0A3": city, province and postal code but no street.

**Metacreation Lab (accepted-with-source-fix).** No packet row. The lab's home page gave no place-naming words, so the record carried the quote-pending flag. Its contact page prints "Surrey, BC V3T 0A3", so the stored source moved there and the flag is gone. The record's link stays on the home page, which carries the description wording. The record therefore stands on two pages of the same site, because it can only store one source address.

**BCNET (corrected).** No packet row (the packet's BCcampus row is a different organization). The first sentence now rests on BCNET's own about page: "dedicated to the needs of B.C.'s higher education and research institutions". The second sentence, about Thompson Rivers University (TRU) compute, had only a BetaKit news article behind it. I reread that article: it says Bell said the TRU data centre will give students and faculty access to compute, not just on campus but "through provincial network service provider BCNET". That is Bell's future-tense statement as reported by BetaKit on May 28, 2025, not a BCNET statement, and the "training and inference compute" wording in the old record is not in that passage, so I reworded the sentence to say exactly that. **The TRU-compute claim is still second-hand.** BCNET's home, about, news and search pages never mention Thompson Rivers University, Bell or AI, and I could not read Bell's own release (see "Pages I could not read").

**New Ventures BC (corrected).** No packet row. It is a different organization from Innovate BC: its page says the 2026 competition is "presented by Innovate BC", and the two share a suite address. Two defects fixed. First, the stored address quote had commas the page does not print, so it was not verbatim; it now matches the footer exactly ("Suite #810 1055 Dunsmuir Street Vancouver, BC V7X 1J1"). Second, the description said the accelerator "helps BC companies move beyond experimentation", which is not on the accelerator's page; the description now says what the page says: a two-stream AI training program for early-stage and growth-stage BC companies, built around workshops, mentorship and an AI implementation plan. That program is time-limited (Stream 2 applications closed September 7, 2026 and the cohort ends December 2026), so that sentence needs a re-check after December.

**AI@UVic (accepted).** No packet row for AI@UVic. The page says "This site is a hub for guidance, resources and communities of practice", which matches the record. Only the stored quote changed: the old one ("using artificial intelligence (AI) tools at UVic") names an abbreviation, not a place, so it now carries the footer's campus address. **`uvicai.ca` is a different body.** Its page says "We are a community of students from the University of Victoria" and calls itself a club. The packet's University of Victoria row calls `uvicai.ca` "a dedicated AI research hub", which that page does not support. The packet's other parent rows exist as expected: `organization:ubc`, `organization:computer-science-ubc`, `organization:sfu`, `organization:university-of-victoria`.

**KAST (corrected).** No packet row. The address, the "only non-profit tech association serving the entire Kootenay region" sentence and the Nelson Innovation Centre all check out. One claim did not: the record listed "the MIDAS lab" among what KAST runs, but KAST's own page says its project management of MIDAS Lab "changed over to Selkirk College on April 1, 2020". The description now says that. TechEdge, which the page calls "a developing KAST initiative", is now described as developing. **Who leads KAST today:** KAST's Our Team page (https://kast.com/about/who-we-are/) lists "Priya Biswas Chief Executive Officer and Executive Director". This is reported only; I added no People profile and touched no people data.

## The three judgments

**1. Did any outcome change a record on the map?** Not any pin. No coordinates moved, no record was added or removed, and the map still shows 136 records. What changed is what a visitor reads and where links lead: five descriptions were rewritten (Data Science Institute, HAI, BCNET, New Ventures BC, KAST) and four outward links now go to the organization's own page (TrustML, HAI, TAI Lab, iViz Lab). The published data files changed for eleven records: these ten plus `uvic`, because `uvic` cites the same UVic page as AI@UVic and so picks up the same new quote.

**2. Did any source get stronger?** Yes, in seven of ten records. Six moved from a list page or a news article to the organization's own page (Data Science Institute, TrustML, HAI, TAI Lab, iViz Lab, BCNET). Metacreation moved to a page that actually names its place. Two more kept their page but got a better quote (New Ventures BC, whose old quote was not verbatim, and AI@UVic, whose old quote named no place). Two records dropped the quote-pending flag (Metacreation and BCNET), so the pending count fell from 34 to 32. One claim did not get stronger: BCNET's tie to the TRU compute remains second-hand.

**3. Average minutes per record, and what that costs for about 530 packet rows.** These are *agent minutes*, the clock time I took, not the time a person would need. I timed each record with a stopwatch log.
- Stopwatch windows (reading the pages and checking quotes): 0.3 to 3.2 minutes per record; total 11.9 minutes; **average 1.2 minutes per record.** The two slow ones were BCNET (2.7) and New Ventures BC (3.2), the two where I found real discrepancies.
- A wider measure, from receiving the task to the last page read for the tenth record, including the packet search and deciding each outcome, is 14.8 minutes, **1.5 minutes per record.**
- Multiplied by about 530 plausible packet rows: roughly **10.5 hours** (at 1.2) to **13 hours** (at 1.5) of agent time, before any file editing, testing or review.
- **Treat that as a floor, not a forecast.** The ten were already-known institutions, mostly universities, where the correct page was easy to find and carries an address in its footer. Most of the 530 packet rows are small companies where the hard part is finding the right first-party page, and many will end up unresolved. I did not time a person doing this, so I make no claim about human hours.

## What this pilot does and does not test

Nine of the ten records have no packet counterpart, so **this pilot mostly tests Compass's own sourcing, not the packet.** Only the SFU TAI Lab could be compared with a packet row, and there the packet agreed. The pilot's real finding is about Compass: all ten records survived the check, but only one needed no change, and four contained a claim that was wrong or unsupported. The ten are therefore a fair test of "can I verify an existing record against its own page", and a poor test of "how good is the packet".

For a real packet-import test, swap in packet rows that Compass does not have yet. These six exist in the packet with websites, and none is in Compass: **Apera AI** (apera.ai, Vancouver), **Photonic** (photonic.com, Vancouver), **1QBit** (1qbit.com, Vancouver), **InBC Investment Corp.** (inbcinvestment.com, Vancouver), **Vanedge Capital** (vanedgecapital.com, Vancouver) and **Nexera Robotics** (nexera-robotics.com, North Vancouver).

## Other things I found along the way (not fixed, because they are outside the ten)

1. **Innovate BC's stored quote is also not verbatim.** It reads "Four Bentall Centre, 1055 Dunsmuir Street, Suite #810, Vancouver, BC", but the page prints "Four Bentall Centre, 1055 Dunsmuir Street, Suite #810, Box 49164, Vancouver, BC, V7X 1J1". The stored version silently skips "Box 49164,". A single re-check pass over every stored quote would catch more of these; I have not run it.
2. **Kris's crosswalk is missing the TAI Lab pair** (above).
3. **An earlier statement of mine needs correcting.** I previously told you TRU's newsroom had "settled" that `bell-ai-fabric-kamloops-tru` and `bell-ai-fabric-kamloops-2` (1452 McGill Road) are two separate facilities. That rested on a summarising tool's paraphrase, not on the page's own words. Today's direct reading of TRU's newsroom item (https://inside.tru.ca/2026/04/09/tru-community-trust-advances-data-centre-development/) says the 1452 McGill Road data centre "will form part of Bell Canada’s Bell AI Fabric", is "Located along McGill Road", and is expected in "late 2027". It does not say the McGill Road site is separate from the TRU-campus facility. Both records claim 26 MW, so they **may be one facility counted twice. A person should decide.** I changed neither record.
4. **Bell's AI Fabric page returned "404 Not Found" to my script today** (https://www.bell.ca/Business/AI-Fabric). Three Compass records use it as their link. Either it moved or Bell blocks scripts; open it in a browser.

## Pages I could not read

- `hai.cs.ubc.ca`: HTTP 404 (HAI's standalone site). Need: the group's current standalone address, if it has one.
- Bell's own press release for the TRU data centre on newswire.ca: HTTP 403 (blocked). Need: someone to open it in a browser and say whether it names BCNET.
- bce.ca release address: redirected to a general index, not the release.
- `www.bcnet.ca`: connection failed (bc.net was readable and is the address used).
- `https://www.bell.ca/Business/AI-Fabric`: HTTP 404 to my script (see above).
