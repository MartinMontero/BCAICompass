# PLAN — BC AI Compass

**Project:** BC AI Compass — a verified, province-wide map and directory of British
Columbia's AI ecosystem, shipping at **bc-aicompass.ca**.
**Plan date:** 2026-08-19
**Predecessor audit:** [AUDIT.md](AUDIT.md) — read that first; this plan is a response to it.

Claim labels are used here as in AUDIT.md: **CONFIRMED** (read in a named file or at
a cited URL), **INFERRED** (reasoned to, from what is stated), **UNKNOWN**.

---

## 0. The one thing this plan has to get right

**CONFIRMED** from [AUDIT.md](AUDIT.md) §1.2: the predecessor database, taken at its
healthiest observed state, recorded a source for **49 of 839 rows — 6%**.

Everything below follows from that. Not the map, not the design, not the stack. The
schema requires a source per record because the failure being corrected is not "the
data got stale" — it is "the data never said where it came from, so nobody could tell
stale from fabricated." A verification date without a source is the artifact that
produced `Researching` on 289 rows and `$5M` on 26 of them.

---

## 1. SCHEMA

**Default taken.** Extend builderworkshop's `Asset` with `region`, `orgType`, `size`,
`sourceUrl`, `sourceDate`, `verified`, `status`. Optional `lat`/`lng` as in the
original: records with coordinates pin on the map, records without appear in the
directory only.

This is the complete type as it will ship in `src\data\organizations.ts` — not a
fragment.

```ts
// ---------------------------------------------------------------------------
// BC AI Compass — the published dataset type.
//
// Every value in every record below traces to a source URL that was read on the
// stated date. Nothing is inferred from a name, a domain, or a pattern. A field
// with no source is null, and null is a legitimate published state.
// ---------------------------------------------------------------------------

/**
 * Seven categories, derived from what the verified dataset actually contains
 * (PLAN.md section 2), not from the 85 raw labels in the predecessor artifacts.
 */
export type Category =
  | 'Compute & Infrastructure'
  | 'Research & Academia'
  | 'Companies & Applied AI'
  | 'Public Sector & Policy'
  | 'Capital & Accelerators'
  | 'Talent & Education'
  | 'Community & Convening';

/**
 * What kind of entity this is, independent of what sector it works in. The
 * predecessor taxonomy collapsed these two questions into one field, which is
 * how it ended up with 85 labels (AUDIT.md section 5).
 */
export type OrgType =
  | 'company'
  | 'university-or-lab'
  | 'government-or-crown'
  | 'investor-or-program'
  | 'nonprofit-or-association'
  | 'community-group'
  | 'infrastructure-operator';

/**
 * BC Stats development regions, with Mainland/Southwest split into Metro
 * Vancouver and Fraser Valley because that distinction is the whole point of a
 * province-wide map. 'Province-wide' is for organizations with a genuinely
 * provincial mandate and no single seat, not a fallback for unknown.
 * Source: https://www2.gov.bc.ca/gov/content/data/geographic-data-services/land-use/administrative-boundaries
 */
export type Region =
  | 'Metro Vancouver'
  | 'Fraser Valley'
  | 'Vancouver Island & Coast'
  | 'Thompson-Okanagan'
  | 'Kootenay'
  | 'Cariboo'
  | 'North Coast & Nechako'
  | 'Northeast'
  | 'Province-wide';

/** Headcount band. null when no source states it — never estimated. */
export type OrgSize = '1-10' | '11-50' | '51-200' | '201-1000' | '1000+';

/**
 * The published array is typed to the literal 'verified'. This makes the ship
 * gate a compile-time guarantee rather than a lint rule: an unverified record
 * cannot be added to ORGANIZATIONS without tsc failing.
 */
export interface Organization {
  /** URL-safe slug, unique across the dataset. */
  id: string;
  /** The organization's own name for itself, as written on its own site. */
  name: string;
  category: Category;
  orgType: OrgType;
  region: Region;
  /** The organization's own website. Resolved and live as of sourceDate. */
  url: string;
  /** Human-readable place, e.g. 'Kamloops' or 'Vancouver - UBC Point Grey'. */
  location: string;
  /**
   * One or two sentences, written from what the source actually says. null when
   * the source does not support a description. Never generated from the name,
   * the category, or the org type.
   */
  description: string | null;
  /** null unless a source states it. */
  size: OrgSize | null;
  /** Present together, or both absent. Requires geoSourceUrl. */
  lat?: number;
  lng?: number;
  /** Where the coordinates came from. Required whenever lat/lng are present. */
  geoSourceUrl?: string;
  /** The primary source for name, BC presence, category and org type. */
  sourceUrl: string;
  /** ISO date the primary source was read. YYYY-MM-DD. */
  sourceDate: string;
  /** Month of the most recent re-verification. YYYY-MM. */
  verified: string;
  /** Literal. See the note on the interface. */
  status: 'verified';
}

/**
 * Everything that failed verification or could not be checked. Never imported
 * by the site, never built into the bundle. Lives in research\unverified.json.
 */
export interface UnverifiedLead {
  id: string;
  name: string;
  name_raw: string;
  url: string | null;
  url_kind: 'website' | 'linkedin' | null;
  category_raw: string | null;
  source: string;
  status: 'unverified' | 'rejected';
  /** Why it did not reach verified. One reason per record, in plain words. */
  reason: string;
  flags: string[];
}

export const CATEGORIES: Category[] = [
  'Compute & Infrastructure',
  'Research & Academia',
  'Companies & Applied AI',
  'Public Sector & Policy',
  'Capital & Accelerators',
  'Talent & Education',
  'Community & Convening',
];

export const REGIONS: Region[] = [
  'Metro Vancouver',
  'Fraser Valley',
  'Vancouver Island & Coast',
  'Thompson-Okanagan',
  'Kootenay',
  'Cariboo',
  'North Coast & Nechako',
  'Northeast',
  'Province-wide',
];

/** Category colours as CSS custom properties so they adapt to light/dark. */
export const CATEGORY_COLORS: Record<Category, string> = {
  'Compute & Infrastructure': 'var(--cat-infra)',
  'Research & Academia': 'var(--cat-research)',
  'Companies & Applied AI': 'var(--cat-company)',
  'Public Sector & Policy': 'var(--cat-public)',
  'Capital & Accelerators': 'var(--cat-capital)',
  'Talent & Education': 'var(--cat-talent)',
  'Community & Convening': 'var(--cat-community)',
};

export const ORG_TYPE_LABELS: Record<OrgType, string> = {
  company: 'Company',
  'university-or-lab': 'University / Lab',
  'government-or-crown': 'Government / Crown',
  'investor-or-program': 'Investor / Program',
  'nonprofit-or-association': 'Non-profit / Association',
  'community-group': 'Community group',
  'infrastructure-operator': 'Infrastructure operator',
};

export const ORGANIZATIONS: Organization[] = [ /* ... */ ];

/** Records that pin on the map. The rest appear in the directory only. */
export const MAPPED = ORGANIZATIONS.filter((o) => o.lat !== undefined);
```

