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
const FORBIDDEN_FIELDS = ['funding', 'keyPeople', 'yearFounded', 'focusAreas', 'email'];
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
  ...(o.lat !== undefined ? { lat: o.lat, lng: o.lng, geoSourceUrl: o.geoSourceUrl } : {}),
  sourceUrl: o.sourceUrl,
  sourceDate: o.sourceDate,
  verified: o.verified,
  status: o.status,
}));

const byCategory = {};
for (const c of CATEGORIES) byCategory[c] = organizations.filter((o) => o.category === c).length;
const byRegion = {};
for (const r of REGIONS) {
  const n = organizations.filter((o) => o.region === r).length;
  if (n > 0) byRegion[r] = n;
}

const dataset = {
  name: 'BC AI Compass — verified directory of British Columbia’s AI ecosystem',
  url: site,
  generated,
  license: 'CC BY 4.0 — credit bcaicompass.ca',
  method:
    'Every record was independently verified: its website resolved and was live, its British Columbia presence was confirmed from its own site or a primary source, and its category was assigned from content actually read. sourceUrl names the page read; sourceDate is the day it was read. Nothing here was carried forward from a prior dataset. Coordinates are municipal centroids, sourced in geoSourceUrl, not street addresses.',
  independence:
    'BC AI Compass is independent. It is not affiliated with, endorsed by, or produced for any organization listed in it.',
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
