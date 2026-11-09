# Quote audit, 2026-11-09: does every stored quote appear on its page?

The data file `public/ecosystem.json` stores a short "evidence quote" for most records: a few words copied from the record's source page, so anyone can open the page, search for the words and see that the record is real. This audit checked all 136 records to see whether each stored quote really is on its page, word for word. A pilot on ten records had found two quotes that were not (New Ventures BC had commas the page does not print; an Innovate BC quote skipped "Box 49164,"). This audit measures how many of the rest fail, and records what was done about them.

The results, one line per record, are in `quote-audit-2026-11-09.csv` in this folder. This file explains them. **The CSV and this file describe the final state of the `quote-audit` branch:** each record's status is what a fresh check of its live page found after the fixes. The notes on a record say what the first check found and what was done.

## The counts

Every one of the 136 records has exactly one status.

| Status | First check | Now | Meaning |
|---|---:|---:|---|
| verbatim | 91 | 100 | The quote is on the page, word for word. |
| differs | 9 | 0 | The page was read, and the quote is not on it. |
| unreachable | 4 | 3 | The page could not be read. |
| no-quote | 32 | 33 | The record has no quote (it carries the "quote-pending" flag). |
| verbatim-whitespace-only | 0 | 0 | matches once spacing is tidied |
| typography-only | 0 | 0 | differs only in curly versus straight quote marks or dash type |
| needs-rendering | 0 | 0 | found only after scripts run, still unresolved |
| verbatim-rendered | 0 | 0 | found only after the page's scripts ran |
| **Total** | **136** | **136** | 100 + 0 + 3 + 33 |

Of the 103 records that have a quote, **100 now pass and 3 cannot be checked** (all 3 have a dead or blocked page). The first check found 91 passing, 9 differing and 4 unreachable of 104. By page: the 136 records cite 78 pages; 55 pass, 0 differ, 3 cannot be read, and 20 are cited only by records with no quote (78 in all).

## What the check did

