# DESIGN.md — bcaicompass.ca

Per-project binding for BC AI Compass. This file outranks any general design
manual inside this repository.

The pattern is adapted from builderworkshop.ca. **The architecture is inherited;
the brand is not.** A different project should not wear another project's brand,
so the accent, the type, the category palette and the interaction model are all
re-derived here.

---

## Per-project binding

| Field | Value |
|---|---|
| Brand seed colour | **Pacific teal `#0d7c8a`** (light accent `#0a6472`, dark accent `#34d3e6`) |
| Glass surface allocation | Sticky nav backdrop, scrolled state — the one allocation. A second is unused. |
| Component set delta | **Adds:** map cluster badge, verified stamp, region card, search input. **Omits:** dialog, snackbar, walking-route polyline, ticket-stub card, capability chip. |
| Dependency policy | MIT code, CC BY 4.0 data. No runtime service beyond OpenStreetMap tiles and Google Fonts. No new runtime dependency beyond the builderworkshop set; `esbuild` added to devDependencies only. |
| Merge gates | `research\audit\Test-ExitConditions.ps1` must pass. 17 conditions, machine-checked. |
| Out of scope | Webfont body display faces beyond IBM Plex, FAB, shape-morph libraries, colour derived from user context, WCAG 3.0, marker clustering libraries. |

---

## Decision: one accent, seven dots, two schemes

### Why teal and not red

builderworkshop.ca uses Canada flag red `#d52b1e`. Reusing it would say *this is
the same project*, and it is not. Teal was chosen for three reasons, in order:

1. **It reads Pacific, not national.** This dataset is one province, and the
   editorial argument of the whole site is that British Columbia is not a
   footnote to a national story. A coastal colour states that before any copy does.
2. **It is unmistakably not builderworkshop.** Someone who has seen both sites
   should never wonder which one they are on. Hue is the fastest signal available.
3. **It holds AA on both schemes with one darkening step.** `#0d7c8a` passes on
   the dark surface; `#0a6472` passes on warm paper; `#34d3e6` lifts cleanly on
   near-black. One ref triple covers every use.

### The accent is used sparingly

Teal is the primary action, the brand mark, the eyebrow, the verified stamp, and
the region-filter active state. Nothing else. Everything else is ink and surface.
A directory whose whole claim is restraint about facts should look restrained.

### Category colour is a dot, never a flood

Seven categories get a 6px dot and muted per-scheme text, tuned to AA on each
surface. They differentiate rows and pins without turning a data-dense page into
a rainbow. Category colour never fills a background.

The seven — and note the first one is the brand hue, because
`Compute & Infrastructure` is the category the predecessor taxonomy could not see
and the one this project exists partly to surface:

| Category | Light | Dark |
|---|---|---|
| Compute & Infrastructure | `#0a6472` | `#34d3e6` |
| Research & Academia | `#5b3fa8` | `#a78bfa` |
| Companies & Applied AI | `#a8410c` | `#fb923c` |
| Public Sector & Policy | `#1a5e8a` | `#60a5fa` |
| Capital & Accelerators | `#7a5c00` | `#f0b429` |
| Talent & Education | `#1e7a45` | `#4fd08a` |
| Community & Convening | `#a01e5a` | `#f472b6` |

### Tonal elevation, not shadow

The dark scheme raises surfaces by going *lighter* — `--bg-raise #1c2027` over
`--bg #14171c` — rather than stacking heavier shadows. Light is cool paper
(`#f6f4ef`) with true ink (`#14171c`); dark is cool near-black with off-white.
Both are cool-neutral, where builderworkshop is warm — another deliberate
divergence.

### Typography carries the hierarchy

**One family, three widths.** IBM Plex Sans Condensed 700 for display, IBM Plex
Sans for body, IBM Plex Mono for data labels, counts and stamps.

builderworkshop pairs Anton with IBM Plex. Dropping Anton is a design decision
*and* a dependency decision: one font family means one Google Fonts request, one
`font-src` entry in the CSP, and one thing that can fail to load. The condensed
weight gives the editorial compression Anton was providing without a second
vendor.

---

## Token architecture

`ref` (raw, fixed) → `sys` (semantic, scheme-swapped) → components consume `sys`
only.

- **ref:** `--r-teal`, `--r-teal-deep`, `--r-teal-hi`, `--r-slate`, `--r-paper`,
  `--r-ink`. Fixed brand values, never referenced by a component.
- **sys:** `--bg`, `--bg-raise`, `--bg-sink`, `--ink`, `--ink-soft`,
  `--ink-faint`, `--line`, `--line-strong`, `--brand`, `--brand-ink`,
  `--accent`, `--focus`, `--cat-*`, `--cluster-bg`, `--cluster-ink`,
  `--tile-filter`, `--marker-ring`, `--nav-bg`, `--pulse`, `--hero-glow`,
  `--grid-line`, `--selection-*`. All swap per scheme.
