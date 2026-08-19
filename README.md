# BC AI Compass — bc-aicompass.ca

A verified, province-wide map and directory of British Columbia's AI ecosystem.

**Every record on this site names the page it was checked against and the date it
was checked.** That is the entire premise. A directory that tells you *when* it was
checked but not *against what* cannot be audited or corrected — it can only be
believed, and this one does not ask to be believed.

**BC AI Compass is a [BC + AI Ecosystem Association](https://bc-ai.ca) project,
built by Martin Montero** as his contribution to it. BC + AI is itself listed in this
directory, and that is stated on the site rather than left for you to discover.

**No other organization listed here is a partner, funder or endorser of this
project** — not the universities, not the telecoms, not the Crown agencies, not any
company. No listing is paid for or sponsored.

---

## What is here

- **117 verified organizations**, each with a `sourceUrl`, a `sourceDate` and a
  `verified` stamp, and 80 of them carry a verbatim evidence quote copied off the source page. 111 have sourced coordinates and appear on the map; the rest
  have a province-wide mandate and no single seat, and appear in the directory
  without a pin.
- **The map** — province-wide, fitted to the data rather than centred on
  Vancouver, with region and category filters and grid-based marker clustering so
  Kamloops, Merritt, Kelowna, Victoria, Courtenay and Surrey stay findable next to
  the Lower Mainland's density.
- **The directory** — searchable, filterable, and every row's verified stamp is a
  link to the source.
- **The regions** — British Columbia's AI activity grouped by region, with an
  editorial note per region that describes only what the verified records in it
  actually show.
- **The method** — a plain statement on the page of what "verified" means here,
  what this project refuses to publish, and why.
- **Open data** — the whole dataset ships as
  [`public/ecosystem.json`](public/ecosystem.json) and
  [`public/ecosystem.geojson`](public/ecosystem.geojson), regenerated and
  re-validated on every build.

## Scope — the whole ecosystem, not only the AI builders

**An organization is in scope when it funds, houses, teaches, convenes, governs,
represents, powers or otherwise materially supports AI work in British Columbia, and
that can be sourced.** An industry association does not have to do AI to be part of
the AI ecosystem. A Crown agency that funds AI companies is in. An accelerator whose
portfolio includes AI companies is in. So are investors, universities, community
groups, Indigenous-led organizations, media, and the physical infrastructure the whole
thing runs on.

Where a source did not claim AI work, the record's description does not claim it
either. Inclusion is an ecosystem judgement; it is not licence to put words in an
organization's mouth.

## Categories

Seven, derived from what the verified data contains rather than from the 85
overlapping labels in the source database — none of which had a word for AI
compute infrastructure, which is the largest thing to happen to AI in British
Columbia since that database was last dumped.

`Compute & Infrastructure` · `Research & Academia` · `Companies & Applied AI` ·
`Public Sector & Policy` · `Capital & Accelerators` · `Talent & Education` ·
`Community & Convening`

## What this project will not publish

| | Why |
|---|---|
| **Funding figures** | Permanently out of scope. Most likely field to be wrong, most likely to be quoted, hardest to confirm from a primary source in one reading. |
| **Emails and phone numbers of individuals** | Republishing scraped contact details is a privacy problem before it is an accuracy problem. A named officer an organization publishes about itself is a different case and *is* carried, in `keyPeople`, sourced or null. |
| **Ministers, on organization records** | They change faster than any re-verification cycle — a BC cabinet shuffle invalidated one while this was being built. They live on one dated page, [`research/GOVERNMENT-LAYER.md`](research/GOVERNMENT-LAYER.md), so a single edit updates everything. |
| **Generated descriptions** | No blurb is produced from a name, a domain or a category. Where the source did not support a description, the field is `null` and the site says so. |
| **Invented coordinates** | Pins are municipal centroids from a named gazetteer, never a guessed street address. No confirmed location means no pin, and that is a correct outcome. |
| **Anything inherited** | Candidate *names* came from an older dataset. Not one published *value* did. |
| **An "Indigenous-led" label** | That is a self-identification, not an attribute for an outside project to assign. Where an organization states it, it appears in that record's own sourced description, in the organization's own words. |

## Where the data came from

A public dump of a community ecosystem database, dated 2025-08-04, supplied **a
list of names to go and check** — and nothing else.

That dump held 1,399 rows. 262 of them turned out not to be organizations at all
but lines lifted out of a markdown report, one row per line: `Headquarters:`,
`CEO:`, `Team Size:`, `batch-15-formatted.json`. Of the 403 rows with a real URL,
15 pointed at LinkedIn, 6 at Meetup, and 176 carried a domain derivable
character-for-character from the organization's name — including one that now
resolves to a domain-sale parking page in Phoenix, Arizona. 230 of 480 funding
figures were drawn from a pool of 26 round numbers.

The full audit, with exact counts and the PowerShell that reproduces each one, is
in [`research/AUDIT.md`](research/AUDIT.md). It is worth reading before trusting
any BC AI dataset, including this one.

## Documentation

| File | What it is |
|---|---|
| [`research/AUDIT.md`](research/AUDIT.md) | The full defect inventory of the source data, with reproducible counts |
| [`research/PLAN.md`](research/PLAN.md) | Schema, taxonomy, map design, verification protocol, and every default decision taken |
| [`research/GAPS.md`](research/GAPS.md) | What a current dataset must contain that the source did not — with sources and dates |
| [`research/VERIFICATION.md`](research/VERIFICATION.md) | What was actually done, including everything that could not be confirmed |
| [`research/DESIGN.md`](research/DESIGN.md) | The design system and its per-project binding |
| [`research/SHIP.md`](research/SHIP.md) | Deployment, rollback, and the re-verification cadence |
| [`research/COVERAGE.md`](research/COVERAGE.md) | **What has been searched and what has not** — including why one region is still empty. Read this before drawing conclusions from a zero. |
| [`research/GOVERNMENT-LAYER.md`](research/GOVERNMENT-LAYER.md) | BC's AI portfolio and the municipal layer, on one dated page rather than scattered across records |
| [`research/seed-summary.md`](research/seed-summary.md) | The source data normalized into leads, with attrition per filter stage |
| [`research/union.json`](research/union.json) | 2,467 distinct names from **every** JSON and CSV in the source repository, not just the one backup dump |
| [`research/unverified.json`](research/unverified.json) | 1,475 candidates that did **not** reach verified, with a reason each. Never built into the site. |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | How to add or correct an organization, and what evidence a submission needs |

## Stack

- React 19 + TypeScript + Vite 7
- Tailwind CSS 3.4
- Leaflet / React-Leaflet with OpenStreetMap tiles
- Token-based light/dark theming — see [`research/DESIGN.md`](research/DESIGN.md)

No clustering library: the marker clusterer is ~60 lines in
`src/sections/EcosystemMap.tsx`. The reasoning is in
[`research/PLAN.md`](research/PLAN.md) §3.1 — briefly, a community wrapper's peer
range against React 19 is a build risk this project's gates cannot absorb, and the
dependency surface is itself a stated project value.

`esbuild` is declared explicitly in `devDependencies`. The project this pattern was
adapted from imported it in its data-export script without declaring it anywhere,
and it resolved only through npm's flat hoisting of Vite's own copy — which breaks
under pnpm, Yarn PnP or `npm ci --omit=dev`, and breaks at `prebuild`, before the
type-check. See [`research/AUDIT.md`](research/AUDIT.md) §8.

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

`prebuild` runs `scripts/export-data.mjs`, which **validates the dataset and fails
the build** if any record lacks a source URL, carries coordinates without a
`geoSourceUrl`, has a duplicate id, uses a category outside the union, or if the
verified count drops below 100. Then `tsc -b && vite build` emits `dist/`.

`status: 'verified'` is a **literal type** on `Organization`, so an unverified
record cannot enter the published array without `tsc` failing. The ship gate is a
compile error, not a code review.

## Verify

```bash
powershell -NoProfile -File .\research\audit\Test-ExitConditions.ps1 -CleanInstall
```

32 machine-checked conditions: clean install, build, `tsc`, `eslint`, both JSON
outputs parse, ids unique, every record sourced and stamped, at least 100 records,
category union closed in both directions, no coordinate without a source, GeoJSON
feature count matches, no inherited field anywhere in `src/`, `src/` never imports
from `research/`, `unverified.json` never reaches `dist/`, deploy artifacts
present, and every inline script hash present in the CSP.

## Adding or correcting an organization

All published data lives in one file: `src/data/organizations.ts`.

**A submission needs a link, not a name.** See
[`CONTRIBUTING.md`](CONTRIBUTING.md) for the four things a record needs and why an
unsourced name cannot be accepted — it is exactly how the dataset this replaced
reached 1,399 rows with no way to tell which were real.

**Freshness.** Oldest `verified` stamps are revisited first. Companies and
community groups quarterly; infrastructure, research and public bodies annually.
British Columbia's competitive power allocation for AI data centres is decided in
September 2026, so the compute records will move before most others do. Cadence
and commands are in [`research/SHIP.md`](research/SHIP.md).

## Licence

- **Code: MIT.** See [`LICENSE`](LICENSE).
- **Data: CC BY 4.0.** The dataset in `src/data/organizations.ts`,
  `public/ecosystem.json` and `public/ecosystem.geojson` is licensed under
  [Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/).
  **Credit `bc-aicompass.ca`.** Take it and build with it.

Map tiles © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors.

## Credits

Built on the unceded territories of the many Indigenous nations whose lands make up
British Columbia.

A [BC + AI Ecosystem Association](https://bc-ai.ca) project, built by
[Martin Montero](https://www.linkedin.com/in/martinmontero).
