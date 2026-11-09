# Quote audit, 2026-11-09: does every stored quote appear on its page?

The data file `public/ecosystem.json` stores a short "evidence quote" for most records: a few words copied from the record's source page, so anyone can open the page, search for the words and see that the record is real. This audit checked all 136 records to see whether each stored quote really is on its page, word for word. A pilot on ten records had found two quotes that were not (New Ventures BC had commas the page does not print; an Innovate BC quote skipped "Box 49164,"). This audit measures how many of the rest fail.

The full results, one line per record, are in `quote-audit-2026-11-09.csv` in this folder. This file explains them.

## The counts

Every one of the 136 records gets exactly one status.

| Status | Records | Meaning |
|---|---:|---|
| verbatim | 91 | The quote is on the page, word for word. |
| differs | 9 | The page was read, and the quote is not on it. |
| unreachable | 4 | The page could not be read (two dead links, two blocked requests). |
| no-quote | 32 | The record has no quote (it carries the "quote-pending" flag). |
| verbatim-whitespace-only | 0 | (Would mean: matches once spacing is tidied.) |
| typography-only | 0 | (Would mean: differs only in curly versus straight quote marks or dash type.) |
| needs-rendering, still unresolved | 0 | One page was first flagged this way, then re-read in a browser (see below). |
| verbatim-rendered | 0 | (Would mean: found only after the page's scripts ran.) |
| **Total** | **136** | 91 + 9 + 4 + 32 + 0 + 0 + 0 + 0 |

Of the 104 records that have a quote, **91 pass and 13 do not**: 9 differ and 4 could not be checked. Looked at by page instead of by record, the 136 records cite 78 different pages: 46 pages pass, 9 differ, 4 could not be read, and 19 are cited only by records with no quote. All 9 "differs" and all 4 "unreachable" records cite a page of their own (none shares its page with another record), so each failure touches exactly one record.

## What the check did

- Each of the 78 pages was fetched once, one request at a time with at least a second between requests, a 30-second limit, and the generic client name `BCAICompass-audit/1.0`. No email address was sent. A failed request was tried a second time and then given up on.
- The page text was extracted like this: character codes (such as `&amp;`) were turned into the characters they stand for; tags that sit inside a line (links, bold, italic, small text and similar) were removed without adding a space; tags that start a new line or block (paragraphs, list items, line breaks, table cells and similar) became a space; and all runs of spaces, line breaks and non-breaking spaces became one space. Nothing else was changed. The stored quote was then looked for in that text, character for character.
- Before the verdict was final, four pages were re-read in a real browser (the rendered text, after the page's scripts ran): Quantum Algorithms Institute, Niricson and the Fraser Valley room page (nothing close to the quote turned up in their raw text), and Animikii (flagged as possibly built by scripts). In all four the quote was absent from the rendered text too. For the other five "differs" pages the raw text already showed the page's own wording, so the browser was used only to confirm the proposed replacements.
- A "pass" means the words are in the page's text. It does not prove a visitor can see them: text in menus or hidden sections is part of the page too.

## The patterns

**1. Punctuation the page does not print (5 records).** Novarc, Open Ocean Robotics, Variational AI and Animikii each store an address with a comma the page does not have (for example "#201, Vancouver" where the page reads "#201 Vancouver"). VIATEC stores a comma where the page prints a vertical bar ("777 Fort Street | Victoria BC V8W 1G9"). These look like addresses that were tidied into standard form instead of copied. It is the same fault as the New Ventures BC quote the pilot corrected. Each has an easy exact replacement.

**2. Wording that is not on the page (4 records).** Three of these look like pages that changed since the quote was taken. The Quantum Algorithms Institute's About text no longer contains the stored sentence. The Fraser Valley room page no longer contains its stored sentence, even in its description tags. Niricson's page shows no address or BC place name at all. The fourth is different and worth attention: the BC + AI Ecosystem Association quote reads "300+ **paying** members", and the page says "300+ members". The word "paying" is not on the page, and it changes the meaning (the page does not say the members pay).

**3. Dead and blocked sources (4 records).** Innovate BC's source link (a gov.bc.ca page) and the College of New Caledonia's source link both answer "404 Not Found" (the College's old link first redirects to a new address that is also 404). digiBC and the City of Kelowna refused the automated request ("403 Forbidden"); they may be perfectly fine in an ordinary browser. A person has to look at those two.

**4. Passing quotes that prove little.** 29 records pass because the quote is an institution's name that happens to contain a place word: "The University of British Columbia" and "© University of Victoria". They are word for word, but they name an organization, not a location. 20 SFU records carry "Simon Fraser University" or "© Simon Fraser University", which names no place at all. Eight records carry nothing but a bare place name ("Vancouver" on four, "Burnaby, B.C." on three, "Comox Valley" on one); these pass, but they are the weakest acceptable form.

**5. Shared sources.** Ten pages are cited by three or more records each. When 10 records cite one page and share one quote, one pass is one fact. The list is below.

**6. A source that has quietly become a different page.** Selkirk College's source address now redirects to a site-search results page. The quote is word for word in that page's footer, but the program page the record means to cite looks gone, so the pass says little. Several other sources redirect to a renamed page on the same site; these are noted per row in the CSV.

**7. A leftover entry in the quote table.** The table that holds quotes has an entry for `https://www.innovatebc.ca` that no record uses (the Innovate BC record cites a different, now-dead page). That entry's text still skips "Box 49164,", but nothing published depends on it. It is the only unused entry: of the table's 60 entries, 59 are used.

## Every record that is not "verbatim"

**differs (9):** quantum-algorithms-institute, novarc-technologies, niricson, open-ocean-robotics, variational-ai, viatec, bc-ai-ecosystem-association, fv-ai-fraser-valley-ai, animikii.

**unreachable (4):** innovate-bc (404), digibc (403), college-of-new-caledonia (404), city-of-kelowna (403).

**needs-rendering, still unresolved:** none. (Animikii was flagged first, then found to be a plain comma mismatch; see above.)

**no-quote (32),** grouped by the page they cite. All 19 of these pages could be read.
- TELUS and Government of Canada release on newswire.ca (7): telus-kamloops-ai-factory, telus-m3-ai-factory, telus-150-west-georgia-ai-factory, telus, westbank, creative-energy, city-of-vancouver
- BetaKit article about Bell (3): bell-ai-fabric-kamloops, bell-ai-fabric-kamloops-tru, thompson-rivers-university
- UBC Faculty of Medicine ovarian-cancer news item (3): ovcare, bc-cancer, ubc-biomedical-engineering
- Bell's Buzz HPC announcement (2): bell-ai-fabric-merritt, buzz-hpc
- BC government energy release on news.gov.bc.ca (2): bc-hydro, bc-ministry-of-energy-and-climate-solutions
- Vancouver Coastal Health Research Institute (2): vchri, vch-vchri-ai-hub
- One record each: bell-ai-fabric-kamloops-2 (bebeez.eu), pacifican (gov.bc.ca funding page), comox-valley-regional-district (The Discourse), ubc-ece-optimization-learning-control (ece.ubc.ca), ubc-aim-lab (aimlab.ca), vinci (SFU centres page), acis-laboratories (acislabs.ca), sanctuary-ai (sanctuary.ai/about), terramera (terramera.com; its home page has almost no text without scripts), visier (visier.com/company), accelerate-okanagan (accelerateokanagan.com/about), upper-nicola-band-data-centre (Merritt Herald), ethos-lab (ethoslab.ca)

No quotes were invented for these.

## Quotes that do not name a place (flag only)

These 21 records' quotes contain no BC city, region, province name, street address or postal code. They are flagged, not judged, and none is changed by this audit. **20 SFU records:** sfu, sfu-digital-democracies-institute, sfu-inn, sfu-icrc, sfu-star-institute, viva, sfu-big-data-hub (all "© Simon Fraser University"); sfu-ml-group, sfu-data-science-research-group, sfu-3d-language-and-generation-group, sfu-airob-lab, sfu-database-data-mining-lab, sfu-medical-image-analysis-lab, sfu-mars-lab, sfu-natural-language-laboratory, sfu-learning-analytics-lab, sfu-data-dialogue-lab, sfu-integrated-science-lab, sfu-computational-neuroscience-lab, sfu-computational-design-lab (all "Simon Fraser University"). **1 other:** city-of-kelowna ("MISA BC Spirit of Innovation Award - Service & efficiency with AI chatbots.", which is also unreachable).

## Sources cited by three or more records

A pass on a shared source proves little about any one record. Ten pages:

| Records | Page | Quote | Status |
|---:|---|---|---|
| 10 | research.ubc.ca/ai | The University of British Columbia | verbatim |
| 10 | cs.ubc.ca/research-groups | The University of British Columbia | verbatim |
| 8 | sfu.ca/fas/computing/research/labs.html | Simon Fraser University | verbatim |
| 7 | newswire.ca TELUS release | (none) | no-quote |
| 7 | sfu.ca/big-data/.../artificial-intelligence-at-sfu.html | © Simon Fraser University | verbatim |
| 7 | uvic.ca/ecs/computerscience/research/index.php | © University of Victoria | verbatim |
| 5 | sfu.ca/siat/research/research-labs.html | Simon Fraser University | verbatim |
| 3 | betakit.com Bell article | (none) | no-quote |
| 3 | med.ubc.ca ovarian-cancer news item | (none) | no-quote |
| 3 | sfu.ca/computing/research.html | Burnaby, B.C. | verbatim |

Those ten pages carry 63 of the 136 records.

## Proposed fixes (not applied by this commit)

A fix is proposed only where the page contains a replacement that is an exact run of its own text, names a place, is under 15 words (the export gate's limit), and comes from the record's own source page. Eight records qualify. Each replacement was also found in the page's rendered text in a browser.

| Record | Stored quote | Proposed quote |
|---|---|---|
| quantum-algorithms-institute | advancing the growth, adoption, and strategic development of quantum technologies in British Columbia | strengthen British Columbia's quantum ecosystem (the page uses a curly apostrophe) |
| novarc-technologies | 4505 Still Creek Ave., Burnaby, BC V5C 5W1, Canada | 4505 Still Creek Ave., Burnaby, BC V5C 5W1 Canada |
| open-ocean-robotics | 200-45 Erie Street, Victoria, BC, CANADA V8V 1P8 | 200-45 Erie Street Victoria, BC CANADA V8V 1P8 |
| variational-ai | 1825 Quebec Street, #201, Vancouver, BC V5T 2Z3 | 1825 Quebec Street, #201 Vancouver, BC V5T 2Z3 |
| viatec | 777 Fort Street, Victoria BC V8W 1G9 | 777 Fort Street \| Victoria BC V8W 1G9 |
| bc-ai-ecosystem-association | 300+ paying members of the nonprofit building British Columbia's AI industry | 300+ members of the nonprofit building British Columbia's AI industry |
| fv-ai-fraser-valley-ai | Practical, responsible AI for the Fraser Valley, with a local room | A Fraser Valley home base for practical talks |
| animikii | 100-722 Cormorant St, Victoria, BC V8W 1P8 | 100-722 Cormorant St Victoria, BC V8W 1P8 |

**No fix can be proposed for five records**, and each needs a person:
- **niricson:** the page names no BC place, and a fix may not come from a different page. A person needs to find Niricson's current contact or address page, read it, and change the source link and quote together.
- **innovate-bc** and **college-of-new-caledonia:** the source links are dead. A person needs to find the current page, read it, and change the source link and quote together.
- **digibc** and **city-of-kelowna:** the sites blocked the automated request. A person needs to open each page in an ordinary browser and check whether the stored quote is still there.

Whether any of these fixes was applied is recorded in the next commit on the `quote-audit` branch.

## The eleven pilot records (regression check)

All eleven records changed or re-read in the pilot pass: ubc-data-science-institute, ubc-trustml, ubc-hai, sfu-tai-lab, sfu-iviz-lab, sfu-metacreation-lab, bcnet, new-ventures-bc, ai-at-uvic, uvic and kast. Every quote is word for word on its page today, and every one names a place.

## Limits of this audit

- It checks that the quote is in the page's text. It does not check that the record's description or category is right.
- A quote shared by many records is checked once per page but counted once per record.
- Two blocked pages and two dead pages were not worked around: a blocked request was not retried with a different client, because that is a person's call.
- The extraction treats a few inline tags beyond the ones you named (underline, small, superscript, subscript, font, abbreviation, citation, mark, time, code and similar) as invisible too, because a browser does.
