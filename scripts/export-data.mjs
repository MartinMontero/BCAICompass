// Generates public/ecosystem.json + public/ecosystem.geojson from
// src/data/organizations.ts, and validates the dataset before writing.
//
// Runs automatically as `prebuild`. Run on its own with:
//   npm run verify:data
//
// NOTE ON esbuild: it is declared explicitly in devDependencies. The project this
// pattern was adapted from imported esbuild here without declaring it anywhere,
// and it resolved only because npm hoists Vite's own copy to the top of
// node_modules. That is not a contract -- it breaks under pnpm, Yarn PnP,
// `npm ci --omit=dev`, or a future Vite that stops depending on esbuild -- and it
// breaks at prebuild, before the type-check, with a bare module-resolution error.
// See research/AUDIT.md section 8.
import { build } from 'esbuild';
import { writeFileSync } from 'node:fs';

const MIN_VERIFIED = 100;

/** Fails the build loudly, naming the cause, instead of dying obscurely. */
function fail(message) {
  console.error('\n  export-data: FAILED\n');
  console.error('  ' + message + '\n');
  process.exit(1);
}

let ORGANIZATIONS, CATEGORIES, CATEGORY_COLORS, REGIONS;
try {
  const result = await build({
    entryPoints: ['src/data/organizations.ts'],
    bundle: true,
    format: 'esm',
    platform: 'node',
    write: false,
  });
  const code = result.outputFiles[0].text;
  ({ ORGANIZATIONS, CATEGORIES, CATEGORY_COLORS, REGIONS } = await import(
    'data:text/javascript;base64,' + Buffer.from(code).toString('base64')
  ));
} catch (err) {
  fail(
    'could not bundle src/data/organizations.ts.\n' +
      '  If the error mentions esbuild, run `npm install` -- esbuild is a declared\n' +
      '  devDependency of this project and must be present.\n\n  ' +
      (err && err.message ? err.message : String(err))
  );
}

// ---------------------------------------------------------------------------
// Validation. Every rule here corresponds to a promise made in README.md or
// research/PLAN.md, so the promise cannot quietly stop being true.
// ---------------------------------------------------------------------------
const problems = [];

if (!Array.isArray(ORGANIZATIONS) || ORGANIZATIONS.length === 0) {
  fail('ORGANIZATIONS is empty or not an array.');
}

if (ORGANIZATIONS.length < MIN_VERIFIED) {
  problems.push(
    `only ${ORGANIZATIONS.length} verified records; the ship floor is ${MIN_VERIFIED} (PLAN.md section 5)`
  );
}