### 1.1 What was deliberately *not* added

| Rejected field | Why |
|---|---|
| `keyPeople` | Publishing named individuals scraped from an unsourced database is a privacy problem before it is an accuracy one. **CONFIRMED** from AUDIT.md §2.5: 20 of 255 predecessor values name no person at all. BC AI Compass publishes organizations, not people. |
| `email` | Same. Republishing scraped contact addresses invites spam directed at third parties who never consented. |
| `funding` | **CONFIRMED** from AUDIT.md §2.4: 230 of 480 predecessor values are drawn from a pool of 26 round numbers. Funding is the single field most likely to be wrong, most likely to be quoted, and least verifiable from a primary source in one read. Out of scope, permanently. |
| `yearFounded` | **CONFIRMED**: 105 predecessor rows share 2018. A founding year is cheap to get wrong and adds nothing a user acts on. Out of scope for v1. |
| `capabilities` | No province-wide AI analogue. See AUDIT.md §7.4. |
| `indigenousLed` | Being Indigenous-led is a self-identification, not an attribute for an outside project to assign. Where an organization states it on its own site, it appears in that record's sourced `description`, in the organization's own framing. Never inferred, never a checkbox someone else ticks. |

### 1.2 Field-level enforcement, not just intent

Three checks run in the build, so the schema's promises are mechanical:

1. `lat`/`lng` present implies `geoSourceUrl` present. **A coordinate without a
   source fails the build.**
2. `id` unique across `ORGANIZATIONS`.
3. Every `Category` in `CATEGORIES` appears at least once in the data, and every
   category value in the data appears in `CATEGORIES`. A category with no members is
   a category that was assumed rather than found.

`status: 'verified'` as a literal type means check 4 — no unverified record ships —
is enforced by `tsc`, not by a script.

---

## 2. TAXONOMY

**Default taken.** Collapse the raw labels to **seven** categories, derived from what
the verified data contains rather than from the raw labels.

### 2.1 The finding that decided the shape

**CONFIRMED** from [AUDIT.md](AUDIT.md) §5: artifact A carries 70 distinct category
labels, artifact C carries 84, and 15 of C's labels are new synonyms for categories A
already had. Between the two dumps the label count rose by 14 and not one synonym was
collapsed.

**And not one of those 85 labels describes AI compute infrastructure.**

That is not a small gap. In 2026 the largest AI development in British Columbia by
capital deployed is data centre and compute buildout — Kamloops, Merritt, Vancouver
(see [GAPS.md](GAPS.md)). A taxonomy inherited from the raw labels would have no word
for it. **This is the concrete proof that the taxonomy has to be derived from the
verified data, not mapped from the old labels.** `Compute & Infrastructure` is
category one because the data demanded it and the old labels could not see it.

### 2.2 The seven categories

| Category | What it holds | Test for membership |
|---|---|---|
| **Compute & Infrastructure** | AI data centres, sovereign AI compute, GPU capacity, and the power allocation that enables them | Does the organization build or operate physical capacity that AI workloads run on? |
| **Research & Academia** | University labs, institutes, research centres, research groups | Is producing research its primary output? |
| **Companies & Applied AI** | Companies building AI, or applying AI as a core part of what they sell | Does it sell a product or service in which AI is material? |
| **Public Sector & Policy** | Ministries, Crown corporations, agencies, regulators, public programs, policy and advocacy bodies | Is it part of, or does it exist to influence, the public sector? |
| **Capital & Accelerators** | Investors, funds, accelerators, incubators, innovation hubs, grant programs | Does it supply capital or structured program support to others? |
| **Talent & Education** | Training providers, bootcamps, skills programs, teaching-focused institutions | Is training people its primary output? |
| **Community & Convening** | Meetups, associations, conferences, grassroots groups, sector media | Does it exist to bring the ecosystem together? |