- Each page was fetched once, one request at a time with at least a second between requests, a 30-second limit, and the generic client name `BCAICompass-audit/1.0`. No email address was sent. A failed request was tried a second time and then given up on.
- The page text was extracted like this: character codes (such as `&amp;`) were turned into the characters they stand for; tags that sit inside a line (links, bold, italic, small text and similar) were removed without adding a space; tags that start a new line or block (paragraphs, list items, line breaks, table cells and similar) became a space; and all runs of spaces, line breaks and non-breaking spaces became one space. Nothing else was changed. The stored quote was then looked for in that text, character for character.
- Pages where the raw text did not show the quote were re-read in a real browser (the rendered text, after the page's scripts ran) before a verdict was final: Quantum Algorithms Institute, Niricson, the Fraser Valley room page and Animikii. In all four the quote was absent from the rendered text too. Every replacement quote was also confirmed in the rendered text.
- After the fixes, the whole audit was run again against the rebuilt data, which is where the "Now" column comes from.
- A "pass" means the words are in the page's text. It does not prove a visitor can see them: text in menus or hidden sections is part of the page too.

## What was fixed since the first check

| Record | What changed | Why | New value |
|---|---|---|---|
| quantum-algorithms-institute | quote | the stored sentence was no longer on the page | strengthen British Columbia’s quantum ecosystem |
| novarc-technologies | quote | a comma the page does not print | 4505 Still Creek Ave., Burnaby, BC V5C 5W1 Canada |
| open-ocean-robotics | quote | commas the page does not print | 200-45 Erie Street Victoria, BC CANADA V8V 1P8 |
| variational-ai | quote | a comma the page does not print | 1825 Quebec Street, #201 Vancouver, BC V5T 2Z3 |
| viatec | quote | a comma where the page has a vertical bar | 777 Fort Street \| Victoria BC V8W 1G9 |
| bc-ai-ecosystem-association | quote and description | the word 'paying' is not on the page | 300+ members of the nonprofit building British Columbia's AI industry; description now says '300+ members' |
| fv-ai-fraser-valley-ai | quote | the stored sentence was no longer on the page | A Fraser Valley home base for practical talks |
| animikii | quote | a comma the page does not print | 100-722 Cormorant St Victoria, BC V8W 1P8 |
| college-of-new-caledonia | source link and quote | the old link was a 404 | source link now the College's Generative AI page; quote unchanged: 3330-22nd Ave. Prince George, BC, V2N 1P8 |
| niricson | quote removed | the page no longer prints an address or any BC place name | no quote (quote-pending again) |

All of these except Niricson now pass. For each record changed, `sourceDate` is 2026-11-09 and `verified` is 2026-11, except Niricson (quote removed, dates left as they were). Records whose quote already passed were not re-stamped. The 20 Simon Fraser University records fixed in commit 4 are in their own section below.

## The patterns

**1. Punctuation the page does not print (5 records, fixed).** Novarc, Open Ocean Robotics, Variational AI and Animikii each stored an address with a comma the page does not have (for example "#201, Vancouver" where the page reads "#201 Vancouver"). VIATEC stored a comma where the page prints a vertical bar. These look like addresses tidied into standard form instead of copied. It is the same fault as the New Ventures BC quote the pilot corrected.

**2. Wording that is not on the page (4 records).** The Quantum Algorithms Institute's About text and the Fraser Valley room page no longer contain the sentences that were stored (both fixed). Niricson's page shows no address or BC place name at all, so its quote was removed and the record is quote-pending again. The fourth was different: the BC + AI Ecosystem Association quote, and its description, said "300+ **paying** members", and the page says "300+ members". Both now match the page. (The page does show a membership price, so members do pay; it just does not describe the 300+ as "paying members".)

**3. Dead and blocked sources (4 records at first, 3 now).** The College of New Caledonia's link was a 404 and has been repointed to its Generative AI page. Innovate BC's source link is still a 404 and no single current page supports its description (details below). digiBC and the City of Kelowna refused the automated request (403); they may be fine in an ordinary browser, and a person has to look.

**4. Passing quotes that prove little.** 29 records pass because the quote is an institution's name that happens to contain a place word ("The University of British Columbia", "© University of Victoria"). They are word for word, but they name an organization, not a location. 8 records carry only a bare place name ("Vancouver", "Burnaby, B.C." or "Comox Valley"); these pass, but they are the weakest acceptable form.

**5. Shared sources.** 10 pages are cited by three or more records each. When 10 records cite one page and share one quote, one pass is one fact. The list is below.

**6. A source that has quietly become a different page.** Selkirk College's source address now redirects to a site-search results page. The quote is word for word in that page's footer, but the program page the record means to cite looks gone, so the pass says little. Several other sources redirect to a renamed page on the same site; these are noted per row in the CSV.

**7. A leftover entry in the quote table.** The table that holds quotes has an entry for `https://www.innovatebc.ca` that no record uses (the Innovate BC record cites a different, dead page). Its text still skips "Box 49164," and is not word for word, but nothing published depends on it.

## Records that are not "verbatim"

**differs (0):** none.

**unreachable (3):** innovate-bc (HTTP 404), digibc (HTTP 403), city-of-kelowna (HTTP 403).

**needs-rendering, still unresolved:** none.

**no-quote (33),** grouped by the page they cite. Every one of these pages could be read except as noted. No quotes were invented for them.

- TELUS and Government of Canada release on newswire.ca (7): telus-kamloops-ai-factory, telus-m3-ai-factory, telus-150-west-georgia-ai-factory, telus, westbank, creative-energy, city-of-vancouver
- BetaKit article about Bell (3): bell-ai-fabric-kamloops, bell-ai-fabric-kamloops-tru, thompson-rivers-university
- UBC Faculty of Medicine ovarian-cancer news item (3): ovcare, bc-cancer, ubc-biomedical-engineering
- Bell's Buzz HPC announcement (2): bell-ai-fabric-merritt, buzz-hpc
- BC government energy release on news.gov.bc.ca (2): bc-hydro, bc-ministry-of-energy-and-climate-solutions
- Vancouver Coastal Health Research Institute (2): vchri, vch-vchri-ai-hub
- One record each (14): bell-ai-fabric-kamloops-2 (bebeez.eu), pacifican (www2.gov.bc.ca), comox-valley-regional-district (thediscourse.ca), ubc-ece-optimization-learning-control (ece.ubc.ca), ubc-aim-lab (aimlab.ca), vinci (sfu.ca), acis-laboratories (acislabs.ca), sanctuary-ai (sanctuary.ai), terramera (terramera.com), niricson (niricson.com), visier (visier.com), accelerate-okanagan (accelerateokanagan.com), upper-nicola-band-data-centre (merrittherald.com), ethos-lab (ethoslab.ca)

## What still needs a person

- **innovate-bc.** The source link (a gov.bc.ca partner-organizations page) is a 404, and so are the two parent pages on gov.bc.ca that I tried. Innovate BC's own site (home, About, Programs and Contact pages) prints the address and supports the programme names, mentorship and pilot funding in the description, but says nothing about being a Crown agency, hiring grants, research grants, innovation challenges or advising government. The only current page I found that calls Innovate BC a Crown agency is a gov.bc.ca page about the Venture Acceleration Program, which prints no street address and is not the page the record relied on. Because no single page supports the whole description, nothing was changed. A person needs to choose: repoint the record to `https://www.innovatebc.ca/` (the line "Four Bentall Centre, 1055 Dunsmuir Street, Suite #810, Box 49164, Vancouver, BC, V7X 1J1" is word for word on its home, About and Programs pages, 14 words) and trim the description to what that site supports, or find the page that replaced the partner-organizations page.
- **digibc** and **city-of-kelowna.** Both refused the automated request (HTTP 403 on both attempts). Open each page in an ordinary browser, search for the stored quote, and say whether it is still there. The blocks were not worked around.
- **niricson.** Find Niricson's current contact or address page, read it, and change the source link and quote together. Until then the record is quote-pending.
- **The College of New Caledonia description** says "Northern British Columbia college". Its pages list campuses in Prince George, Burns Lake, Mackenzie, Quesnel and Vanderhoof but never use the word "Northern". It is geography rather than a quoted claim; decide whether to keep it.

## Quotes that do not name a place (flag only)

This record's quote contains no BC city, region, province name, street address or postal code. It is flagged, not judged. **1 other:** city-of-kelowna ("MISA BC Spirit of Innovation Award - Service & efficiency with AI chatbots.").

## Simon Fraser University quotes (commit 4)

The 20 Simon Fraser University records whose stored quote named the university but no place cite just three pages (7 + 8 + 5 records). On each page the contact address in the footer is an exact run of the page's own text that names a place, so all 20 quotes were replaced, and no record was left unchanged. Because a quote belongs to a page, each change applies to every record citing that page: **Big Data Hub page** (8888 University Drive Burnaby, B.C. Canada V5A 1S6): sfu, sfu-digital-democracies-institute, sfu-inn, sfu-icrc, sfu-star-institute, viva, sfu-big-data-hub. **Computing Science labs page** (8888 University Drive Burnaby, B.C. Canada V5A 1S6): sfu-ml-group, sfu-data-science-research-group, sfu-3d-language-and-generation-group, sfu-airob-lab, sfu-database-data-mining-lab, sfu-medical-image-analysis-lab, sfu-mars-lab, sfu-natural-language-laboratory. **School of Interactive Arts and Technology labs page** (250-13450 102nd Avenue Surrey, B.C. Canada V3T 0A3): sfu-learning-analytics-lab, sfu-data-dialogue-lab, sfu-integrated-science-lab, sfu-computational-neuroscience-lab, sfu-computational-design-lab. Each of the three new quotes is 8 words and was confirmed in both the raw and the browser-rendered page text. Those 20 records now show sourceDate 2026-11-09 and verified 2026-11.

| Record | Old quote | New quote, or why unchanged |
|---|---|---|
| sfu | © Simon Fraser University | 8888 University Drive Burnaby, B.C. Canada V5A 1S6 |
| sfu-digital-democracies-institute | © Simon Fraser University | 8888 University Drive Burnaby, B.C. Canada V5A 1S6 |
| sfu-inn | © Simon Fraser University | 8888 University Drive Burnaby, B.C. Canada V5A 1S6 |
| sfu-icrc | © Simon Fraser University | 8888 University Drive Burnaby, B.C. Canada V5A 1S6 |
| sfu-star-institute | © Simon Fraser University | 8888 University Drive Burnaby, B.C. Canada V5A 1S6 |
| viva | © Simon Fraser University | 8888 University Drive Burnaby, B.C. Canada V5A 1S6 (the record is located in Vancouver; this page's address is SFU Burnaby, flagged for a person) |
| sfu-big-data-hub | © Simon Fraser University | 8888 University Drive Burnaby, B.C. Canada V5A 1S6 |
| sfu-ml-group | Simon Fraser University | 8888 University Drive Burnaby, B.C. Canada V5A 1S6 |
| sfu-data-science-research-group | Simon Fraser University | 8888 University Drive Burnaby, B.C. Canada V5A 1S6 |
| sfu-3d-language-and-generation-group | Simon Fraser University | 8888 University Drive Burnaby, B.C. Canada V5A 1S6 |
| sfu-airob-lab | Simon Fraser University | 8888 University Drive Burnaby, B.C. Canada V5A 1S6 |
| sfu-database-data-mining-lab | Simon Fraser University | 8888 University Drive Burnaby, B.C. Canada V5A 1S6 |
| sfu-medical-image-analysis-lab | Simon Fraser University | 8888 University Drive Burnaby, B.C. Canada V5A 1S6 |
| sfu-mars-lab | Simon Fraser University | 8888 University Drive Burnaby, B.C. Canada V5A 1S6 |
| sfu-natural-language-laboratory | Simon Fraser University | 8888 University Drive Burnaby, B.C. Canada V5A 1S6 |
| sfu-learning-analytics-lab | Simon Fraser University | 250-13450 102nd Avenue Surrey, B.C. Canada V3T 0A3 |
| sfu-data-dialogue-lab | Simon Fraser University | 250-13450 102nd Avenue Surrey, B.C. Canada V3T 0A3 |
| sfu-integrated-science-lab | Simon Fraser University | 250-13450 102nd Avenue Surrey, B.C. Canada V3T 0A3 |
| sfu-computational-neuroscience-lab | Simon Fraser University | 250-13450 102nd Avenue Surrey, B.C. Canada V3T 0A3 |
| sfu-computational-design-lab | Simon Fraser University | 250-13450 102nd Avenue Surrey, B.C. Canada V3T 0A3 |

**One flag for a person:** `viva` (Vancouver Institute for Visual Analytics) is located in Vancouver in the record, but it shares the Big Data Hub page with six Burnaby records, so its quote names Burnaby, SFU's campus address. The quote is exact page text and names a BC place, as asked, but it does not match that record's own location.

## Sources cited by three or more records

A pass on a shared source proves little about any one record.

| Records | Page | Quote | Status |
|---:|---|---|---|
| 10 | research.ubc.ca/ai | The University of British Columbia | verbatim |
| 10 | cs.ubc.ca/research-groups | The University of British Columbia | verbatim |
| 8 | sfu.ca/fas/computing/research/labs.html | 8888 University Drive Burnaby, B.C. Canada V5A 1S6 | verbatim |
| 7 | newswire.ca/news-releases/telus-and-government-of-canada-advance-work-to-scale-c | (none) | no-quote |
| 7 | sfu.ca/big-data/using-data/artificial-intelligence-at-sfu.html | 8888 University Drive Burnaby, B.C. Canada V5A 1S6 | verbatim |
| 7 | uvic.ca/ecs/computerscience/research/index.php | © University of Victoria | verbatim |
| 5 | sfu.ca/siat/research/research-labs.html | 250-13450 102nd Avenue Surrey, B.C. Canada V3T 0A3 | verbatim |
| 3 | betakit.com/bell-to-build-six-ai-data-centres-in-canada-as-telcos-compete-on-inf | (none) | no-quote |
| 3 | med.ubc.ca/news/harnessing-ai-to-improve-ovarian-cancer-outcomes/ | (none) | no-quote |
| 3 | sfu.ca/computing/research.html | Burnaby, B.C. | verbatim |

Those 10 pages carry 63 of the 136 records.

## The eleven pilot records (regression check)

All eleven records changed or re-read in the pilot pass: ubc-data-science-institute, ubc-trustml, ubc-hai, sfu-tai-lab, sfu-iviz-lab, sfu-metacreation-lab, bcnet, new-ventures-bc, ai-at-uvic, uvic, kast. Every quote is word for word on its page today (11 of 11 verbatim), and every one names a place (11 of 11).

## Limits of this audit

- It checks that the quote is in the page's text. It does not check that the record's description or category is right (the exceptions are the few descriptions named above, which were read against their pages).
- A quote shared by many records is checked once per page but counted once per record.
- Blocked and dead pages were not worked around: a blocked request was not retried with a different client, because that is a person's call.
- The extraction treats a few inline tags beyond the ones named in the brief (underline, small, superscript, subscript, font, abbreviation, citation, mark, time, code and similar) as invisible too, because a browser does.