const seenIds = new Set();
for (const o of ORGANIZATIONS) {
  const where = `[${o.id ?? '(no id)'}] ${o.name ?? '(no name)'}`;

  if (!o.id) problems.push(`${where}: missing id`);
  else if (seenIds.has(o.id)) problems.push(`${where}: duplicate id`);
  else seenIds.add(o.id);

  if (o.status !== 'verified') problems.push(`${where}: status is "${o.status}", must be "verified"`);
  if (!o.sourceUrl) problems.push(`${where}: missing sourceUrl`);
  if (!/^https?:\/\//.test(o.sourceUrl ?? '')) problems.push(`${where}: sourceUrl is not an http(s) URL`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(o.sourceDate ?? '')) problems.push(`${where}: sourceDate must be YYYY-MM-DD`);
  if (!/^\d{4}-\d{2}$/.test(o.verified ?? '')) problems.push(`${where}: verified must be YYYY-MM`);
  if (!o.url || !/^https?:\/\//.test(o.url)) problems.push(`${where}: url is not an http(s) URL`);
  if (!CATEGORIES.includes(o.category)) problems.push(`${where}: category "${o.category}" is not in CATEGORIES`);
  if (!REGIONS.includes(o.region)) problems.push(`${where}: region "${o.region}" is not in REGIONS`);
  if (o.description === undefined) problems.push(`${where}: description must be a string or null, not undefined`);
  if (o.size === undefined) problems.push(`${where}: size must be a band or null, not undefined`);

  // evidenceQuote: either a real quote under 15 words, or null WITH the flag that
  // says so. A null quote and no flag is a record quietly pretending to be checked.
  if (o.evidenceQuote === undefined) problems.push(`${where}: evidenceQuote must be a string or null`);
  if (o.evidenceQuote === null && !(o.flags ?? []).includes('quote-pending')) {
    problems.push(`${where}: evidenceQuote is null but the record does not carry the 'quote-pending' flag`);
  }
  if (typeof o.evidenceQuote === 'string') {
    const words = o.evidenceQuote.trim().split(/\s+/).filter(Boolean).length;
    if (words === 0) problems.push(`${where}: evidenceQuote is empty; use null plus 'quote-pending'`);
    if (words >= 15) problems.push(`${where}: evidenceQuote is ${words} words; must be under 15`);
    if ((o.flags ?? []).includes('quote-pending')) {
      problems.push(`${where}: has an evidenceQuote but still carries 'quote-pending'`);
    }
  }
  if (!Array.isArray(o.flags)) problems.push(`${where}: flags must be an array`);
  if (o.orgStatus === undefined) problems.push(`${where}: orgStatus must be a value or null`);
  if (o.keyPeople === undefined) problems.push(`${where}: keyPeople must be a string or null`);

  // Fields that stay null by decision, not by omission. Each traces to sources that
  // disagree with each other, and picking one would be choosing rather than sourcing.
  if (o.id === 'innovate-bc' && o.description && /reports to the Ministry/i.test(o.description)) {
    problems.push(`${where}: Innovate BC's reporting ministry must stay null -- two gov.bc.ca pages disagree`);
  }
  if (o.id === 'caida' && o.size !== null) {
    problems.push(`${where}: CAIDA membership size must stay null -- its own pages give three different figures`);
  }
  if (o.id === 'bc-ai-ecosystem-association' && o.description && /founded in 20\d\d|since 20\d\d/i.test(o.description)) {
    problems.push(`${where}: BC + AI founding year must stay null -- its About page and press kit disagree`);
  }

  // A coordinate without a source is the exact failure mode this project exists
  // to correct. It is a build error, not a warning.
  const hasLat = o.lat !== undefined;
  const hasLng = o.lng !== undefined;
  if (hasLat !== hasLng) problems.push(`${where}: lat and lng must both be present or both absent`);
  if (hasLat && !o.geoSourceUrl) problems.push(`${where}: has coordinates but no geoSourceUrl`);
  if (hasLat && (o.lat < 48 || o.lat > 60 || o.lng < -140 || o.lng > -114)) {
    problems.push(`${where}: coordinates ${o.lat},${o.lng} fall outside British Columbia`);
  }
}

// Every category in the union must appear in the data, and vice versa. A category
// with no members is a category that was assumed rather than found.
const usedCategories = new Set(ORGANIZATIONS.map((o) => o.category));
for (const c of CATEGORIES) {
  if (!usedCategories.has(c)) problems.push(`category "${c}" is declared but has no records`);
}

// Values that must never appear anywhere in the published data, because they
// would mean something from the predecessor dataset was carried forward.
// keyPeople was on this list until 2026-08-19 and has been restored as a first-class
// field: it is carried where a source names a CURRENT officer, and null otherwise.
// The privacy concern that removed it was about republishing scraped contact details
// -- emails and phone numbers -- not about naming an executive director whose own
// organization publishes the name. Those stay banned.
//
// funding, yearFounded and focusAreas stay banned outright: every value the
// predecessor dataset held for them was generated rather than researched.
const FORBIDDEN_FIELDS = ['funding', 'yearFounded', 'focusAreas', 'email', 'phone'];
for (const o of ORGANIZATIONS) {
  for (const f of FORBIDDEN_FIELDS) {
    if (f in o) problems.push(`[${o.id}]: carries forbidden field "${f}" (see PLAN.md section 1.1)`);
  }
}

if (problems.length > 0) {
  fail(`${problems.length} dataset problem(s):\n\n    - ` + problems.join('\n    - '));
}

// ---------------------------------------------------------------------------
// Emit
// ---------------------------------------------------------------------------
const site = 'https://bcaicompass.ca';
const generated = new Date().toISOString().slice(0, 10);

const organizations = ORGANIZATIONS.map((o) => ({
  id: o.id,
  name: o.name,
  category: o.category,
  orgType: o.orgType,
  region: o.region,
  url: o.url,
  location: o.location,
  description: o.description,
  size: o.size,
  orgStatus: o.orgStatus,
  keyPeople: o.keyPeople,
  ...(o.capacityDesignMW !== null ? { capacityDesignMW: o.capacityDesignMW } : {}),
  ...(o.capacitySecuredMW !== null ? { capacitySecuredMW: o.capacitySecuredMW } : {}),
  ...(o.lat !== undefined ? { lat: o.lat, lng: o.lng, geoSourceUrl: o.geoSourceUrl } : {}),
  sourceUrl: o.sourceUrl,
  evidenceQuote: o.evidenceQuote,
  sourceDate: o.sourceDate,
  verified: o.verified,
  status: o.status,
  flags: o.flags,
}));

const byCategory = {};
for (const c of CATEGORIES) byCategory[c] = organizations.filter((o) => o.category === c).length;
// Every region is emitted, INCLUDING the zero ones. A region silently missing from
// this object reads as "nothing there"; a region present with 0 reads as "nobody has
// looked yet", which is what is actually true. The site renders the difference.
const byRegion = {};
for (const r of REGIONS) byRegion[r] = organizations.filter((o) => o.region === r).length;

const quotePending = organizations.filter((o) => o.evidenceQuote === null).length;

const dataset = {
  name: 'BC AI Compass — verified directory of British Columbia’s AI ecosystem',
  url: site,
  generated,
  license: 'CC BY 4.0 — credit bcaicompass.ca',
  method:
    'Every record was independently verified: its website resolved and was live, its British Columbia presence was confirmed from its own site or a primary source, and its category was assigned from content actually read. sourceUrl names the page read; sourceDate is the day it was read. evidenceQuote is a short verbatim string copied from that page — open sourceUrl, search for the quote, and the record is confirmed or exposed. Records with evidenceQuote null carry a quote-pending flag: sourced, but not yet spot-checkable. Nothing here was carried forward from a prior dataset. Coordinates are municipal centroids, sourced in geoSourceUrl, not street addresses.',
  scope:
    'This maps the whole ecosystem around AI in British Columbia, not only organizations that build AI. An organization is in scope when it funds, houses, teaches, convenes, governs, represents, powers or otherwise materially supports AI work in BC, and that can be sourced. An industry association does not have to do AI to be part of the AI ecosystem.',
  coverage:
    'A region or category showing zero here has NOT been surveyed to a conclusion. It is not a finding that nothing exists there. research/unverified.json records what remains unsearched.',
  quotePending,
  // Key renamed from "independence" in the 2026-08-19 correction pass. The old value
  // read "BC AI Compass is independent. It is not affiliated with, endorsed by, or
  // produced for any organization listed in it." That was FALSE and it was published:
  // Kris Krug, Executive Director of the BC + AI Ecosystem Association, asked Martin
  // Montero to build this for BC + AI in partnership with them, and supplied the
  // predecessor repository for that purpose. BC + AI is listed in this directory.
  // The old line came from an instruction written before that was known.
  affiliation:
    'BC AI Compass is a BC + AI Ecosystem Association project, built by Martin Montero as his contribution to it. The BC + AI Ecosystem Association is listed in this directory. No other organization listed here is a partner, funder or endorser of this project, and no listing is paid for or sponsored.',
  count: organizations.length,
  categories: CATEGORIES,
  categoryColors: CATEGORY_COLORS,
  regions: REGIONS,
  countsByCategory: byCategory,
  countsByRegion: byRegion,
  organizations,
};

writeFileSync('public/ecosystem.json', JSON.stringify(dataset, null, 2) + '\n');

const geojson = {
  type: 'FeatureCollection',
  name: 'bcaicompass.ca — verified BC AI organizations with sourced coordinates',
  generated,
  features: organizations
    .filter((o) => o.lat !== undefined)
    .map((o) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [o.lng, o.lat] },
      properties: {
        id: o.id,
        name: o.name,
        category: o.category,
        orgType: o.orgType,
        region: o.region,
        url: o.url,
        location: o.location,
        sourceUrl: o.sourceUrl,
        sourceDate: o.sourceDate,
        verified: o.verified,
        geoSourceUrl: o.geoSourceUrl,
      },
    })),
};

writeFileSync('public/ecosystem.geojson', JSON.stringify(geojson, null, 2) + '\n');

console.log(
  `export-data: OK — ${organizations.length} verified organizations, ` +
    `${geojson.features.length} with sourced coordinates.`
);
console.log('  wrote public/ecosystem.json and public/ecosystem.geojson');