`Research & Academia` vs `Talent & Education` splits on output: a university lab
producing papers is research; a college diploma program producing graduates is
education. A university that does both is filed by the specific unit being listed,
which is why `UBC` and `PLAI (Pacific Laboratory for Artificial Intelligence)` are
separate records rather than one — a distinction the predecessor's containment
collisions (AUDIT.md §3.4) were groping toward.

### 2.3 Complete mapping table — all 85 raw labels, none omitted

**How to read the Target column.** The target is a **prior, not a verdict.** Per §6,
category is assigned from content read on the organization's own site. Where read
content disagrees with the prior, read content wins and the disagreement is noted in
the record's verification log. `discard` means the label carries no information worth
using as a prior — the record still gets a category if it verifies, assigned wholly
from read content.

Rows 1–70 are artifact A's labels with their row counts. Rows 71–85 are labels
present only in artifact C. **CONFIRMED** — both sets enumerated by
`Analyze-ArtifactA.ps1 -Section categories` and `Analyze-ArtifactsBC.ps1`.

| # | Raw label | Rows in A | Target |
|---:|---|---:|---|
| — | *(no category)* | 549 | **assign on verification** |
| 1 | Start-ups & Scale-ups | 224 | Companies & Applied AI |
| 2 | AI Companies | 112 | Companies & Applied AI |
| 3 | Healthcare & Biotech | 46 | Companies & Applied AI |
| 4 | Technology Companies | 42 | Companies & Applied AI |
| 5 | Company | 31 | Companies & Applied AI |
| 6 | Enterprise / Corporate Divisions | 29 | Companies & Applied AI |
| 7 | Fintech | 28 | Companies & Applied AI |
| 8 | Academic & Research Labs | 26 | Research & Academia |
| 9 | Service Studios / Agencies | 25 | Companies & Applied AI |
| 10 | Media Tech | 24 | Companies & Applied AI |
| 11 | CleanTech | 22 | Companies & Applied AI |
| 12 | Industry Association | 21 | Community & Convening |
| 13 | Robotics | 20 | Companies & Applied AI |
| 14 | Cybersecurity | 18 | Companies & Applied AI |
| 15 | Grassroots Communities | 16 | Community & Convening |
| 16 | Government | 13 | Public Sector & Policy |
| 17 | Community | 11 | Community & Convening |
| 18 | Innovation Centres & Hubs | 10 | Capital & Accelerators |
| 19 | Academic | 9 | Research & Academia |
| 20 | EdTech | 9 | Companies & Applied AI |
| 21 | Industry Conferences & Events | 8 | Community & Convening |
| 22 | Investor | 8 | Capital & Accelerators |
| 23 | Accelerators / Incubators | 7 | Capital & Accelerators |
| 24 | Education & Training Providers | 7 | Talent & Education |
| 25 | Government & Public Sector | 6 | Public Sector & Policy |
| 26 | Investors & Funds | 5 | Capital & Accelerators |
| 27 | AgTech | 4 | Companies & Applied AI |
| 28 | Game Development Studio | 4 | Companies & Applied AI |
| 29 | Non-Profit | 4 | **discard** — a tax status, not a category |
| 30 | Healthcare AI | 3 | Companies & Applied AI |
| 31 | Indigenous Tech & Creative Orgs | 3 | **assign on verification** — see §1.1 |
| 32 | Mining | 3 | Companies & Applied AI |
| 33 | Port Terminal | 3 | **assign on verification** — scope test, see §2.4 |
| 34 | PropTech Startup | 3 | Companies & Applied AI |
| 35 | Social-Impact & Climate-Tech Hubs | 3 | Capital & Accelerators |
| 36 | Academic Research Lab | 2 | Research & Academia |
| 37 | Advocacy & Policy Groups | 2 | Public Sector & Policy |
| 38 | AI Startup | 2 | Companies & Applied AI |
| 39 | Digital Therapeutics | 2 | Companies & Applied AI |
| 40 | Marketing Tech | 2 | Companies & Applied AI |
| 41 | Media & Storytellers | 2 | Community & Convening |
| 42 | Open-Source Projects | 2 | **discard** — a project is not an organization |
| 43 | Service Providers | 2 | Companies & Applied AI |
| 44 | 3PL Company | 1 | Companies & Applied AI |
| 45 | AgTech Company | 1 | Companies & Applied AI |
| 46 | AI Research Organization | 1 | Research & Academia |
| 47 | Construction Tech Startup | 1 | Companies & Applied AI |
| 48 | Consulting & Services | 1 | Companies & Applied AI |
| 49 | Corporate Partnership | 1 | **discard** — a relationship, not an organization |
| 50 | Crypto Unicorn | 1 | **discard** — unsourced editorial verdict |
| 51 | Deep-water Terminal | 1 | **assign on verification** — scope test |
| 52 | Developer Community | 1 | Community & Convening |
| 53 | E-commerce | 1 | Companies & Applied AI |
| 54 | Game Development Services | 1 | Companies & Applied AI |
| 55 | Government Agency | 1 | Public Sector & Policy |
| 56 | Industry-Healthcare Partnership | 1 | **discard** — a relationship, not an organization |
| 57 | Innovation Consortium | 1 | Capital & Accelerators |
| 58 | Innovation Lab | 1 | Research & Academia |
| 59 | Investment Fund | 1 | Capital & Accelerators |
| 60 | Legal Tech Leader | 1 | Companies & Applied AI — "Leader" stripped as editorial |
| 61 | Logistics Tech | 1 | Companies & Applied AI |
| 62 | Port Development | 1 | **assign on verification** — scope test |
| 63 | Research Institute | 1 | Research & Academia |
| 64 | Smart Logistics Services | 1 | Companies & Applied AI |
| 65 | Training Program | 1 | Talent & Education |
| 66 | Unicorn | 1 | **discard** — unsourced editorial verdict |
| 67 | User Group | 1 | Community & Convening |
| 68 | VR/AR | 1 | Companies & Applied AI |
| 69 | Web3 Startup | 1 | Companies & Applied AI |
| 70 | Wildfire Tech | 1 | Companies & Applied AI |
| 71 | Academic Lab *(C only)* | — | Research & Academia |
| 72 | Accelerator *(C only)* | — | Capital & Accelerators |
| 73 | AI Community Organization *(C only)* | — | Community & Convening |
| 74 | Annual Conference *(C only)* | — | Community & Convening |
| 75 | Bioprinting AI *(C only)* | — | Companies & Applied AI |
| 76 | Business Services *(C only)* | — | Companies & Applied AI |
| 77 | Developer Tools AI *(C only)* | — | Companies & Applied AI |
| 78 | EdTech AI *(C only)* | — | Companies & Applied AI |
| 79 | Government Program *(C only)* | — | Public Sector & Policy |
| 80 | HealthTech AI *(C only)* | — | Companies & Applied AI |
| 81 | Innovation Center *(C only)* | — | Capital & Accelerators |
| 82 | Innovation Hub *(C only)* | — | Capital & Accelerators |
| 83 | Nonprofit *(C only)* | — | **discard** — a tax status, not a category |
| 84 | Regulatory Initiative *(C only)* | — | Public Sector & Policy |
| 85 | Venture Capital *(C only)* | — | Capital & Accelerators |

