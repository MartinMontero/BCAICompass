# People directory — sources, scope, and coverage

Read on **2026-11-04**. The People directory is a separate public-professional dataset in `src/data/people.ts`; it does not modify or re-verify organization records.

## Full-dataset expansion

The directory now contains **126 unique public profiles across 133 of the 136 verified organizations**. The original 21 profiles are preserved. New profiles were researched organization by organization rather than inferred from the BC + AI community pages alone.

`research/people-source-review.json` is the authoritative coverage ledger. It contains one entry for every organization and records seed URLs, followed team/leadership/project links, HTTP results, readable-text results, published profile IDs, and the review outcome. **117 organizations had readable pages during the first crawl; 19 required alternate public-source searches or remained inaccessible.** No inaccessible page is silently treated as evidence that no person exists.

The three organizations without a published profile are explicit:

- **City of Vancouver** — no confirmed AI-specific project lead was added; the general mayor is not presented as an AI project contact.
- **AI Creativity + Design** — the public community page explicitly says no host names are confirmed publicly yet.
- **Kootenay Association for Science & Technology (KAST)** — the profile first attached here (Raagulan Pathy) was removed on 2026-11-08. He is CEO of KAST at `kast.xyz`, a stablecoin company that shares only the acronym with this Nelson-based organization; the link was a name collision. No leader of the Kootenay organization is named in this dataset. That is a gap, not a finding that none is published: the organization's team page was not re-read after the correction. A profile can be added once its current leader is confirmed from a page this project can cite.

Shared leaders are represented once and linked to every relevant verified organization. Current-role checks replace outdated appointment records where necessary—for example, TELUS, DIGITAL, Terramera, 4AG Robotics, QAI, and Innovate BC use their current public leadership rather than former leaders.

## Inclusion rule

A person is included only when a public page names them and supports a current community role or a specific project contribution. Each record carries that page as `sourceUrl`, the read date, and a short verbatim `evidenceQuote`. A public source naming someone as a speaker does **not** make them a community lead. A record with only a role and no longer published bio says so.

Connection links are public routes into a community, project, event, or professional profile. They do not claim that a person has agreed to mentor, collaborate, or respond. Personal email addresses, phone numbers, `mailto:` links, and private contact details are excluded even when a source publishes them. General organization contact forms remain reachable on the source pages themselves.

## Active-community review

Source index: <https://bc-ai.ca/communities#featured-communities>. The association's About page was used to cross-check named leadership: <https://bc-ai.ca/about>.

| Active community | Publicly named leadership used | Role source |
|---|---|---|
| Physical AI & Robotics | Fiann O’Hagan; David Gloyn-Cox | <https://bc-ai.ca/communities/robotics> |
| Vancouver AI | Kris Krüg | <https://bc-ai.ca/about> |
| FV+AI: Fraser Valley AI | Darren Coleman; Matthew Schwartzman | <https://bc-ai.ca/communities/fraser-valley-ai> and About |
| CV + AI: Comox Valley AI | Lourdes Gant; Kris Krüg; Steve Jones; Colin Fitzgerald; Mel DiPietro | <https://bc-ai.ca/communities/comox-valley> |
| AI Film Club | Kevin Friel | <https://bc-ai.ca/about> |
| Mind, AI, and Consciousness (MAC) | **No confirmed public lead found.** Public talks by Loki Jorgenson, Tanya Slingsby, and Fiann O’Hagan are not treated as proof of leadership. | <https://bc-ai.ca/communities/mac> |
| AI Creativity + Design | **No confirmed public lead.** The page explicitly says no host names are confirmed publicly yet. | <https://bc-ai.ca/communities/ai-creativity-design> |
| Ed + AI: Education Meetup | Anthonia Ogundele; Kris Krüg | <https://bc-ai.ca/communities/ai-education> and About |
| AI Ethical Futures Lab | Jesi Carson | <https://bc-ai.ca/about> |
| Life Sciences & AI | Simon Haworth; Kris Krüg | <https://bc-ai.ca/communities/life-sciences-ai> |

Result: **8 of 10 active communities have named public leads in the directory.** The two gaps are displayed in the product and exported as structured coverage data.

## Additional project contributors

Linked pages and existing verified organization records supplied these non-lead contributions:

- **Nessa Palmer** — Ed + AI facilitation and curriculum design: <https://bc-ai.ca/communities/ai-education>
- **Peter Van Garderen** — federal AI transparency consultation facilitation and public record: <https://bc-ai.ca/communities/futures-lab>
- **Sara Taherzadeh** — written federal AI transparency submission: <https://bc-ai.ca/communities/futures-lab>
- **Mauricio Penteado** — Life Sciences and Healthcare work group and Overdose Prevention Society partnership: <https://bc-ai.ca/communities/life-sciences-ai>
- **Martin Lopatka** — Responsible AI Professional curriculum: <https://bc-ai.ca/certification/responsible-ai-professional>
- **Sarah Downey** — Responsible AI Professional governance facilitation: <https://bc-ai.ca/certification/responsible-ai-professional>
- **Loc Dao** — DigiBC executive leadership and creative-technology programs: <https://digibc.org/about/>
- **Jeff Ward** — Animikii founder and CEO, Niiwin and culturally informed technology work: <https://www.animikii.com/about>

## Search and export contract

Search is deterministic and local. It covers names, roles, expertise, projects, communities, locations, public bios, and connection descriptions. Every meaningful query term must match; vocabulary expansion can supply a synonym but cannot introduce a fact. Results explain the fields matched.

`npm run verify:data` validates People and organization data and regenerates `public/people.json` alongside the existing organization exports. The build fails on duplicate IDs, missing or long evidence, invalid dates or URLs, unknown related organizations, unsupported connection kinds, insufficient source coverage, or forbidden contact fields.
