# Contributing to BC AI Compass

**Send a source, not a name.**

Missing organizations are the expected state of this dataset, not a failure of it.
There are certainly BC AI organizations not listed here. What this project cannot
absorb is an unsourced name — that is precisely how the dataset this one replaced
reached 1,399 rows with no way to tell which were real.

So the bar is one link that proves the thing you are telling us. That is it.

---

## The fastest way

Email **hello@bc-aicompass.ca**, or open a pull request against
`src/data/organizations.ts`.

Either is fine. A one-line email with a good link is more useful than a pull
request with a missing source.

---

## What a submission needs

### 1. The organization's own website

A live page on a domain it controls.

**Not** a LinkedIn company page, **not** a Meetup group, **not** a Crunchbase or
directory listing. Those are hints — we will follow them — but they are not the
answer. In the source dataset 15 records had a LinkedIn URL in the website field
and 6 had a Meetup URL, and neither tells you whether the organization still
exists.

### 2. A page proving British Columbia presence

An address, a locations page, a contact page, a careers page with a BC office, or a
government or institutional page stating BC operation.

**A BC-sounding name is not evidence. Neither is a `.ca` domain.** One well-known
company in the source data turned out to list Palo Alto as its headquarters on its
own contact page.

### 3. A page showing the AI work is real

Somewhere the organization itself says what AI or machine-learning work it does,
builds, funds, teaches, convenes or hosts.

**Being written about in an AI article is not the same as doing AI.** The source
dataset had swept in container terminals and port authorities, apparently because a
report mentioned AI at BC ports. A terminal that publishes its own AI operations
programme passes; one that was merely mentioned does not.

This bar is applied evenly, including to organizations that are obviously part of
the ecosystem. Several accelerators and one flagship BC biotech are sitting in
[`research/unverified.json`](research/unverified.json) right now purely because no
page we read had them saying "AI" in their own words. If you can supply that page,
they go in.

### 4. For a correction: point at the page

If a record here is wrong, closed, acquired, relocated or renamed, send the page
that shows it. **We would much rather remove a record than carry a wrong one.**

British Columbia tech companies closed 82+ M&A deals in 2025 alone, so ownership
changes are the normal case, not the exception. Corrections are the most valuable
contribution you can make.

---

## If you would rather not be listed

Say so and the record comes off. No argument, no negotiation, no form.

We do not list individuals, and we never publish anyone's email address or phone
number.

---

## Adding a record by pull request

Everything published lives in `src/data/organizations.ts`. Add one object to
`ORGANIZATIONS`:

```ts
{
  ...CITY.kamloops,                       // location, region, lat, lng, geoSourceUrl
  id: 'example-ai',                       // unique slug
  name: 'Example AI',                     // the organization's own name for itself
  category: 'Companies & Applied AI',     // from the Category union
  orgType: 'company',                     // from the OrgType union
  url: 'https://example.ai',              // its own site
  location: 'Kamloops',                   // override CITY's default if you have detail
  description: 'One or two sentences, from what the source actually says.',
  size: null,                             // only if a source states a headcount
  sourceUrl: 'https://example.ai/about',  // the SPECIFIC page you read
  sourceDate: '2026-08-19',               // the day you read it
  verified: '2026-08',                    // YYYY-MM
  status: 'verified',
},
```

### Rules the code enforces for you

- **`status` is the literal type `'verified'`.** An unverified record cannot enter
  this array without `tsc` failing. That is deliberate.
- **Coordinates require `geoSourceUrl`.** The build fails on a coordinate with no
  source. Spreading a `CITY` entry handles this; a hand-written `lat`/`lng` must
  carry its own `geoSourceUrl`.
- **Coordinates must fall inside British Columbia.** The build checks the bounding
  box.
- **`description` and `size` may be `null`, but never `undefined`.** A `null` is a
  real answer and the site renders it as one. Omitting the key is a mistake, not a
  shorthand.
- **`id` must be unique** and **`category` must exist in the `Category` union.**
- Every category in the union must have at least one record. A category with no
  members is a category that was assumed rather than found.

### No new municipality without a sourced coordinate

If your organization is in a city not already in the `CITY` map, add an entry —
with a `geoSourceUrl` pointing at a gazetteer page giving that coordinate. Do not
type coordinates from memory. That is the same failure mode as everything in
[`research/AUDIT.md`](research/AUDIT.md).

### Before you open the PR

```bash
npm run verify:data
npm run build
npm run lint
```

```powershell
powershell -NoProfile -File .\research\audit\Test-ExitConditions.ps1
```

All 17 conditions must pass. The scripts are the review; a human just reads the
source you cited.

---

## What happens to submissions that do not clear the bar

They go into [`research/unverified.json`](research/unverified.json) with the reason
recorded, and they are **not** published. Two states are kept apart, because they
call for different follow-up:

- **`unverified`** — could not be checked, or has not been checked yet. Retry these.
- **`rejected`** — checked, and something was found that rules it out. Do not
  re-litigate these without new evidence.

Nothing is silently deleted. The dataset this replaced lost 175 rows into a
one-line note about "better filtering of system/meta entries", and nobody can now
say what they were.

---

## Code of conduct

Be straightforward and be accurate. Disagreements about a record are settled by
looking at the source, which is why every record has one.