**Totals: 85 raw labels mapped. 6 discard. 6 assign-on-verification (plus the 549
uncategorized rows). 73 map to a prior. 0 map to `Compute & Infrastructure` — every
member of that category comes from [GAPS.md](GAPS.md).**

### 2.4 The scope test the old labels needed and did not have

`Port Terminal`, `Deep-water Terminal` and `Port Development` (5 rows) illustrate a
class the predecessor had no way to reject. **INFERRED** from AUDIT.md §2.6.4: a
report mentioning AI at BC ports appears to have caused the port terminals themselves
to be ingested as AI organizations.

The test, applied at verification: **is there a sourced statement that this
organization does, builds, funds, teaches, convenes or hosts AI work in British
Columbia?** A container terminal that has been *written about* in an AI context does
not pass. A terminal that publishes its own AI operations program does. The
distinction is the sourced statement, and it is recorded per record.

---

## 3. MAP SCALE

**Default taken.** Province-wide. Fit bounds to the data rather than hardcoding a
centre. Add marker clustering.

**CONFIRMED** from AUDIT.md §7.5: builderworkshop hardcodes
`center={[49.26, -123.11]} zoom={11}` at `AssetMap.tsx:294` — downtown Vancouver at
city zoom — and hardcodes `map.flyTo([lat, lng], 16)` in `FlyTo`. Neither survives.

| Change | From (bws) | To (BC AI Compass) |
|---|---|---|
| Initial view | `center=[49.26,-123.11] zoom=11` | No `center`/`zoom` prop. `FitBounds` computes `L.latLngBounds` over all mapped records on mount, with a BC-wide fallback if the dataset has fewer than two points. |
| Row click | `flyTo(point, 16)` — street zoom | `flyTo(point, 12)` — municipal zoom, honest about coordinates that are city-level rather than door-level |
| Density | 46 unclustered markers | Grid clustering, see below |
| Filters | Category pills + capability chips | Category pills + **region pills**. The capability row is removed, not left empty. |

### 3.1 Clustering without a new dependency

**Decision: hand-rolled grid clusterer. No new runtime dependency.** Recorded here
per the dependency constraint.

The obvious choice is `leaflet.markercluster` plus `react-leaflet-cluster`. Rejected
for three reasons, in order of weight:

1. **Peer-dependency risk against the pinned stack.** `react-leaflet` v5 with React
   19 is recent; the community cluster wrapper has historically lagged react-leaflet
   major versions. Gate 4 requires `npm install` and `npm run build` to succeed from a
   clean `node_modules`. Introducing a wrapper whose peer range may not admit React 19
   puts the project's hardest gate at the mercy of a third party.
2. **The dataset is small and bounded.** A few hundred points, all in one province,
   re-clustered only on zoom or filter change. `leaflet.markercluster` is engineered
   for tens of thousands of points; its spiderfy, animation and chunked-loading
   machinery is cost without benefit here.
3. **The dependency surface is a stated project value.** The site's claim is that it
   is checkable. Every dependency is something a reader has to trust. Holding the
   surface at exactly bws-reference's set plus `esbuild` is worth ~60 lines.