- **Components reference `sys` tokens only, never a raw hex value.**

One deliberate exception, documented so it is not mistaken for a leak: category
dot colours reach components through `CATEGORY_COLORS` in
`src\data\organizations.ts`, whose values are `var(--cat-*)` strings. The data
layer names the token; it does not name the colour.

## Theme mechanics

- **Default:** `prefers-color-scheme`.
- **Toggle:** `data-theme="light|dark"` on `<html>`, persisted to
  `localStorage('bcac-theme')`, set pre-paint by an inline script in
  `index.html` so there is no flash.
- That inline script is the **only** inline script on the site, and its sha256 is
  pinned in `public\_headers`. Change the script and the CSP hash must change with
  it — run `research\audit\Get-CspHash.ps1`, which
  `Test-ExitConditions.ps1` then re-checks automatically.
- `color-scheme: light dark` on `:root`. OSM tiles are natural in light and
  filtered (`grayscale(0.6) brightness(0.82)`) in dark, so the basemap recedes
  and the category dots stay the brightest thing on the map.
- React reads the initial theme with a **lazy `useState` initializer**, not an
  effect. The attribute is already on `<html>` before React mounts, and syncing
  it in an effect causes a cascading render — which React 19's lint rules
  correctly reject.

---

## What the map's design had to change, and why

The reference's map is 46 walkable venues in one city. This one is a province.

| | builderworkshop | BC AI Compass |
|---|---|---|
| Initial view | `center={[49.26,-123.11]} zoom={11}` | `bounds` fitted to the filtered data; a BC-wide fallback only when fewer than two points exist |
| Second filter axis | Equipment capability ("I want to make: laser, CNC…") | **Region** |
| Density handling | None needed | Grid clustering at a fixed 56px cell |
| Route drawing | `Polyline` between ordered stops | Removed — a province is not a walking route |
| Row click | `flyTo(point, 16)` — street zoom | `flyTo(point, 12)` — municipal zoom, honest about municipal coordinates |

**The clustering grid is measured in pixels, not degrees.** Across BC's twelve
degrees of latitude a degree-based grid clusters unevenly — cells are visually
smaller in the north. A pixel grid keeps cluster density constant on screen at
every zoom, which is the property a reader actually perceives.

**Cluster badges are sized by magnitude** (30/36/44/52px). At province zoom Metro
Vancouver becomes one large badge, which is the point: Kamloops, Merritt,
Kelowna, Victoria, Courtenay and Surrey each stay a visible, clickable pin instead
of vanishing under a Lower Mainland blob.

**Clusters whose points share one municipal centroid step in by a fixed amount**
rather than flying to max zoom. Many records here sit on the same city coordinate,
which produces a zero-area bounds; `flyToBounds` on that jumps to street level and
strands the reader. Stepping `+3` zoom levels, capped at 13, keeps the interaction
truthful about the precision of the data.

---

## The verified stamp is a component, and it is the point

```
.stamp — mono, 9.5px, 0.1em tracking, uppercase, 1px accent border
```

It appears on every directory row and in every map popup, and **it is always a
link to the source URL.** Design decisions that follow from that:

- It is bordered, not filled. It reads as a seal, not as a button competing with
  the organization name.
- Hover inverts to solid accent — it must be obvious it is clickable, because a
  stamp nobody clicks is decoration, and decoration is exactly what the
  predecessor dataset's `Researching` status was.
- Its `title` carries the full source URL and the read date, so the claim is
  legible on hover before a click.

## Accessibility notes

- Every category and region colour was checked for AA on its own surface, in both
  schemes.
- Colour is never the only carrier: category and region names are always printed
  as text next to their dot.
- `:focus-visible` is a 2px accent outline with 2px offset, globally.
- The marquee is `aria-hidden` with a screen-reader-only sentence naming the
  regions, because a scrolling list of place names is decoration to a screen
  reader and content to a sighted reader.
- `prefers-reduced-motion` kills the marquee, all reveals and smooth scrolling.
  `?flat=1` is a manual escape hatch for the same.
- The map is wrapped in a labelled `role="region"`, and the whole dataset is
  reachable without the map at all — the directory below it is the same data,
  filterable and searchable, in the DOM.

---

## What does not change from the reference

The scroll-reveal mechanism and its 2-second failsafe, the sticky-nav hide/show,
the token architecture itself, the optional-coordinates model
(`MAPPED = filter(lat !== undefined)`), and the discipline of publishing the whole
dataset as JSON on every build. Those were the good ideas. They are kept.