**The algorithm.** On each render, project every mapped record to container pixels via
`map.latLngToContainerPoint`, bucket by a fixed pixel grid (56px), and render one
marker per bucket: a single record's category-coloured dot when the bucket holds one,
a count badge when it holds more. Clicking a badge calls `map.flyToBounds` on that
bucket's records. Recomputed on `moveend` and `zoomend`. Grid size in pixels rather
than degrees means cluster density is constant on screen at every zoom, which is the
property that actually matters and the one degree-based grids get wrong at BC's
latitude span.

**Consequence, stated because it is the whole point:** Metro Vancouver collapses to
one badge at province zoom, so Kamloops, Merritt, Prince George, Kelowna, Victoria
and the Comox Valley each remain a visible, clickable pin instead of being
invisible next to a Lower Mainland blob.

### 3.2 Records without coordinates

Kept exactly as builderworkshop does it — **CONFIRMED** as the one part of the pattern
that survives the scale change untouched (AUDIT.md §7.5). `MAPPED` filters on
`lat !== undefined`; the complement appears in the directory with an explicit
"no fixed location on file" note rather than being silently dropped or given a
guessed pin.

---

## 4. PATHWAYS REPLACEMENT — Regional clusters

**Default taken.** Replace the walking-route section with regional clusters: BC's AI
activity grouped by region, each with a short editorial note on what that region
actually has.

**CONFIRMED** from `bws-reference\src\sections\Pathways.tsx`: the section renders
`PATHWAYS` as ordered walking routes with a `Polyline` drawn between stops and a
"See it on the map" button that dispatches `bw:trail`. Its content is the Strathcona
Maker Mile — a set of venues within walking distance of each other. **This does not
translate to a province.** Prince George to Vancouver is not a route; it is a
nine-hour drive. The `Polyline`, the `bw:trail` event, the `TrailFit` component and
the ordered-stops model are all removed.

What replaces it, in `src\sections\Regions.tsx`:

- One card per region that has at least one verified record. **Regions with zero
  verified records are not rendered** — an empty region card is an assertion that a
  region has nothing, which is a claim this project cannot source.
- Each card carries: the region name, the count of verified organizations, the
  category mix within the region, and **a short editorial note**.
- Clicking a card sets the map's region filter and scrolls to the map — the same
  interaction the trail button had, pointed at something that makes sense at scale.

**The editorial notes are the one place on this site where prose is not a sourced
claim about a specific organization, so the rule for them is explicit:** each note
describes only what the verified records in that region show, and says so. "Kamloops
and Merritt carry the province's new AI compute buildout — three of the four records
here are data centre projects" is a statement about the dataset, checkable against
it. "Kamloops is emerging as BC's AI hub" is a claim about the world, and will not
appear.

The **Orbit** concept — records with no fixed venue — is kept from the original,
because it solves a real problem the province-wide dataset also has: province-wide
bodies with no single seat. They surface under `Region: 'Province-wide'`.

---

## 5. VERIFIED CORE

**Default taken.** The site publishes **only** `status: 'verified'` records. Minimum
**100** verified organizations before ship. Everything else stays in
`research\unverified.json`, which is not published and not built into the site.

Mechanics:

| Rule | Enforcement |
|---|---|
| Only verified records ship | `status: 'verified'` is a **literal type** on `Organization`. An unverified record in `ORGANIZATIONS` fails `tsc`. |
| ≥ 100 verified before ship | Counted in [VERIFICATION.md](VERIFICATION.md) and asserted by the export script, which exits non-zero below 100. |
| Unverified data never reaches the bundle | `research\unverified.json` sits outside `src\`. Nothing in `src\` imports from `research\`. Checked by grep in the verify pass. |
| No artifact-A values in `src\` | The exit condition greps `src\` for any funding, description, keyPeople or focus-area value traceable to artifact A. |

**Why a hard floor of 100 and not "as many as possible".** A directory of 40
organizations is not a map of a province; it is a list of the usual names, which is
the failure the predecessor README complains about. 100 with sources beats 839 without
— and 839 without is precisely what already exists and does not work.

---

## 6. VERIFICATION PROTOCOL

**Default taken**, written out in full so it can be re-run in six months by someone
who was not here.

### 6.1 The four conditions

A record reaches `status: 'verified'` when **all four** hold:

1. **The website resolves and is live.** Not "the domain exists" — the page loads and
   is the organization's own site, not a parked page, a registrar holding page, a
   domain-for-sale listing, or an unrelated site that acquired the domain.
2. **BC presence is confirmed from the site itself or a primary source.** A BC
   address, a BC office named on a locations/contact page, a BC incorporation, or a
   government/institutional page stating BC operation. **A BC-sounding name is not
   evidence.** Neither is a `.ca` domain.
3. **Category and orgType are assigned from content actually read**, not from the
   name, the domain, the raw label, or the sector the organization sounds like.
4. **`sourceUrl` and `sourceDate` are recorded** — the specific URL read, not the
   domain root, and the date it was read.

### 6.2 Rejection conditions

A record is `rejected` — not left `unverified` — when checking produces a positive
finding against it:

| Finding | Example from the established record |
|---|---|
| Not in British Columbia | Grammarly, SandboxAQ, Thales, BrainBox AI (Montreal), Flash Forest (Ontario) — **CONFIRMED** out of scope |
| Defunct, or no longer an independent BC entity | mCloud Technologies (Nasdaq delisting Sept 2023); Coho Data; Canalyst — **CONFIRMED** |
| Materially changed such that the record would mislead | Nexii Building Solutions: CCAA creditor protection Jan 2024, assets acquired by 3 Gates, relaunched as Nexii Inc. with Dallas HQ and Squamish manufacturing — **CONFIRMED**. A record reading "Nexii Building Solutions, Vancouver" is wrong in a way that matters. |
| Not an organization | The 262 report fragments of AUDIT.md §2.6.4 |
| No sourced AI connection to BC | The port-terminal scope test, §2.4 |

`unverified` is reserved for "could not be checked" — not for "checked and failed."
The distinction is recorded per record in `research\unverified.json`, because a
future re-verification pass should retry the unreachable and not re-litigate the
rejected.

### 6.3 Order of work — by significance, not alphabetically

**Default taken.** Priority order, and the reasoning for it:

1. **Compute & Infrastructure, and public institutions.** Highest capital, longest
   commitment, most durable, best-sourced (government releases, regulatory filings,
   utility processes), and the category the predecessor taxonomy could not see at all.
2. **Research labs and universities.** Stable, institutionally sourced, and the part
   of the ecosystem most consistently flattened into "Vancouver tech".
3. **Companies, ordered by evidence of current activity** — not by size, not by
   alphabet. A company with a 2026 announcement outranks one whose newest signal is
   the 2025 scrape.
4. **Community organizations.** Highest churn, most likely to be stale, and cheapest
   to re-verify later. Last, deliberately.

### 6.4 The re-run procedure, step by step

For each name on the seed list, in priority order:

1. Resolve the organization's own site. If the seed URL is a LinkedIn or Meetup page
   (AUDIT.md §2.2), or its shape is name-derived (§2.3), **treat it as a hint and find
   the real site independently.** Do not accept the seed URL as the answer to a
   question it was never asked.
2. Read the site's about / locations / contact pages. Record the specific URL read.
3. Apply the four conditions of §6.1. Any failure → `research\unverified.json` with
   the reason in plain words.
4. Assign `category` and `orgType` from read content. Where the assignment disagrees
   with the raw label prior of §2.3, note the disagreement.
5. Assign `region` from the sourced address, using §1's `Region` union. No address →
   `Province-wide` only if the organization has a genuinely provincial mandate;
   otherwise the record is `unverified` for want of a location.
6. Write `description` from what the source says, in one or two sentences, or leave it
   `null`. **A null description is a correct answer.**
7. Record `size` only if a source states a headcount. Otherwise `null`.
8. Record `lat`/`lng` only from a source that states the location, and record that
   source in `geoSourceUrl`. **No geocoding a city name into a centroid and calling
   it an address.** No coordinates is a legitimate published state.
9. Stamp `sourceUrl`, `sourceDate` (YYYY-MM-DD), `verified` (YYYY-MM),
   `status: 'verified'`.

### 6.5 Re-verification cadence

Oldest `verified` stamps first. Quarterly for `Companies & Applied AI` and
`Community & Convening` (highest churn); annually for `Compute & Infrastructure`,
`Research & Academia` and `Public Sector & Policy` (lowest). The full procedure and
the exact PowerShell to list the stalest records is in [SHIP.md](SHIP.md).

---

## 7. Decisions taken by default — Martin can override

Every item below was decided without asking, per the brief. Each names what changes if
Martin decides otherwise.

| # | Decision | Rationale | If overridden |
|---:|---|---|---|
| 1 | **Schema** extends `Asset` with `region`, `orgType`, `size`, `sourceUrl`, `sourceDate`, `verified`, `status` (§1) | AUDIT.md §7 — the original type cannot express region, size or provenance | Dropping `sourceUrl` unpicks the project's whole premise; the rest are additive |
| 2 | **Seven categories**, derived from verified content (§2.2) | 85 raw labels, 0 of which name compute infrastructure (§2.1) | Category set lives in one union type; changing it is a mechanical edit plus a re-file of affected records |
| 3 | **Region taxonomy = BC Stats development regions, with Mainland/Southwest split** into Metro Vancouver and Fraser Valley | The split is the point of a province-wide map; the rest are citable official boundaries | Merging them back is a one-line union change and a find-replace |
| 4 | **Map fits bounds to data; no hardcoded centre; grid clustering** (§3) | `center=[49.26,-123.11] zoom=11` puts Prince George off-screen | — |
| 5 | **Clustering is hand-rolled; no new runtime dependency** (§3.1) | Peer-dependency risk against React 19 / react-leaflet 5 threatens Gate 4 | Swapping in `react-leaflet-cluster` is contained to one component |
| 6 | **Pathways replaced by regional clusters**; Polyline, `bw:trail` and ordered stops removed (§4) | A province is not a walking route | — |
| 7 | **Only `status: 'verified'` publishes; floor of 100** (§5) | 839 unsourced records already exist and do not work | Lowering the floor is a number in one assertion; raising it is more verification work |
| 8 | **Verification protocol as written** (§6) | Re-runnable by someone who was not here | — |
| 9 | **`keyPeople` and `email` are not published at all** (§1.1) | Privacy and spam liability for third parties who never consented; 20 of 255 predecessor values name no person | Adding them back needs a consent position, not just a schema field |
| 10 | **`funding` and `yearFounded` are out of scope** (§1.1) | 230 of 480 funding values from a pool of 26 round numbers; 105 rows share founding year 2018 | Could be added later *with* per-field sources; never carried forward from artifact A |
| 11 | **Artifact A supplies names only.** Every published field independently sourced (see "Open questions" #1) | No LICENSE file in the ecomap reference; `package.json` declares ISC, which speaks to code, not to Notion data that is not in the repo | Resolved by construction — a more permissive licence finding would not change the approach, because AUDIT.md §6 concludes only the names were worth taking anyway |
| 12 | **Branding: BC AI Compass, bc-aicompass.ca.** No BC + AI marks, no implied endorsement, no claim of affiliation (see "Open questions" #2) | Nothing in any file read states any relationship with BC + AI, Kris Krüg, the Internet Archive, TELUS, Bell, BC Hydro or any other organization. An offered conversation is not a partnership. | A stated, written partnership would change the footer, the method statement and the about copy — and nothing else |
| 13 | **Stack: Vite + React static**, matching bws-reference (see "Open questions" #3) | The brief pins the dependency surface; a static build is the cheapest thing to host and the easiest to verify | See #3 below for the porting cost |
| 14 | **`esbuild` declared explicitly in `devDependencies`; `package-lock.json` committed; `export-data.mjs` fails loudly** | AUDIT.md §8 — bws-reference imports esbuild without declaring it and resolves only via npm's flat hoisting | — |
| 15 | **Brand accent: Pacific cyan-teal**, not builderworkshop's flag red | A different project should not wear another project's brand. Teal reads as coastal/Pacific rather than national, distinguishes BC AI Compass from builderworkshop at a glance, and holds AA contrast on both schemes. Full binding in [DESIGN.md](DESIGN.md). | One `ref` token pair in `index.css` |
| 16 | **Data licence: CC BY 4.0, crediting bc-aicompass.ca. Code: MIT.** | Matches the openness the dataset's absence in the predecessor made painful; stated explicitly in README.md | — |
| 17 | **All 1,399 artifact-A rows enter `seed.json`, including the 262 known non-entities**, flagged rather than deleted | Silent deletion is how the predecessor's 175 filtered rows became invisible. Attrition is documented per stage in `seed-summary.md`. | — |

### 7.1 A constraint that could not be met as specified, stated plainly

The brief fixes the `seed.json` `flags` array to a closed set: `section-heading,
markdown-artifact, unmerged-duplicate, linkedin-as-website, duplicate-name,
duplicate-domain, non-bc-suspected, defunct-suspected, person-not-org,
product-not-org, no-url`.

**That set has no flag for the largest defect class in artifact A** — the 262 rows
that are lines from a markdown report rather than entities (AUDIT.md §2.6.4).
`person-not-org` and `product-not-org` are the nearest, and both are wrong: a row
named `Headquarters:` is neither a person nor a product.

**The closed set is honored exactly as specified.** Those rows carry `no-url`, which
is true, and nothing else — so `seed.json` conforms. The consequence is that
`seed.json` alone understates the damage by design, and the fragment count is
therefore carried in `seed-summary.md` as an explicit filter stage with its own count
and examples. Flagged here so the gap is a recorded decision rather than a silent
loss. **Recommendation for a future revision: add `not-an-entity` to the set.**

---

## 8. Open questions for Martin — recorded, not blocking

### 8.1 Data licensing

**How it stands.** The ecomap reference has **no LICENSE file anywhere** —
**CONFIRMED** by `Get-ChildItem -Recurse -Filter "LICENSE*"` across the whole clone,
which returns nothing. Its `package.json` declares `"license": "ISC"` (package name
`ecosystem-map-bc-ai`), which is a statement about code.
The Notion data is not in the repository at all, so ISC does not reach it, and no
licence anywhere covers it.

**How it was resolved, by construction rather than by waiting.** Artifact A is used
**only as a list of organization names to go and check**. Every field that ships is
independently sourced and carries its own `sourceUrl`. Nothing is copied forward as a
published value. An organization's name is a bare fact, not a creative work, and the
list is used as a research index rather than republished as a dataset.

**Why the answer would not change even if the licence were permissive.** AUDIT.md §6
concludes independently, on data-quality grounds alone, that exactly one field —
the name — was worth taking. A permissive licence would grant rights to values that
are 230-of-480 generated, 176-of-403 shape-indistinguishable from generated, and
sourced on 6% of rows. **The licensing question and the quality question have the same
answer, arrived at separately.** That is why this is recorded rather than blocking.

**What Martin might still want to decide:** whether to contact the ecomap maintainer
before or after launch. Nothing in the approach requires it. It may be the decent
thing to do, and it is his call, not this plan's.

### 8.2 Independence relative to BC + AI

**How it stands.** **CONFIRMED by direct fetch of <https://bc-ai.ca> on 2026-08-19**,
not taken on trust from the brief: the site is operated by the **BC + AI Ecosystem
Association**, described on the page as a non-profit with "300+ paying members".
Top-level navigation, verbatim: **Events · Communities · Certifications · Resources ·
Join us / Sign in**. Offerings include events (94+ since 2023), memberships,
certifications ("AI Animation Accelerator", "Responsible AI Professional", "AI
Upgrade"), the **AI Builders Fellowship**, and the **Futureproof Festival**
(28–30 October 2026, H.R. MacMillan Space Centre). **There is no map and no
organization directory in the navigation or on the page** — it references "33 active
BC regions" and maintains community pages such as Vancouver AI, and its Resources
link to affiliated networks rather than to a directory. The established finding is
confirmed as stated.

**CONFIRMED** from `ecomap-reference\README.md` and `llms.txt`: that repository is
authored by Kris Krüg, credits BC + AI, and ships its own Next.js front end in `ui/`.
**CONFIRMED** from `ecomap-reference\README.md:25`: "there's no hosted version yet."
So the ecosystem map has never been published anywhere, by anyone.

### 8.2.1 CORRECTED 2026-08-19 — the original default was factually wrong

The original text of this section read: *"Nothing in any file read during this work
states any relationship between Martin Montero and BC + AI… For the purposes of this
project, none exists. **Default taken:** BC AI Compass is independent."*

**That was false, and it shipped.** The line
*"BC AI Compass is independent. It is not affiliated with, endorsed by, or produced
for any organization listed in it"* was written into `public\ecosystem.json`,
`README.md`, the site footer and the Method section.

**The actual position: Kris Krüg, Executive Director of the BC + AI Ecosystem
Association, asked Martin Montero to build BC AI Compass for BC + AI in partnership
with them, as Martin's contribution, and supplied the `bc-ai--ecosystem-map`
repository for that purpose.** BC + AI is listed in the directory. Publishing the old
line meant publicly denying the arrangement with the organization that commissioned
the project.

**Why the error happened, because the mechanism matters more than the correction.**
The plan reasoned from file evidence alone and then converted an absence of evidence
into a positive claim of independence. That is the same move as inferring a founding
year from a domain name: **treating "the sources do not say" as if it were "the
sources say no."** The audit was built to catch that error pointing one way and
committed it pointing the other.

**The accurate framing, now used everywhere:**

> BC AI Compass is a BC + AI Ecosystem Association project, built by Martin Montero.

**And the limit on it, stated just as plainly.** No other partnership, endorsement or
affiliation is asserted or implied. The Internet Archive, TELUS, Bell, BC Hydro, every
university and every listed company are **not** partners, funders or endorsers of this
project. No listing is paid for or sponsored.

**What does not change.** Not the schema, not the verification protocol, not one
record. The dataset's credibility comes from its sources, not from whose name is on
it — so a commissioning relationship changes the byline and nothing else. **A
partnership is not a shortcut to verification, and the one record it does touch — BC +
AI's own — is held to exactly the same evidence bar as every other.**

### 8.3 Vite/React static versus Next.js, and the porting cost

**How it stands.** The brief pins the surface: React 19, TypeScript, Vite 7, Tailwind
3.4, Leaflet + React-Leaflet, OSM tiles.

Two separate Next.js facts, kept separate because conflating them would be sloppy:

- **CONFIRMED** from `ecomap-reference\llms.txt` and `README.md`: *the ecosystem-map
  repository* ships a Next.js front end in `ui/`. That front end has never been
  hosted.
- **`bc-ai.ca` running Next.js** is asserted in the brief and is **not something this
  work verified** — the fetch of bc-ai.ca confirmed its ownership, navigation and
  offerings, not its framework. Labelled **UNKNOWN** here. It does not affect the
  decision: the porting cost below is the same for any React-based SSR framework, and
  the data layer is framework-agnostic either way.

**Default taken:** Vite + React static, matching bws-reference. It builds to `dist\`,
hosts on Cloudflare Pages with no server, and is the easiest thing for a sceptical
reader to verify end to end.

**The porting cost, honestly.** If BC AI Compass ever folds into a Next.js site:

| Ports with no change | Needs work |
|---|---|
| `src\data\organizations.ts` — plain TypeScript data, zero framework coupling | The Leaflet map must be dynamically imported with `ssr: false`, or it breaks the server render — Leaflet touches `window` at module scope |
| The token-based CSS system in `index.css` — plain CSS custom properties | The pre-paint theme script in `index.html` becomes a Next.js `<Script strategy="beforeInteractive">` or an inline script in the document head |
| `scripts\export-data.mjs` — a standalone Node script | Vite's `import.meta` / `base: './'` assumptions become Next's asset pipeline |
| Every component's markup and Tailwind classes | The scroll-reveal `IntersectionObserver` in `App.tsx` needs a `'use client'` boundary |
| The verification protocol, the schema, the taxonomy, the sources | Routing: one page with hash anchors becomes either one page or real routes — a decision, not a cost |

**Estimate: the data and the method port for free; the shell is roughly a day.** The
expensive asset is `organizations.ts` and the protocol behind it, and neither is
coupled to Vite. **That is the point of keeping the data in a plain typed array
instead of a framework-specific loader** — and it is the strongest argument for
starting static rather than starting on Next.js speculatively.

---

## 9. Gate 2 checklist

| Requirement | Status |
|---|---|
| `research\PLAN.md` exists | done |
| Full TypeScript type, not a fragment | §1 — complete `Organization`, `UnverifiedLead`, all unions, all constant tables |
| Complete taxonomy mapping table, every raw label, none omitted, including `discard` | §2.3 — 85 labels: 73 mapped, 6 discard, 6 assign-on-verification, plus the 549 uncategorized |
| Defaults taken on all six numbered items | §§1–6, recorded in §7 |
| Decisions recorded under "Decisions taken by default" | §7 — 17 items |
| Open questions recorded without blocking | §8 — licensing, independence, stack |
| Every claim labelled CONFIRMED / INFERRED / UNKNOWN | throughout |
