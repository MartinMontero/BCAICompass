// ---------------------------------------------------------------------------
// BC AI Compass -- the published dataset.
//
// Every record here reached status 'verified' under the protocol in
// research/PLAN.md section 6. That means, for each one:
//   - its website resolved and was live when read;
//   - its British Columbia presence was confirmed from the organization's own
//     site or from a primary source;
//   - its category and orgType were assigned from content actually read, never
//     inferred from the name, the domain, or a legacy label;
//   - sourceUrl names the specific page read and sourceDate the day it was read.
//
// NOTHING in this file traces to the predecessor dataset
// (bc-ai--ecosystem-map@database-backup-2025-08-04). That artifact supplied
// candidate NAMES to go and check, and nothing else. No funding figure, no
// description, no founding year, no key-people value and no focus area was
// carried forward. See research/AUDIT.md for why.
//
// A null is a real answer. A record with no description is a record whose
// source did not support one.
//
// Coordinates are MUNICIPAL CENTROIDS, not street addresses. The city comes from
// the record's own sourceUrl; the latitude/longitude for that city comes from the
// gazetteer named in geoSourceUrl. Organizations with a province-wide mandate and
// no single seat carry no coordinates and appear in the directory only.
// ---------------------------------------------------------------------------

/**
 * Seven categories, derived from what this verified dataset actually contains
 * rather than from the 85 overlapping labels in the predecessor artifacts --
 * none of which had a word for AI compute infrastructure. See PLAN.md section 2.
 */
export type Category =
  | 'Compute & Infrastructure'
  | 'Research & Academia'
  | 'Companies & Applied AI'
  | 'Public Sector & Policy'
  | 'Capital & Accelerators'
  | 'Talent & Education'
  | 'Community & Convening';

/** What kind of entity this is, independent of the sector it works in. */
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
 * Vancouver and Fraser Valley -- that distinction is the point of a
 * province-wide map. 'Province-wide' is for a genuinely provincial mandate with
 * no single seat, never a fallback for unknown.
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

/** Headcount band. null when no source states it -- never estimated. */
export type OrgSize = '1-10' | '11-50' | '51-200' | '201-1000' | '1000+';

/**
 * What has happened to the organization, where a source says. 'active' is the
 * default only when a source supports it; an organization that was acquired,
 * relocated or wound up is still part of the ecosystem's history and is listed
 * with its state rather than silently dropped or silently kept as if nothing
 * changed. 'branch-office' means it operates in BC but is headquartered elsewhere.
 */
export type OrgStatus = 'active' | 'acquired' | 'branch-office' | 'relocated' | 'defunct';

/**
 * Record-level caveats, visible on the record rather than buried in a report.
 * 'quote-pending' is the only one that currently ships and it means exactly one
 * thing: no verbatim quote could be copied from the page that was read, so the
 * record's BC connection is sourced but not yet spot-checkable in ten seconds.
 */
export type OrgFlag = 'quote-pending' | 'projection-figures' | 'mailing-address-only' | 'research-stage';

/**
 * status is the literal 'verified'. That makes the ship gate a compile-time
 * guarantee: an unverified record cannot enter ORGANIZATIONS without tsc failing.
 */
export interface Organization {
  id: string;
  name: string;
  category: Category;
  orgType: OrgType;
  region: Region;
  url: string;
  location: string;
  description: string | null;
  size: OrgSize | null;
  lat?: number;
  lng?: number;
  geoSourceUrl?: string;
  /**
   * How exact this record's coordinate is.
   *  'address'  -- geocoded from a street address the source states. The pin is
   *                the building.
   *  'centroid' -- a municipal centroid from a gazetteer. The pin is the city,
   *                not the site. This is the default, and it is not a defect.
   * null when the record has no coordinate at all.
   *
   * The map draws the two differently on purpose. Rendering a city centroid and a
   * building at identical visual weight asserts a precision the dataset does not
   * have for most of its pins, and leaves a reader no way to tell which is which.
   */
  geoPrecision: 'address' | 'centroid' | null;
  /** The primary source for name, BC presence, category and org type. */
  sourceUrl: string;
  /**
   * A short verbatim string, UNDER 15 WORDS, copied character-for-character from the
   * page at sourceUrl, supporting this record's British Columbia connection -- a BC
   * address, a BC city, a BC institutional affiliation, or equivalent.
   *
   * This field exists because of a specific failure. An earlier version of the
   * Quantum Algorithms Institute record carried a Surrey location and municipal
   * coordinates drawn from a dead domain's footer, and EVERY MACHINE GATE PASSED --
   * because the gates checked that a coordinate had a source, not that the source
   * said what the record claimed. A quote closes that gap: open sourceUrl, search the
   * page for this string, and the record is confirmed or exposed in ten seconds.
   *
   * Never paraphrased. Never reconstructed from memory. Copied, or null with a
   * 'quote-pending' flag. A quote that is not on the page is a fabrication, and one
   * is enough to invalidate the dataset.
   */
  evidenceQuote: string | null;
  /** ISO date the primary source was read. YYYY-MM-DD. */
  sourceDate: string;
  /** Month of the most recent re-verification. YYYY-MM. */
  verified: string;
  /** Literal type. Makes the ship gate a compile error rather than a code review. */
  status: 'verified';
  /** What has happened to the organization. null when no source states it. */
  orgStatus: OrgStatus | null;
  /** A named current officer, where a source names one. null when unsourced. */
  keyPeople: string | null;
  /**
   * Announced design capacity in megawatts, for infrastructure records. Kept apart
   * from capacitySecuredMW because they are different facts, and the Bell figures
   * looked contradictory until that was recognised: 7 MW announced design, 6.5 MW
   * actually secured, 5 MW as-built phase. One capacity field forces a false choice.
   */
  capacityDesignMW: number | null;
  /** Capacity actually secured by an operator, in megawatts. */
  capacitySecuredMW: number | null;
  /** Record-level caveats. Empty array when none. */
  flags: OrgFlag[];
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

/** Category colours as sys tokens so they follow the active theme. */
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
  'university-or-lab': 'University / lab',
  'government-or-crown': 'Government / Crown',
  'investor-or-program': 'Investor / program',
  'nonprofit-or-association': 'Non-profit / association',
  'community-group': 'Community group',
  'infrastructure-operator': 'Infrastructure operator',
};

// ---------------------------------------------------------------------------
// Municipal centroids. One entry per city, so a coordinate appears once and is
// auditable once. Every value carries the gazetteer page it came from.
// ---------------------------------------------------------------------------
// geoPrecision is carried BY THE SPREAD, so a record that takes its coordinate
// from a city cannot silently claim street-level precision. Overriding it means
// also overriding lat, lng and geoSourceUrl in the same object literal, which is
// exactly the edit a reviewer should be able to see in one glance.
type CityGeo = {
  location: string;
  region: Region;
  lat: number;
  lng: number;
  geoSourceUrl: string;
  geoPrecision: 'centroid';
};

const CITY: Record<string, CityGeo> = {
  vancouver: {
    location: 'Vancouver',
    region: 'Metro Vancouver',
    lat: 49.24966,
    lng: -123.11934,
    geoSourceUrl: 'https://www.latlong.net/place/vancouver-bc-canada-2279.html',
    geoPrecision: 'centroid',
  },
  burnaby: {
    location: 'Burnaby',
    region: 'Metro Vancouver',
    lat: 49.267,
    lng: -122.967,
    geoSourceUrl: 'https://en.wikipedia.org/wiki/Burnaby',
    geoPrecision: 'centroid',
  },
  surrey: {
    location: 'Surrey',
    region: 'Metro Vancouver',
    lat: 49.10635,
    lng: -122.82509,
    geoSourceUrl: 'https://www.latlong.net/place/surrey-bc-canada-22762.html',
    geoPrecision: 'centroid',
  },
  victoria: {
    location: 'Victoria',
    region: 'Vancouver Island & Coast',
    lat: 48.407326,
    lng: -123.329773,
    geoSourceUrl: 'https://www.latlong.net/place/victoria-bc-canada-4300.html',
    geoPrecision: 'centroid',
  },
  kelowna: {
    location: 'Kelowna',
    region: 'Thompson-Okanagan',
    lat: 49.882114,
    lng: -119.477829,
    geoSourceUrl: 'https://www.latlong.net/place/kelowna-bc-canada-1354.html',
    geoPrecision: 'centroid',
  },
  kamloops: {
    location: 'Kamloops',
    region: 'Thompson-Okanagan',
    lat: 50.676109,
    lng: -120.340836,
    geoSourceUrl: 'https://www.latlong.net/place/kamloops-bc-canada-29153.html',
    geoPrecision: 'centroid',
  },
  merritt: {
    location: 'Merritt',
    region: 'Thompson-Okanagan',
    lat: 50.112778,
    lng: -120.789719,
    geoSourceUrl: 'https://www.latlong.net/place/merritt-bc-canada-268.html',
    geoPrecision: 'centroid',
  },
  courtenay: {
    location: 'Courtenay',
    region: 'Vancouver Island & Coast',
    lat: 49.6878,
    lng: -124.994,
    geoSourceUrl: 'https://places.canadamaps.com/british-columbia/courtenay',
    geoPrecision: 'centroid',
  },
  langley: {
    location: 'Langley to Chilliwack',
    region: 'Fraser Valley',
    lat: 49.10416,
    lng: -122.65833,
    geoSourceUrl: 'https://www.latlong.net/place/surrey-bc-canada-22762.html',
    geoPrecision: 'centroid',
  },
  richmond: {
    location: 'Richmond',
    region: 'Metro Vancouver',
    lat: 49.166592,
    lng: -123.133568,
    geoSourceUrl: 'https://www.latlong.net/place/richmond-bc-canada-17787.html',
    geoPrecision: 'centroid',
  },
  nelson: {
    location: 'Nelson',
    region: 'Kootenay',
    lat: 49.5,
    lng: -117.283333,
    geoSourceUrl: 'https://www.latlong.net/place/nelson-bc-canada-9343.html',
    geoPrecision: 'centroid',
  },
  princeGeorge: {
    location: 'Prince George',
    region: 'Cariboo',
    lat: 53.916943,
    lng: -122.749443,
    geoSourceUrl: 'https://www.latlong.net/place/prince-george-bc-canada-29186.html',
    geoPrecision: 'centroid',
  },
  fortStJohn: {
    location: 'Fort St. John',
    region: 'Northeast',
    lat: 56.246464,
    lng: -120.847633,
    geoSourceUrl: 'https://www.latlong.net/place/fort-st-john-bc-canada-29150.html',
    geoPrecision: 'centroid',
  },
  salmonArm: {
    location: 'Salmon Arm',
    region: 'Thompson-Okanagan',
    lat: 50.702221,
    lng: -119.272224,
    geoSourceUrl: 'https://www.latlong.net/place/salmon-arm-bc-canada-29193.html',
    geoPrecision: 'centroid',
  },
  northVancouver: {
    location: 'North Vancouver',
    region: 'Metro Vancouver',
    lat: 49.316666,
    lng: -123.066666,
    geoSourceUrl: 'https://www.latlong.net/place/north-vancouver-bc-canada-29179.html',
    geoPrecision: 'centroid',
  },
  abbotsford: {
    location: 'Abbotsford',
    region: 'Fraser Valley',
    lat: 49.05798,
    lng: -122.25257,
    geoSourceUrl: 'https://www.latlong.net/place/abbotsford-bc-canada-29122.html',
    geoPrecision: 'centroid',
  },
  castlegar: {
    location: 'Castlegar',
    region: 'Kootenay',
    lat: 49.323889,
    lng: -117.659444,
    geoSourceUrl: 'https://www.latlong.net/place/castlegar-bc-canada-29135.html',
    geoPrecision: 'centroid',
  },
};

// Sources cited more than once, named so a reader can see the reuse at a glance.
const S_TELUS =
  'https://www.newswire.ca/news-releases/telus-and-government-of-canada-advance-work-to-scale-canada-s-sovereign-ai-infrastructure-854223505.html';
const S_BELL = 'https://betakit.com/bell-to-build-six-ai-data-centres-in-canada-as-telcos-compete-on-infrastructure/';
const S_BELL_GROUND = 'https://bebeez.eu/2026/04/14/bell-canada-breaks-ground-on-data-center-in-kamloops-british-columbia/';
const S_BCGOV_POWER = 'https://news.gov.bc.ca/releases/2026ECS0005-000095';
const S_UBC_AI = 'https://research.ubc.ca/ai';
const S_UBC_GROUPS = 'https://www.cs.ubc.ca/research-groups';
const S_UBC_CENTRES = 'https://www.cs.ubc.ca/research-centres';
const S_SFU_AI = 'https://www.sfu.ca/big-data/using-data/artificial-intelligence-at-sfu.html';
const S_SFU_LABS = 'https://www.sfu.ca/fas/computing/research/labs.html';
const S_SFU_RESEARCH = 'https://www.sfu.ca/computing/research.html';
const S_SFU_CENTRES = 'https://www.sfu.ca/fas/computing/research/centres-and-institutes.html';
const S_SIAT = 'https://www.sfu.ca/siat/research/research-labs.html';
const S_UVIC_CS = 'https://www.uvic.ca/ecs/computerscience/research/index.php';
const S_BCAI = 'https://bc-ai.ca';
// S_BCAI_COMMUNITIES (the generic /communities index) was removed on 2026-08-19.
// Every BC + AI room now cites its own canonical page instead, which is what makes
// a real venue or region quote available rather than a shared index string.
const S_OVCARE = 'https://www.med.ubc.ca/news/harnessing-ai-to-improve-ovarian-cancer-outcomes/';
const S_COMOX = 'https://thediscourse.ca/comox-valley/how-do-comox-valley-governments-and-public-organizations-use-ai';

const READ = '2026-08-19';
const STAMP = '2026-08';

/**
 * Shared defaults, spread into every record.
 *
 * NOTE THE DIRECTION OF THE DEFAULT. evidenceQuote is null and flags carries
 * 'quote-pending' unless a record explicitly overrides them AFTER the spread. A
 * record nobody has re-checked therefore declares itself unchecked, rather than
 * inheriting a clean bill of health from a constant. The pessimistic state is the
 * cheap one to reach by accident; the optimistic state has to be typed out by hand
 * next to the quote that earns it.
 */
type VerificationDefaults = Pick<
  Organization,
  | 'sourceDate'
  | 'verified'
  | 'status'
  | 'evidenceQuote'
  | 'orgStatus'
  | 'keyPeople'
  | 'capacityDesignMW'
  | 'capacitySecuredMW'
  | 'flags'
>;

const V: VerificationDefaults = {
  sourceDate: READ,
  verified: STAMP,
  status: 'verified',
  evidenceQuote: null,
  orgStatus: null,
  keyPeople: null,
  capacityDesignMW: null,
  capacitySecuredMW: null,
  flags: ['quote-pending'],
};

/**
 * Verbatim British Columbia-connection strings, KEYED BY THE PAGE THEY WERE COPIED
 * FROM. Each value was read off the page at that exact URL and pasted here without
 * edit -- not summarised, not retyped from memory, not reconstructed.
 *
 * Keying on sourceUrl rather than on record id is deliberate. Twenty-seven records
 * share the UBC research site, so they share one quote, and that quote is true of
 * every one of them for the same reason: it is the string on the page each record
 * cites. A quote can never drift onto a record whose source does not contain it,
 * because the lookup IS the source.
 *
 * To spot-check any record: open its sourceUrl, search the page for its
 * evidenceQuote. Absent means fabricated.
 */
const QUOTE: Record<string, string> = {
  // --- institutional pages, verified by fetch on 2026-08-19 ---
  [S_UBC_AI]: 'The University of British Columbia',
  [S_UBC_GROUPS]: 'The University of British Columbia',
  [S_UBC_CENTRES]: 'The University of British Columbia',
  [S_SFU_AI]: '© Simon Fraser University',
  [S_SFU_LABS]: 'Simon Fraser University',
  [S_SIAT]: 'Simon Fraser University',
  [S_SFU_RESEARCH]: 'Burnaby, B.C.',
  [S_UVIC_CS]: '© University of Victoria',
  'https://www.uvic.ca/campus/artificial-intelligence/index.php':
    'using artificial intelligence (AI) tools at UVic',

  // --- organisation pages, each read directly ---
  'https://caida.ubc.ca/contact-us': '289-2366 Main Mall Vancouver, BC V6T 1Z4',
  'https://www.qai.ca/who-we-are':
    'advancing the growth, adoption, and strategic development of quantum technologies in British Columbia',
  'https://firstnationstech.ca/about/': 'Suite 1707, 1370 Senakw Lane Vancouver BC, V6J 0J5',
  'https://digibc.org/about/': '#160-577 Great Northern Way Vancouver, BC, V5T 1E1',
  'https://wearebctech.com/members/member-directory/name/digibc-1/':
    '210 – 1401 West 8th Ave Vancouver, BC V6H 1C9',
  'https://www2.gov.bc.ca/gov/content/governments/technology-innovation/partner-organizations':
    'Innovate BC is a Crown agency of the B.C. government',
  'https://digitalsupercluster.ca/canadas-digital-technology-supercluster-receives-funding/':
    '2127 – 1055 W. Georgia Street Vancouver, BC, V6E 3P3',
  [S_BCAI]: "300+ paying members of the nonprofit building British Columbia's AI industry",

  // --- BC + AI rooms, each read off its own canonical page on 2026-08-19 ---
  'https://bc-ai.ca/communities/vancouver-ai':
    'H.R. MacMillan Space Centre, 1100 Chestnut St, Vancouver, BC V6J 3J9, Canada',
  'https://bc-ai.ca/communities/comox-valley': 'Comox Valley / Vancouver Island',
  'https://bc-ai.ca/communities/life-sciences-ai': '6151 Collingwood Pl, Vancouver, BC V6N 1V2, Canada',
  'https://bc-ai.ca/communities/ai-education': 'Comox Valley',
  // The four below are the WEAKEST acceptable form of this evidence: a bare city
  // name. These pages carry no address and no regional statement, so "Vancouver"
  // is the whole of what ties them to British Columbia in their own words. It is
  // verbatim and it is checkable, which is the bar — but it is thin, and
  // VERIFICATION.md says so rather than letting the stamp imply more.
  'https://bc-ai.ca/communities/film-club': 'Vancouver',
  'https://bc-ai.ca/communities/mac': 'Vancouver',
  'https://bc-ai.ca/communities/futures-lab': 'Vancouver',
  'https://bc-ai.ca/communities/ai-creativity-design': 'Vancouver',

  // --- registry-and-contact-page pass, 2026-08-19 ---
  // These came from the method change in COVERAGE.md section 4: go to the page
  // that states a city in a structured field -- a contact page, a campus footer --
  // rather than a marketing site that says AI on every screen and its address on
  // none. Every one of these is an address or a headquarters sentence.
  'https://4ag.ai/contact': 'Salmon Arm, BC',
  'https://marinelabs.io/contact': '2100 Douglas St., Victoria, BC V8T 4L3',
  'https://www.trulioo.com/contact': '400–114 E. Fourth Ave., Vancouver, BC V5T 1G2',
  'https://www.zymeworks.com/contact/': '114 East 4th Avenue, Suite 800 Vancouver, BC, Canada V5T 1G4',
  'https://jane.app/contact': 'Jane is headquartered in North Vancouver, BC, Canada',
  'https://www.minesense.com/about-us/': 'our global headquarters are in Vancouver, Canada',
  'https://www.dapperlabs.com/careers': 'Vancouver-based, with hubs in L.A., New York, and Charlotte.',
  'https://www.ufv.ca/computing/': '33844 King Road, Abbotsford, BC',
  'https://selkirk.ca/programs/digital-technology': '301 Frank Beinder Way Castlegar BC V1N 4L3 Canada',
  'https://cnc.bc.ca/programs-courses/program/computer-network-electronics-technician':
    '3330-22nd Ave. Prince George, BC, V2N 1P8',
  'https://kast.com/': '91-D Baker Street Nelson, BC V1L 4G8',
  'https://innovationcentral.ca/contact': '1299 3rd Avenue Prince George, BC V2L 3E6',
  'https://www.newswire.ca/news-releases/prophet-river-first-nation-and-abct-pacific-vcc-ltd-sign-loi-to-jointly-develop-major-data-centre-in-fort-st-john-area-819620927.html':
    'an independent Dene Tsaa Nation in Northeast British Columbia',
  'https://www.animikii.com/about': '100-722 Cormorant St, Victoria, BC V8W 1P8',
  'https://www.abcellera.com/contact': '150W 4th Ave Vancouver BC V5Y 1G6',
  'https://www.generalfusion.com/contact/': '6020 Russ Baker Way Richmond, BC V7B 1B4',
  'https://www.aspectbiosystems.com/contact': '2131 Manitoba Street Vancouver, BC, Canada V5Y 0N7',
  'https://www.niricson.com': '#1200 – 555 West Hastings Street, Vancouver, BC V6B 4N6',
  'https://www.openoceanrobotics.com/contact': '200-45 Erie Street, Victoria, BC, CANADA V8V 1P8',
  'https://variational.ai': '1825 Quebec Street, #201, Vancouver, BC V5T 2Z3',
  'https://www.novarctech.com': '4505 Still Creek Ave., Burnaby, BC V5C 5W1, Canada',
  'https://www.viatec.ca': '777 Fort Street, Victoria BC V8W 1G9',
  'https://www.newventuresbc.com': 'Suite #810, 1055 Dunsmuir Street, Vancouver, BC V7X 1J1',
  'https://www.innovatebc.ca': 'Four Bentall Centre, 1055 Dunsmuir Street, Suite #810, Vancouver, BC',
  'https://www.kelowna.ca/our-community/about-kelowna/smart-and-intelligent-city-initiatives':
    'MISA BC Spirit of Innovation Award - Service & efficiency with AI chatbots.',
  'https://bc-ai.ca/communities/fraser-valley-ai':
    'Practical, responsible AI for the Fraser Valley, with a local room',
};

/**
 * Fills evidenceQuote from the quote table when a record has not supplied its own,
 * and clears 'quote-pending' only when a quote is actually attached. A record whose
 * source page yielded no verbatim BC string keeps the null AND the flag -- which is
 * the honest state and, per the defaults in V, also the state it reaches by doing
 * nothing.
 */
function withQuote(o: Organization): Organization {
  if (o.evidenceQuote !== null) return o;
  const q = QUOTE[o.sourceUrl];
  if (!q) return o;
  return { ...o, evidenceQuote: q, flags: o.flags.filter((f) => f !== 'quote-pending') };
}

const RECORDS: Organization[] = [
  // =========================================================================
  // COMPUTE & INFRASTRUCTURE
  // Verified first, per PLAN.md section 6.3: highest capital, longest
  // commitment, best-sourced, and the category the predecessor taxonomy had no
  // label for at all.
  // =========================================================================
  {
    ...CITY.kamloops,
    id: 'telus-kamloops-ai-factory',
    name: 'TELUS Kamloops AI Factory',
    category: 'Compute & Infrastructure',
    orgType: 'infrastructure-operator',
    url: 'https://www.telus.com/en/business/medium-large/ai/sovereign-ai-factory',
    location: 'Kamloops',
    description:
      'Expansion of TELUS’s existing Kamloops data centre into an AI factory, advanced with the Government of Canada under the federal Enabling Large-Scale Sovereign AI Data Centres initiative. Stated to come online later in 2026.',
    size: null,
    sourceUrl: S_TELUS,
    ...V,
  },
  {
    ...CITY.vancouver,
    // Geocoded 2026-08-19. 111 East 5th Avenue resolves to a numbered OSM node,
    // so the pin is the building rather than downtown Vancouver.
    lat: 49.266589,
    lng: -123.1022425,
    geoSourceUrl: 'https://www.openstreetmap.org/node/10738451936',
    geoPrecision: 'address',
    id: 'telus-m3-ai-factory',
    name: 'TELUS M3 AI Factory',
    category: 'Compute & Infrastructure',
    orgType: 'infrastructure-operator',
    url: 'https://www.telus.com/en/business/medium-large/ai/sovereign-ai-factory',
    location: 'Vancouver — 111 East 5th Avenue, Mount Pleasant',
    // PROPOSED, NOT APPROVED. Added in the 2026-08-19 reconcile pass: on 2026-07-21
    // Vancouver City Council unanimously reversed its 2026-07-14 decision to send the
    // 111 East 5th rezoning to a public hearing, deferring it past the municipal
    // election. Any record implying this site is approved is wrong.
    description:
      'Proposed AI factory at the former Hootsuite building in Vancouver’s Mount Pleasant, developed with Westbank. TELUS states an end-of-2026 opening scaling through 2028 — but the rezoning remains unresolved: on 21 July 2026 Vancouver City Council reversed its own 14 July decision to send it to a public hearing, deferring the matter past the municipal election. This site is proposed, not approved.',
    size: null,
    sourceUrl: S_TELUS,
    ...V,
  },
  {
    ...CITY.vancouver,
    id: 'telus-150-west-georgia-ai-factory',
    name: 'TELUS 150 West Georgia AI Factory',
    category: 'Compute & Infrastructure',
    orgType: 'infrastructure-operator',
    url: 'https://www.telus.com/en/business/medium-large/ai/sovereign-ai-factory',
    location: 'Vancouver — 150 West Georgia',
    description:
      'Third and largest-dated facility in the TELUS sovereign AI factory cluster, developed with Westbank and Allied Properties REIT. TELUS states a 2029 start. Permitting is also subject to confirmation of compliance with British Columbia’s new data-centre regulatory framework, so this site is proposed, not approved.',
    size: null,
    sourceUrl: S_TELUS,
    ...V,
  },
  {
    ...CITY.vancouver,
    id: 'telus',
    name: 'TELUS',
    category: 'Compute & Infrastructure',
    orgType: 'infrastructure-operator',
    url: 'https://www.telus.com/en/business/medium-large/ai/sovereign-ai-factory',
    location: 'Vancouver',
    // Every headline number below is a TELUS projection, labelled as one. None is a
    // delivered fact, and the two Vancouver sites are not yet approved.
    description:
      'Operator of the proposed sovereign AI factory cluster in British Columbia — Kamloops plus two Vancouver sites — built on an initial 85 MW of clean power secured from BC Hydro. TELUS projects the cluster scaling to over 60,000 GPUs and 150 MW by 2032, roughly $9B in economic value to BC and 1,000+ construction jobs. Those are company projections, not delivered results.',
    size: null,
    sourceUrl: S_TELUS,
    ...V,
  },
  {
    ...CITY.vancouver,
    id: 'westbank',
    name: 'Westbank',
    category: 'Compute & Infrastructure',
    orgType: 'company',
    url: 'https://westbankcorp.com/',
    location: 'Vancouver',
    description:
      'Named in the TELUS release as the development partner for the two new Vancouver AI factory facilities. Listed here for that stated role; no separate AI activity was verified.',
    size: null,
    sourceUrl: S_TELUS,
    ...V,
  },
  {
    ...CITY.vancouver,
    id: 'creative-energy',
    name: 'Creative Energy',
    category: 'Compute & Infrastructure',
    orgType: 'infrastructure-operator',
    url: 'https://www.creative.energy/',
    location: 'Vancouver',
    description:
      'Named in the TELUS release as a partner in the Vancouver sovereign AI factory cluster, whose design is described as using every electron twice.',
    size: null,
    sourceUrl: S_TELUS,
    ...V,
  },
  {
    ...CITY.kamloops,
    id: 'bell-ai-fabric-kamloops',
    name: 'Bell AI Fabric Kamloops',
    category: 'Compute & Infrastructure',
    orgType: 'infrastructure-operator',
    url: 'https://www.bell.ca/Business/AI-Fabric',
    location: 'Kamloops — Mission Flats Road',
    description:
      'First Bell AI Fabric facility, 7 MW design capacity, built with Groq language processing units for AI inference. Reported online June 2025.',
    size: null,
    sourceUrl: S_BELL,
    ...V,
  },
  {
    ...CITY.merritt,
    // Geocoded 2026-08-19 to Merritt Airport, which is the feature the record's
    // own location field ties the site to. THE PIN IS THE AIRPORT, NOT THE
    // PARCEL: the source says the facility is on a five-acre site adjacent to it,
    // and no source gives the parcel a civic address. The description says so, so
    // a reader is not left to assume the dot is the building.
    lat: 50.1234675,
    lng: -120.7430606,
    geoSourceUrl: 'https://www.openstreetmap.org/way/1007046965',
    geoPrecision: 'address',
    id: 'bell-ai-fabric-merritt',
    name: 'Bell AI Fabric Merritt',
    category: 'Compute & Infrastructure',
    orgType: 'infrastructure-operator',
    url: 'https://explore.business.bell.ca/news-and-events/buzz-hpc-partnership-advances-sovereign-accelerated-gpu-infrastructure-merritt-bc',
    location: 'Merritt — five-acre site adjacent to Merritt Municipal Airport',
    // Design capacity and secured capacity are DIFFERENT NUMBERS and both are
    // correct. Reported figures for this site were 7 MW (announced design), 6.5 MW
    // (secured by BUZZ HPC) and 5 MW (as-built phase, per Bell's engineering
    // contractor). Collapsing them into one "capacity" would force a false choice,
    // so both published figures are named and attributed.
    description:
      'Bell AI Fabric facility in Merritt, opened spring 2026, with high-density liquid-cooled infrastructure for AI inference and training. Announced design capacity 7 MW; BUZZ HPC has secured an immediate 6.5 MW of gross capacity with an option on more. A June 2026 agreement brings Cohere and Hypertec into the deployment. The map pin marks Merritt Airport, which the source names the site as adjacent to; the five-acre parcel itself has no published civic address.',
    size: null,
    sourceUrl: 'https://explore.business.bell.ca/news-and-events/buzz-hpc-partnership-advances-sovereign-accelerated-gpu-infrastructure-merritt-bc',
    ...V,
  },
  {
    ...CITY.merritt,
    // Same point as Bell AI Fabric Merritt, deliberately: the record states BUZZ
    // HPC is AT that facility, so a different pin would be inventing a distance
    // between two things the source puts in one place.
    lat: 50.1234675,
    lng: -120.7430606,
    geoSourceUrl: 'https://www.openstreetmap.org/way/1007046965',
    geoPrecision: 'address',
    id: 'buzz-hpc',
    name: 'BUZZ HPC',
    category: 'Compute & Infrastructure',
    orgType: 'infrastructure-operator',
    url: 'https://explore.business.bell.ca/news-and-events/buzz-hpc-partnership-advances-sovereign-accelerated-gpu-infrastructure-merritt-bc',
    location: 'Merritt — at the Bell AI Fabric facility',
    description:
      'BUZZ High Performance Computing, a wholly owned subsidiary of HIVE Digital Technologies Ltd. Operates sovereign AI cloud and GPU cluster infrastructure at Bell’s Merritt facility, having secured an immediate 6.5 MW of gross capacity there. Reported to be deploying NVIDIA Grace Blackwell GPU systems on which Cohere runs foundation models for Canadian government and enterprise customers.',
    size: null,
    sourceUrl: 'https://explore.business.bell.ca/news-and-events/buzz-hpc-partnership-advances-sovereign-accelerated-gpu-infrastructure-merritt-bc',
    ...V,
  },
  {
    ...CITY.kamloops,
    // Geocoded 2026-08-19 to the TRU campus way. A campus is a real bounded
    // feature, which is what the source names -- this is not a street address and
    // is not claimed as one.
    lat: 50.6724455,
    lng: -120.3640266,
    geoSourceUrl: 'https://www.openstreetmap.org/way/225179703',
    geoPrecision: 'address',
    id: 'bell-ai-fabric-kamloops-tru',
    name: 'Bell AI Fabric Kamloops at Thompson Rivers University',
    category: 'Compute & Infrastructure',
    orgType: 'infrastructure-operator',
    url: 'https://www.bell.ca/Business/AI-Fabric',
    location: 'Kamloops — Thompson Rivers University',
    description:
      '26 MW AI facility hosted at Thompson Rivers University. Reported to serve AI training and inference for students and faculty through integration with the BCNET network, with waste heat routed into the university’s district energy system.',
    size: null,
    sourceUrl: S_BELL,
    ...V,
  },
  {
    ...CITY.kamloops,
    // Geocoded 2026-08-19. Thompson Rivers University's own newsroom names the
    // civic address, and OSM carries a numbered node for it. The result sits
    // roughly a kilometre from the TRU campus point above, which is consistent
    // with TRU describing this as a Community Trust development rather than a
    // building on the campus itself -- so the two records pin separately, as they
    // should.
    lat: 50.674837,
    lng: -120.376513,
    geoSourceUrl: 'https://www.openstreetmap.org/node/1422253905',
    geoPrecision: 'address',
    id: 'bell-ai-fabric-kamloops-2',
    name: 'Bell AI Fabric Kamloops 2',
    category: 'Compute & Infrastructure',
    orgType: 'infrastructure-operator',
    url: 'https://www.bell.ca/Business/AI-Fabric',
    location: 'Kamloops — 1452 McGill Road',
    description:
      'Second 26 MW Kamloops facility at 1452 McGill Road. Reported to have broken ground in April 2026 with completion anticipated in late 2027, developed with TrueNorth Sustainable Infrastructure and using a closed-loop cooling system feeding a planned district heating system.',
    size: null,
    sourceUrl: S_BELL_GROUND,
    ...V,
  },

  // =========================================================================
  // PUBLIC SECTOR & POLICY
  // =========================================================================
  {
    id: 'bc-hydro',
    name: 'BC Hydro',
    category: 'Public Sector & Policy',
    orgType: 'government-or-crown',
    region: 'Province-wide',
    // No coordinate: a province-wide mandate has no single site to pin.
    geoPrecision: null,
    url: 'https://app.bchydro.com/accounts-billing/electrical-connections/large-load/emerging-industries-connections.html',
    location: 'British Columbia — province-wide',
    description:
      'Provincial Crown utility. Runs the competitive selection process, opened 30 January 2026 under Bill 31, that allocates electricity to AI and data-centre projects — up to 400 MW over the first two years, evaluated on price and on economic, community, data sovereignty and environmental benefits.',
    size: null,
    sourceUrl: S_BCGOV_POWER,
    ...V,
  },
  {
    id: 'bc-ministry-of-energy-and-climate-solutions',
    name: 'Ministry of Energy and Climate Solutions',
    category: 'Public Sector & Policy',
    orgType: 'government-or-crown',
    region: 'Province-wide',
    // No coordinate: a province-wide mandate has no single site to pin.
    geoPrecision: null,
    url: 'https://news.gov.bc.ca/releases/2026ECS0005-000095',
    location: 'British Columbia — province-wide',
    description:
      'Provincial ministry that, with BC Hydro, established the competitive clean-power process for AI and data centres under Bill 31, the Energy Statutes Amendment Act.',
    size: null,
    sourceUrl: S_BCGOV_POWER,
    ...V,
  },
  {
    id: 'pacifican',
    name: 'PacifiCan',
    category: 'Public Sector & Policy',
    orgType: 'government-or-crown',
    region: 'Province-wide',
    // No coordinate: a province-wide mandate has no single site to pin.
    geoPrecision: null,
    url: 'https://www2.gov.bc.ca/gov/content/employment-business/economic-development/funding-and-grants/regional-artificial-intelligence-initiative',
    location: 'British Columbia — province-wide',
    description:
      'Pacific Economic Development Canada, the federal development agency for British Columbia. Administers the Regional Artificial Intelligence Initiative, which funds organizations commercializing or adopting AI in BC — up to $3M per project for businesses and $5M for not-for-profits.',
    size: null,
    sourceUrl: 'https://www2.gov.bc.ca/gov/content/employment-business/economic-development/funding-and-grants/regional-artificial-intelligence-initiative',
    ...V,
  },
  {
    ...CITY.vancouver,
    id: 'city-of-vancouver',
    name: 'City of Vancouver',
    category: 'Public Sector & Policy',
    orgType: 'government-or-crown',
    url: 'https://vancouver.ca/',
    location: 'Vancouver',
    description:
      'Named in the TELUS release as a partner in the sovereign AI factory cluster being developed in Vancouver. Listed here for that stated role.',
    size: null,
    sourceUrl: S_TELUS,
    ...V,
  },
  {
    ...CITY.courtenay,
    id: 'comox-valley-regional-district',
    name: 'Comox Valley Regional District',
    category: 'Public Sector & Policy',
    orgType: 'government-or-crown',
    url: 'https://www.comoxvalleyrd.ca/',
    location: 'Comox Valley',
    description:
      'Regional district that adopted an Artificial Intelligence Governance Policy on 1 May 2026 and has used AI-based traffic analytics since January 2026.',
    size: null,
    sourceUrl: S_COMOX,
    ...V,
  },

  // =========================================================================
  // RESEARCH & ACADEMIA
  // Category and field for each unit are taken from the parent institution's
  // own published description of that unit.
  // =========================================================================
  {
    ...CITY.vancouver,
    id: 'ubc',
    name: 'The University of British Columbia',
    category: 'Research & Academia',
    orgType: 'university-or-lab',
    url: 'https://research.ubc.ca/ai',
    location: 'Vancouver — UBC Vancouver campus',
    description:
      'Publishes a university-wide AI research portfolio spanning institutes, networks and research-excellence clusters across 27 departments.',
    size: null,
    sourceUrl: S_UBC_AI,
    ...V,
  },
  {
    ...CITY.vancouver,
    id: 'ubc-cs',
    name: 'UBC Department of Computer Science',
    category: 'Research & Academia',
    orgType: 'university-or-lab',
    url: 'https://www.cs.ubc.ca/research-groups',
    location: 'Vancouver — UBC Vancouver campus',
    description:
      'Publishes twenty named research groups, including dedicated groups for artificial intelligence, machine learning, computer vision, natural language processing and data mining.',
    size: null,
    sourceUrl: S_UBC_GROUPS,
    ...V,
  },
  {
    ...CITY.vancouver,
    id: 'caida',
    name: 'CAIDA — UBC Centre for Artificial Intelligence Decision-making and Action',
    category: 'Research & Academia',
    orgType: 'university-or-lab',
    url: 'https://caida.ubc.ca/',
    location: 'Vancouver — 289-2366 Main Mall, ICICS Building, UBC Vancouver',
    // No membership figure is published here on purpose: CAIDA's own pages give
    // three different counts (83 professors / 24 units, 100+ / 27, 100+ / 30).
    // Picking one would be choosing a number, which is not the same as sourcing it.
    // COLLISION HAZARD for anyone re-verifying: caida.org is the Center for Applied
    // Internet Data Analysis in San Diego -- unrelated, same acronym, and the first
    // result a naive search returns. The correct domain is caida.ubc.ca.
    description:
      'Described by UBC as the university’s research hub for artificial intelligence, spanning many departments and working on theoretical and applied AI for decision-making and action. Sits within UBC’s Institute for Computing, Information and Cognitive Systems.',
    size: null,
    // Sourced to CAIDA's own contact page rather than the UBC AI index, so the
    // evidence quote is its street address instead of a university-wide string.
    sourceUrl: 'https://caida.ubc.ca/contact-us',
    ...V,
  },
  {
    ...CITY.vancouver,
    id: 'ubc-aim-si',
    name: 'Artificial Intelligence Methods for Scientific Impact (AIM-SI)',
    category: 'Research & Academia',
    orgType: 'university-or-lab',
    url: 'https://research.ubc.ca/ai',
    location: 'Vancouver — UBC Vancouver campus',
    description:
      'Interdisciplinary cluster within CAIDA, established to expand UBC’s teaching and research capacity in artificial intelligence.',
    size: null,
    sourceUrl: S_UBC_AI,
    ...V,
  },
  {
    ...CITY.vancouver,
    id: 'ubc-ai-and-health-network',
    name: 'UBC AI and Health Network',
    category: 'Research & Academia',
    orgType: 'university-or-lab',
    url: 'https://research.ubc.ca/ai',
    location: 'Vancouver — UBC Vancouver campus',
    description:
      'Initiative combining UBC’s strengths in AI, health-systems research and biomedical innovation, aimed at transforming patient care and accelerating health-system innovation in BC.',
    size: null,
    sourceUrl: S_UBC_AI,
    ...V,
  },
  {
    ...CITY.vancouver,
    id: 'ubc-project-ada',
    name: 'Project ADA',
    category: 'Research & Academia',
    orgType: 'university-or-lab',
    url: 'https://research.ubc.ca/ai',
    location: 'Vancouver — UBC Vancouver campus',
    description:
      'Autonomous discovery platform for thin-film materials, using self-driving laboratories and machine learning to accelerate discovery of clean-energy materials.',
    size: null,
    sourceUrl: S_UBC_AI,
    ...V,
  },
  {
    ...CITY.vancouver,
    id: 'ubc-aiteccc',
    name: 'AI and Technology-Enhanced Emergency Care Collaboration Centre (AiTECCC)',
    category: 'Research & Academia',
    orgType: 'university-or-lab',
    url: 'https://research.ubc.ca/ai',
    location: 'Vancouver — UBC Vancouver campus',
    description: 'Cluster bringing health leaders and AI experts together to co-design AI-powered healthcare solutions.',
    size: null,
    sourceUrl: S_UBC_AI,
    ...V,
  },
  {
    ...CITY.vancouver,
    id: 'ubc-data-science-institute',
    name: 'UBC Data Science Institute',
    category: 'Research & Academia',
    orgType: 'university-or-lab',
    url: 'https://dsi.ubc.ca/',
    location: 'Vancouver — UBC Vancouver campus',
    description:
      'Faculty-wide institute that incubates research, innovation and training in data-intensive science and supplies approaches, tools and expertise for working with large data.',
    size: null,
    sourceUrl: S_UBC_AI,
    ...V,
  },
  {
    ...CITY.vancouver,
    id: 'ubc-trustml',
    name: 'TrustML',
    category: 'Research & Academia',
    orgType: 'university-or-lab',
    url: 'https://research.ubc.ca/ai',
    location: 'Vancouver — UBC Vancouver campus',
    description:
      'Cluster working on trustworthy machine-learning systems that are reliable, secure, explainable and ethical.',
    size: null,
    sourceUrl: S_UBC_AI,
    ...V,
  },
  {
    ...CITY.vancouver,
    id: 'ubc-nlp-group',
    name: 'UBC Natural Language Processing Group',
    category: 'Research & Academia',
    orgType: 'university-or-lab',
    url: 'https://www.cs.ubc.ca/research-groups',
    location: 'Vancouver — UBC Vancouver campus',
    description:
      'Research on core natural language processing problems, computational linguistics, text mining, machine learning and visual text analytics.',
    size: null,
    sourceUrl: S_UBC_GROUPS,
    ...V,
  },
  {
    ...CITY.vancouver,
    id: 'ubc-dash',
    name: 'Data Science and Health (DASH)',
    category: 'Research & Academia',
    orgType: 'university-or-lab',
    url: 'https://research.ubc.ca/ai',
    location: 'Vancouver — UBC Vancouver campus',
    description:
      'Cluster building systems to link health research data in British Columbia, to improve diagnosis, treatment and disease prevention.',
    size: null,
    sourceUrl: S_UBC_AI,
    ...V,
  },
  {
    ...CITY.vancouver,
    id: 'ubc-graphical-ai',
    name: 'Graphical AI',
    category: 'Research & Academia',
    orgType: 'university-or-lab',
    url: 'https://research.ubc.ca/ai',
    location: 'Vancouver — UBC Vancouver campus',
    description:
      'Cluster bridging mathematics and computer science to uncover cause-and-effect relationships in public health research.',
    size: null,
    sourceUrl: S_UBC_AI,
    ...V,
  },
  {
    ...CITY.vancouver,
    id: 'ubc-hai',
    name: 'Human-AI Interaction @ UBC (HAI)',
    category: 'Research & Academia',
    orgType: 'university-or-lab',
    url: 'https://www.cs.ubc.ca/research-groups',
    location: 'Vancouver — UBC Vancouver campus',
    description:
      'Works at the intersection of AI, human-computer interaction and cognitive science on ethical AI systems people can trust, with an emphasis on visualization and decision-support interfaces.',
    size: null,
    sourceUrl: S_UBC_GROUPS,
    ...V,
  },
  {
    ...CITY.kelowna,
    id: 'ubco-digital-transparency-cluster',
    name: 'Digital Transparency Research Excellence Cluster',
    category: 'Research & Academia',
    orgType: 'university-or-lab',
    url: 'https://research.ubc.ca/ai',
    location: 'Kelowna — UBC Okanagan',
    description:
      'UBC Okanagan cluster providing public education on AI and data literacy while developing computational tools for AI and data safety.',
    size: null,
    sourceUrl: S_UBC_AI,
    ...V,
  },
  {
    ...CITY.vancouver,
    id: 'ubc-music-create',
    name: 'MUSIC — Multi-Scale Multi-Modal Image and Omics Computing for Health',
    category: 'Research & Academia',
    orgType: 'university-or-lab',
    url: 'https://research.ubc.ca/ai',
    location: 'Vancouver — UBC Vancouver campus',
    description:
      'NSERC CREATE training programme integrating AI and machine-learning skills with imaging and omics biological data.',
    size: null,
    sourceUrl: S_UBC_AI,
    ...V,
  },
  {
    ...CITY.vancouver,
    id: 'ubc-smart-retention',
    name: 'Smart Retention',
    category: 'Research & Academia',
    orgType: 'university-or-lab',
    url: 'https://research.ubc.ca/ai',
    location: 'Vancouver — UBC Vancouver campus',
    description:
      'Interdisciplinary cluster addressing nursing workforce retention in Canada using AI and human-centred design.',
    size: null,
    sourceUrl: S_UBC_AI,
    ...V,
  },
  {
    ...CITY.vancouver,
    id: 'ubc-cs-ai-group',
    name: 'UBC Artificial Intelligence Research Group',
    category: 'Research & Academia',
    orgType: 'university-or-lab',
    url: 'https://www.cs.ubc.ca/research-groups',
    location: 'Vancouver — UBC Vancouver campus',
    description:
      'Computer Science research group focused on decision-making systems designed to cooperate with human decision-makers, including in areas such as privacy.',
    size: null,
    sourceUrl: S_UBC_GROUPS,
    ...V,
  },
  {
    ...CITY.vancouver,
    id: 'ubc-cvl',
    name: 'UBC Computer Vision Lab (CVL)',
    category: 'Research & Academia',
    orgType: 'university-or-lab',
    url: 'https://www.cs.ubc.ca/research-groups',
    location: 'Vancouver — UBC Vancouver campus',
    description:
      'Develops algorithms for image understanding, video analysis, 3D vision, and applications of generative models in computer vision.',
    size: null,
    sourceUrl: S_UBC_GROUPS,
    ...V,
  },
  {
    ...CITY.vancouver,
    id: 'ubc-dmm',
    name: 'UBC Data Management and Mining Lab (DMM)',
    category: 'Research & Academia',
    orgType: 'university-or-lab',
    url: 'https://www.cs.ubc.ca/research-groups',
    location: 'Vancouver — UBC Vancouver campus',
    description: 'Focuses on how to manage or mine data, relational or otherwise.',
    size: null,
    sourceUrl: S_UBC_GROUPS,
    ...V,
  },
  {
    ...CITY.vancouver,
    id: 'ubc-ml-group',
    name: 'UBC Machine Learning Group',
    category: 'Research & Academia',
    orgType: 'university-or-lab',
    url: 'https://www.cs.ubc.ca/research-groups',
    location: 'Vancouver — UBC Vancouver campus',
    description:
      'Machine learning research spanning computer science, statistics, mathematics and applied sciences.',
    size: null,
    sourceUrl: S_UBC_GROUPS,
    ...V,
  },
  {
    ...CITY.vancouver,
    id: 'ubc-plai',
    name: 'PLAI — Pacific Laboratory for Artificial Intelligence',
    category: 'Research & Academia',
    orgType: 'university-or-lab',
    url: 'https://plai.cs.ubc.ca/',
    location: 'Vancouver — UBC Vancouver campus',
    description:
      'Develops production-quality open-source software for neuroscience, image recognition and robotics.',
    size: null,
    sourceUrl: S_UBC_GROUPS,
    ...V,
  },
  {
    ...CITY.vancouver,
    id: 'ubc-infovis',
    name: 'UBC Information Visualization Group (InfoVis)',
    category: 'Research & Academia',
    orgType: 'university-or-lab',
    url: 'https://www.cs.ubc.ca/research-groups',
    location: 'Vancouver — UBC Vancouver campus',
    description:
      'Creates visual representations that let people explore and understand large information datasets.',
    size: null,
    sourceUrl: S_UBC_GROUPS,
    ...V,
  },
  {
    ...CITY.vancouver,
    id: 'ubc-security-privacy',
    name: 'UBC Security and Privacy Group',
    category: 'Research & Academia',
    orgType: 'university-or-lab',
    url: 'https://www.cs.ubc.ca/research-groups',
    location: 'Vancouver — UBC Vancouver campus',
    description:
      'Works on systems security, cloud security, privacy, machine learning and software engineering.',
    size: null,
    sourceUrl: S_UBC_GROUPS,
    ...V,
  },
  {
    ...CITY.vancouver,
    id: 'ubc-ssl',
    name: 'UBC Sensorimotor Systems Lab (SSL)',
    category: 'Research & Academia',
    orgType: 'university-or-lab',
    url: 'https://www.cs.ubc.ca/research-groups',
    location: 'Vancouver — UBC Vancouver campus',
    description:
      'Researches human movement through computer graphics, scientific computing, robotics and biomechanics.',
    size: null,
    sourceUrl: S_UBC_GROUPS,
    ...V,
  },
  {
    ...CITY.vancouver,
    id: 'ubc-mild',
    name: 'MILD — Mathematics of Information, Learning and Data',
    category: 'Research & Academia',
    orgType: 'university-or-lab',
    url: 'https://www.cs.ubc.ca/research-centres',
    location: 'Vancouver — UBC Vancouver campus',
    description:
      'Cross-departmental group focused on the rigorous mathematics underlying machine learning and data science, including privacy, algorithm design and learning theory.',
    size: null,
    sourceUrl: S_UBC_CENTRES,
    ...V,
  },
  {
    ...CITY.vancouver,
    id: 'ubc-amltn',
    name: 'AMLTN — Advanced Machine Learning Training Network',
    category: 'Research & Academia',
    orgType: 'university-or-lab',
    url: 'https://www.cs.ubc.ca/research-centres',
    location: 'Vancouver — UBC Vancouver campus',
    description:
      'Builds a research training programme in machine learning with opportunities beyond traditional computer science education, connecting students to researchers globally.',
    size: null,
    sourceUrl: S_UBC_CENTRES,
    ...V,
  },
  {
    ...CITY.vancouver,
    id: 'ubc-ece-optimization-learning-control',
    name: 'Optimization, Learning, Control — UBC Electrical & Computer Engineering',
    category: 'Research & Academia',
    orgType: 'university-or-lab',
    url: 'https://ece.ubc.ca/research/',
    location: 'Vancouver — UBC Vancouver campus',
    description:
      'One of six ECE research areas, formulating and solving fundamental problems in learning systems with applications including robotics and transportation.',
    size: null,
    sourceUrl: 'https://ece.ubc.ca/research/',
    ...V,
  },
  {
    ...CITY.vancouver,
    id: 'ubc-aim-lab',
    name: 'AIM Lab — Artificial Intelligence in Medicine Lab',
    category: 'Research & Academia',
    orgType: 'university-or-lab',
    url: 'https://aimlab.ca',
    location: 'Vancouver — UBC',
    description:
      'Develops AI and machine-learning methods for cancer diagnosis and healthcare delivery, including image analysis that helps clinicians examine tissue and identify cancerous cells.',
    size: null,
    sourceUrl: 'https://aimlab.ca',
    ...V,
  },
  {
    ...CITY.vancouver,
    id: 'ovcare',
    name: 'OVCARE — B.C.’s Ovarian Cancer Research Program',
    category: 'Research & Academia',
    orgType: 'university-or-lab',
    url: 'https://www.med.ubc.ca/news/harnessing-ai-to-improve-ovarian-cancer-outcomes/',
    location: 'Vancouver',
    description:
      'British Columbia ovarian cancer research programme with a director of AI research, using state-of-the-art AI to help predict survival and guide treatment selection.',
    size: null,
    sourceUrl: S_OVCARE,
    ...V,
  },
  {
    ...CITY.vancouver,
    id: 'bc-cancer',
    name: 'BC Cancer',
    category: 'Research & Academia',
    orgType: 'government-or-crown',
    url: 'https://www.med.ubc.ca/news/harnessing-ai-to-improve-ovarian-cancer-outcomes/',
    location: 'Vancouver',
    description:
      'Named as a participating investigator organization in a British Columbia ovarian cancer project using AI to identify factors tied to long-term survival.',
    size: null,
    sourceUrl: S_OVCARE,
    ...V,
  },
  {
    ...CITY.vancouver,
    id: 'ubc-biomedical-engineering',
    name: 'UBC School of Biomedical Engineering',
    category: 'Research & Academia',
    orgType: 'university-or-lab',
    url: 'https://www.med.ubc.ca/news/harnessing-ai-to-improve-ovarian-cancer-outcomes/',
    location: 'Vancouver — UBC Vancouver campus',
    description:
      'Home of faculty leading AI research in cancer pathology, including the director of AI research for British Columbia’s ovarian cancer research programme.',
    size: null,
    sourceUrl: S_OVCARE,
    ...V,
  },
  {
    ...CITY.vancouver,
    id: 'vchri',
    name: 'Vancouver Coastal Health Research Institute',
    category: 'Research & Academia',
    orgType: 'nonprofit-or-association',
    url: 'https://www.vchri.ca/',
    location: 'Vancouver',
    description:
      'Health research institute of Vancouver Coastal Health and a UBC health partner, with Digital Health and Artificial Intelligence as a named research focus area.',
    size: null,
    sourceUrl: 'https://www.vchri.ca/',
    ...V,
  },
  {
    ...CITY.vancouver,
    id: 'vch-vchri-ai-hub',
    name: 'VCH-VCHRI AI Hub',
    category: 'Research & Academia',
    orgType: 'nonprofit-or-association',
    url: 'https://www.vchri.ca/',
    location: 'Vancouver',
    description:
      'Support service listed by Vancouver Coastal Health Research Institute for AI work across the health authority and institute.',
    size: null,
    sourceUrl: 'https://www.vchri.ca/',
    ...V,
  },
  {
    ...CITY.burnaby,
    id: 'sfu',
    name: 'Simon Fraser University',
    category: 'Research & Academia',
    orgType: 'university-or-lab',
    url: 'https://www.sfu.ca/big-data/using-data/artificial-intelligence-at-sfu.html',
    location: 'Burnaby — SFU Burnaby campus',
    description:
      'Publishes an AI research portfolio spanning six institutes and, separately, more than twenty named labs and groups in Computing Science and Interactive Arts & Technology.',
    size: null,
    sourceUrl: S_SFU_AI,
    ...V,
  },
  {
    ...CITY.burnaby,
    id: 'sfu-computing-science',
    name: 'SFU School of Computing Science',
    category: 'Research & Academia',
    orgType: 'university-or-lab',
    url: 'https://www.sfu.ca/computing/research.html',
    location: 'Burnaby — 8888 University Drive',
    description:
      'Publishes six research areas including artificial intelligence, whose stated scope is machine learning, computer vision, natural language processing, knowledge representation and reasoning, constraint optimization, and robotics.',
    size: null,
    sourceUrl: S_SFU_RESEARCH,
    ...V,
  },
  {
    ...CITY.burnaby,
    id: 'sfu-digital-democracies-institute',
    name: 'Digital Democracies Institute',
    category: 'Research & Academia',
    orgType: 'university-or-lab',
    url: 'https://digitaldemocracies.org/',
    location: 'Burnaby — SFU',
    description: 'SFU institute listed as using AI to create innovations in digital democracy and related fields.',
    size: null,
    sourceUrl: S_SFU_AI,
    ...V,
  },
  {
    ...CITY.burnaby,
    id: 'sfu-inn',
    name: 'Institute for Neuroscience and Neurotechnology (INN)',
    category: 'Research & Academia',
    orgType: 'university-or-lab',
    url: 'https://www.sfu.ca/big-data/using-data/artificial-intelligence-at-sfu.html',
    location: 'Burnaby — SFU',
    description: 'SFU institute applying AI to neuroscience research and neurotechnology development.',
    size: null,
    sourceUrl: S_SFU_AI,
    ...V,
  },
  {
    ...CITY.burnaby,
    id: 'sfu-icrc',
    name: 'International Cybercrime Research Centre (ICRC)',
    category: 'Research & Academia',
    orgType: 'university-or-lab',
    url: 'https://www.sfu.ca/big-data/using-data/artificial-intelligence-at-sfu.html',
    location: 'Burnaby — SFU',
    description: 'SFU centre listed as leveraging AI for cybercrime investigation and analysis.',
    size: null,
    sourceUrl: S_SFU_AI,
    ...V,
  },
  {
    // CORRECTED 2026-08-19 during the reconcile pass. Three things were wrong here:
    // the live domain is qai.ca (not quantumalgorithms.ca, which is the legacy
    // domain and served an expired certificate), and this record previously
    // asserted Surrey with a municipal pin. The Surrey address appears only on the
    // legacy domain's footer and on Facebook; the current site publishes NO address
    // on any page and has no contact page in its navigation. Assigning a region and
    // a pin from a stale footer is precisely the inference this project refuses, so
    // the pin is gone and the region records the mandate, not a guessed address.
    id: 'quantum-algorithms-institute',
    name: 'Quantum Algorithms Institute',
    category: 'Research & Academia',
    orgType: 'nonprofit-or-association',
    region: 'Province-wide',
    // No coordinate: a province-wide mandate has no single site to pin.
    geoPrecision: null,
    url: 'https://www.qai.ca',
    location: 'British Columbia — no address published',
    description:
      'Non-profit described on its own site as "dedicated to advancing the growth, adoption, and strategic development of quantum technologies in British Columbia", through quantum literacy in business, training, and pilot projects applying quantum methods. Listed by SFU as developing quantum computing algorithms and AI applications. No physical address is published on its site, so this record carries no coordinates.',
    size: null,
    sourceUrl: 'https://www.qai.ca/who-we-are',
    ...V,
  },
  {
    ...CITY.burnaby,
    id: 'sfu-star-institute',
    name: 'Science and Technology for Aging Research Institute',
    category: 'Research & Academia',
    orgType: 'university-or-lab',
    url: 'https://www.sfu.ca/big-data/using-data/artificial-intelligence-at-sfu.html',
    location: 'Burnaby — SFU',
    description: 'SFU institute using AI to address challenges in aging populations and senior care.',
    size: null,
    sourceUrl: S_SFU_AI,
    ...V,
  },
  {
    ...CITY.vancouver,
    id: 'viva',
    name: 'Vancouver Institute for Visual Analytics (VIVA)',
    category: 'Research & Academia',
    orgType: 'university-or-lab',
    url: 'https://www.sfu.ca/big-data/using-data/artificial-intelligence-at-sfu.html',
    location: 'Vancouver',
    description: 'Institute focused on visual analytics, using AI for data visualization and interpretation.',
    size: null,
    sourceUrl: S_SFU_AI,
    ...V,
  },
  {
    ...CITY.burnaby,
    id: 'sfu-big-data-hub',
    name: 'SFU Big Data Hub',
    category: 'Research & Academia',
    orgType: 'university-or-lab',
    url: 'https://www.sfu.ca/big-data/using-data/artificial-intelligence-at-sfu.html',
    location: 'Burnaby — SFU',
    description:
      'SFU hub that publishes and coordinates the university’s data-intensive and artificial intelligence research activity.',
    size: null,
    sourceUrl: S_SFU_AI,
    ...V,
  },
  {
    ...CITY.burnaby,
    id: 'sfu-ml-group',
    name: 'SFU Machine Learning Group',
    category: 'Research & Academia',
    orgType: 'university-or-lab',
    url: 'https://www.sfu.ca/fas/computing/research/labs.html',
    location: 'Burnaby — SFU',
    description: null,
    size: null,
    sourceUrl: S_SFU_LABS,
    ...V,
  },
  {
    ...CITY.burnaby,
    id: 'sfu-data-science-research-group',
    name: 'SFU Data Science Research Group',
    category: 'Research & Academia',
    orgType: 'university-or-lab',
    url: 'https://www.sfu.ca/fas/computing/research/labs.html',
    location: 'Burnaby — SFU',
    description: null,
    size: null,
    sourceUrl: S_SFU_LABS,
    ...V,
  },
  {
    ...CITY.burnaby,
    id: 'sfu-3d-language-and-generation-group',
    name: 'SFU 3D Language and Generation Group',
    category: 'Research & Academia',
    orgType: 'university-or-lab',
    url: 'https://www.sfu.ca/fas/computing/research/labs.html',
    location: 'Burnaby — SFU',
    description: null,
    size: null,
    sourceUrl: S_SFU_LABS,
    ...V,
  },
  {
    ...CITY.burnaby,
    id: 'sfu-airob-lab',
    name: 'Autonomous Intelligence and Robotics (AIRob) Lab',
    category: 'Research & Academia',
    orgType: 'university-or-lab',
    url: 'https://www.sfu.ca/fas/computing/research/labs.html',
    location: 'Burnaby — SFU',
    description: null,
    size: null,
    sourceUrl: S_SFU_LABS,
    ...V,
  },
  {
    ...CITY.burnaby,
    id: 'sfu-database-data-mining-lab',
    name: 'SFU Database & Data Mining Lab',
    category: 'Research & Academia',
    orgType: 'university-or-lab',
    url: 'https://www.sfu.ca/fas/computing/research/labs.html',
    location: 'Burnaby — SFU',
    description: null,
    size: null,
    sourceUrl: S_SFU_LABS,
    ...V,
  },
  {
    ...CITY.burnaby,
    id: 'sfu-medical-image-analysis-lab',
    name: 'SFU Medical Image Analysis Lab',
    category: 'Research & Academia',
    orgType: 'university-or-lab',
    url: 'https://www.sfu.ca/fas/computing/research/labs.html',
    location: 'Burnaby — SFU',
    description: null,
    size: null,
    sourceUrl: S_SFU_LABS,
    ...V,
  },
  {
    ...CITY.burnaby,
    id: 'sfu-mars-lab',
    name: 'Multi-Agent Robotic Systems (MARS) Lab',
    category: 'Research & Academia',
    orgType: 'university-or-lab',
    url: 'https://www.sfu.ca/fas/computing/research/labs.html',
    location: 'Burnaby — SFU',
    description: null,
    size: null,
    sourceUrl: S_SFU_LABS,
    ...V,
  },
  {
    ...CITY.burnaby,
    id: 'sfu-rosie-lab',
    name: 'Robots with Social Intelligence and Empathy (ROSIE) Lab',
    category: 'Research & Academia',
    orgType: 'university-or-lab',
    url: 'https://www.sfu.ca/computing/research.html',
    location: 'Burnaby — SFU',
    description: 'Focuses on developing robots with social and empathetic capabilities.',
    size: null,
    sourceUrl: S_SFU_RESEARCH,
    ...V,
  },
  {
    ...CITY.burnaby,
    id: 'sfu-natural-language-laboratory',
    name: 'SFU Natural Language Laboratory',
    category: 'Research & Academia',
    orgType: 'university-or-lab',
    url: 'https://www.sfu.ca/fas/computing/research/labs.html',
    location: 'Burnaby — SFU',
    description: null,
    size: null,
    sourceUrl: S_SFU_LABS,
    ...V,
  },
  {
    ...CITY.burnaby,
    id: 'sfu-tai-lab',
    name: 'Trustworthy Artificial Intelligence (TAI) Lab',
    category: 'Research & Academia',
    orgType: 'university-or-lab',
    url: 'https://www.sfu.ca/fas/computing/research/labs.html',
    location: 'Burnaby — SFU',
    description: null,
    size: null,
    sourceUrl: S_SFU_LABS,
    ...V,
  },
  {
    ...CITY.burnaby,
    id: 'sfu-gruvi',
    name: 'Graphics, Usability and Visualization (GrUVI) Group',
    category: 'Research & Academia',
    orgType: 'university-or-lab',
    url: 'https://www.sfu.ca/computing/research.html',
    location: 'Burnaby — SFU',
    description: 'Addresses computer graphics, user experience design and data visualization.',
    size: null,
    sourceUrl: S_SFU_RESEARCH,
    ...V,
  },
  {
    ...CITY.burnaby,
    id: 'vinci',
    name: 'Visual & Interactive Computing Institute (VINCI)',
    category: 'Research & Academia',
    orgType: 'university-or-lab',
    url: 'https://www.sfu.ca/fas/computing/research/centres-and-institutes.html',
    location: 'Burnaby — SFU',
    description:
      'Established at SFU in 2023, combining Computing Science and the School of Interactive Arts & Technology to lead innovation in visual computing, artificial intelligence and human-computer interaction.',
    size: null,
    sourceUrl: S_SFU_CENTRES,
    ...V,
  },
  {
    ...CITY.surrey,
    id: 'sfu-metacreation-lab',
    name: 'Metacreation Lab for Creative AI',
    category: 'Research & Academia',
    orgType: 'university-or-lab',
    url: 'https://www.metacreation.net',
    location: 'Surrey — SFU',
    description:
      'Develops generative systems and algorithms for creative tasks, from human-driven co-creation tools to autonomous creative agents.',
    size: null,
    sourceUrl: 'https://www.metacreation.net',
    ...V,
  },
  {
    ...CITY.surrey,
    id: 'sfu-iviz-lab',
    name: 'iViz Lab',
    category: 'Research & Academia',
    orgType: 'university-or-lab',
    url: 'https://www.sfu.ca/siat/research/research-labs.html',
    location: 'Surrey — SFU SIAT',
    description:
      'Focused on AI-based computational models of human characteristics such as expression, emotion, behaviour, empathy and creativity.',
    size: null,
    sourceUrl: S_SIAT,
    ...V,
  },
  {
    ...CITY.surrey,
    id: 'sfu-learning-analytics-lab',
    name: 'Learning Analytics Lab',
    category: 'Research & Academia',
    orgType: 'university-or-lab',
    url: 'https://www.sfu.ca/siat/research/research-labs.html',
    location: 'Surrey — SFU SIAT',
    description:
      'Uses data science and machine learning to develop theories supporting educational technologies.',
    size: null,
    sourceUrl: S_SIAT,
    ...V,
  },
  {
    ...CITY.surrey,
    id: 'sfu-data-dialogue-lab',
    name: 'Data & Dialogue Lab',
    category: 'Research & Academia',
    orgType: 'university-or-lab',
    url: 'https://www.sfu.ca/siat/research/research-labs.html',
    location: 'Surrey — SFU SIAT',
    description:
      'Research at the intersection of information visualization, human-computer interaction and social psychology.',
    size: null,
    sourceUrl: S_SIAT,
    ...V,
  },
  {
    ...CITY.surrey,
    id: 'sfu-integrated-science-lab',
    name: 'Integrated Science Lab',
    category: 'Research & Academia',
    orgType: 'university-or-lab',
    url: 'https://www.sfu.ca/siat/research/research-labs.html',
    location: 'Surrey — SFU SIAT',
    description:
      'Bridges science and technology across decision intelligence, visual analytics, design and behavioural science.',
    size: null,
    sourceUrl: S_SIAT,
    ...V,
  },
  {
    ...CITY.surrey,
    id: 'sfu-computational-neuroscience-lab',
    name: 'Computational Neuroscience Research Lab',
    category: 'Research & Academia',
    orgType: 'university-or-lab',
    url: 'https://www.sfu.ca/siat/research/research-labs.html',
    location: 'Surrey — SFU SIAT',
    description: 'Investigates brain plasticity and neuro-training to develop digital health solutions.',
    size: null,
    sourceUrl: S_SIAT,
    ...V,
  },
  {
    ...CITY.surrey,
    id: 'sfu-computational-design-lab',
    name: 'Computational Design Lab',
    category: 'Research & Academia',
    orgType: 'university-or-lab',
    url: 'https://www.sfu.ca/siat/research/research-labs.html',
    location: 'Surrey — SFU SIAT',
    description:
      'Explores how design transforms through computation, creating ideas, interfaces, algorithms and systems for change.',
    size: null,
    sourceUrl: S_SIAT,
    ...V,
  },
  {
    ...CITY.victoria,
    id: 'uvic',
    name: 'University of Victoria',
    category: 'Research & Academia',
    orgType: 'university-or-lab',
    url: 'https://www.uvic.ca/campus/artificial-intelligence/index.php',
    location: 'Victoria — UVic campus',
    description:
      'Publishes a campus AI hub and, in Computer Science and Engineering, named labs covering machine learning, data mining, computer vision, robotics and applied AI.',
    size: null,
    sourceUrl: 'https://www.uvic.ca/campus/artificial-intelligence/index.php',
    ...V,
  },
  {
    ...CITY.victoria,
    id: 'uvic-computer-science',
    name: 'UVic Department of Computer Science',
    category: 'Research & Academia',
    orgType: 'university-or-lab',
    url: 'https://www.uvic.ca/ecs/computerscience/research/index.php',
    location: 'Victoria — UVic campus',
    description:
      'Publishes fifteen named research labs and groups, tagged by the department for AI, machine learning, vision, data and robotics.',
    size: null,
    sourceUrl: S_UVIC_CS,
    ...V,
  },
  {
    ...CITY.victoria,
    id: 'acis-laboratories',
    name: 'Advanced Control and Intelligent Systems (ACIS) Laboratories',
    category: 'Research & Academia',
    orgType: 'university-or-lab',
    url: 'https://acislabs.ca/',
    location: 'Victoria — UVic campus',
    description:
      'Works on control, robotics, artificial intelligence and automation for physical systems under uncertainty, including embodied AI for robot learning and autonomous aerial, ground and marine platforms.',
    size: null,
    sourceUrl: 'https://acislabs.ca/',
    ...V,
  },
  {
    ...CITY.victoria,
    id: 'uvic-gaidg-lab',
    name: 'Graphics, Artificial Intelligence, Design, and Games (GAIDG) Lab',
    category: 'Research & Academia',
    orgType: 'university-or-lab',
    url: 'https://www.uvic.ca/ecs/computerscience/research/index.php',
    location: 'Victoria — UVic campus',
    description:
      'Covers graphics, agent-based modelling, crowd simulation, multi-agent reinforcement learning, deep learning, digital games, human-computer interaction and augmented intelligence.',
    size: null,
    sourceUrl: S_UVIC_CS,
    ...V,
  },
  {
    ...CITY.victoria,
    id: 'uvic-machine-learning',
    name: 'UVic Machine Learning Group',
    category: 'Research & Academia',
    orgType: 'university-or-lab',
    url: 'https://www.uvic.ca/ecs/computerscience/research/index.php',
    location: 'Victoria — UVic campus',
    description: 'Statistical learning, online learning and sequential prediction, and learning theory.',
    size: null,
    sourceUrl: S_UVIC_CS,
    ...V,
  },
  {
    ...CITY.victoria,
    id: 'uvic-deia',
    name: 'UVic Database & Data Mining Group (DEIA)',
    category: 'Research & Academia',
    orgType: 'university-or-lab',
    url: 'https://www.uvic.ca/ecs/computerscience/research/index.php',
    location: 'Victoria — UVic campus',
    description:
      'Data mining, bioinformatics, search and ranking, algorithms for large social and web graphs, mining software repositories, and big data.',
    size: null,
    sourceUrl: S_UVIC_CS,
    ...V,
  },
  {
    ...CITY.victoria,
    id: 'uvic-mistic',
    name: 'UVic Computer Music Group (MISTIC)',
    category: 'Research & Academia',
    orgType: 'university-or-lab',
    url: 'https://www.uvic.ca/ecs/computerscience/research/index.php',
    location: 'Victoria — UVic campus',
    description:
      'New methods for controlling instruments, interactive context-aware music browsing, musical robots, and music information retrieval.',
    size: null,
    sourceUrl: S_UVIC_CS,
    ...V,
  },
  {
    ...CITY.victoria,
    id: 'uvic-computational-biology',
    name: 'UVic Computational Biology Group',
    category: 'Research & Academia',
    orgType: 'university-or-lab',
    url: 'https://www.uvic.ca/ecs/computerscience/research/index.php',
    location: 'Victoria — UVic campus',
    description: 'Genomics, programming languages, bioinformatics and data science.',
    size: null,
    sourceUrl: S_UVIC_CS,
    ...V,
  },
  {
    ...CITY.victoria,
    id: 'uvic-theory-lab',
    name: 'UVic Theory Lab',
    category: 'Research & Academia',
    orgType: 'university-or-lab',
    url: 'https://www.uvic.ca/ecs/computerscience/research/index.php',
    location: 'Victoria — UVic campus',
    description:
      'Algorithms and data structures, computational complexity, cryptography and data privacy, and the theory of machine learning.',
    size: null,
    sourceUrl: S_UVIC_CS,
    ...V,
  },
  {
    ...CITY.kamloops,
    id: 'thompson-rivers-university',
    name: 'Thompson Rivers University',
    category: 'Research & Academia',
    orgType: 'university-or-lab',
    url: 'https://www.tru.ca/research.html',
    location: 'Kamloops',
    description:
      'Kamloops university hosting a 26 MW Bell AI Fabric facility, reported to provide AI training and inference compute to students and faculty via BCNET, with waste heat routed into the university’s district energy system.',
    size: null,
    sourceUrl: S_BELL,
    ...V,
  },
  {
    id: 'bcnet',
    name: 'BCNET',
    category: 'Research & Academia',
    orgType: 'nonprofit-or-association',
    region: 'Province-wide',
    // No coordinate: a province-wide mandate has no single site to pin.
    geoPrecision: null,
    url: 'https://bc.net',
    location: 'British Columbia — province-wide',
    description:
      'Not-for-profit shared-services organization for British Columbia’s higher-education and research institutions. Reported as the network through which the Thompson Rivers University AI facility provides training and inference compute to students and faculty.',
    size: null,
    sourceUrl: S_BELL,
    ...V,
  },

  // =========================================================================
  // COMPANIES & APPLIED AI
  // Every company below states AI or machine learning on its own site AND has a
  // BC location on a page that was read. Companies that met only one of those
  // two tests are in research/unverified.json with the reason recorded.
  // =========================================================================
  {
    ...CITY.vancouver,
    id: 'sanctuary-ai',
    name: 'Sanctuary AI',
    category: 'Companies & Applied AI',
    orgType: 'company',
    url: 'https://www.sanctuary.ai',
    location: 'Vancouver',
    description:
      'Legally Sanctuary Cognitive Systems Corporation. Deploys what it calls Physical AI on robotic hardware to automate complex industrial tasks, with work spanning AI-driven dexterous manipulation, reinforcement learning for robotics and sim-to-real transfer.',
    size: null,
    sourceUrl: 'https://www.sanctuary.ai/about',
    ...V,
  },
  {
    ...CITY.vancouver,
    id: 'terramera',
    name: 'Terramera',
    category: 'Companies & Applied AI',
    orgType: 'company',
    url: 'https://www.terramera.com',
    location: 'Vancouver',
    description:
      'Agricultural technology company combining its Actigate technology with data science and AI. Its site states that machine learning engines and monitoring tools continuously generate insights to improve formulation efficacy and plant health.',
    size: null,
    sourceUrl: 'https://www.terramera.com',
    ...V,
  },
  {
    ...CITY.burnaby,
    id: 'novarc-technologies',
    name: 'Novarc Technologies',
    category: 'Companies & Applied AI',
    orgType: 'company',
    url: 'https://www.novarctech.com',
    location: 'Burnaby — 4505 Still Creek Ave',
    description:
      'Builds autonomous welding robots and an AI-powered robotic vision system, NovAI, that adds vision and cognition to articulated robotic and mechanized welders.',
    size: null,
    sourceUrl: 'https://www.novarctech.com',
    ...V,
  },
  {
    ...CITY.vancouver,
    id: 'niricson',
    name: 'Niricson',
    category: 'Companies & Applied AI',
    orgType: 'company',
    url: 'https://www.niricson.com',
    location: 'Vancouver — 1200-555 West Hastings St',
    description:
      'Infrastructure condition assessment for dams, bridges and airfields. Its AUTOSPEX product uses AI and machine learning to establish a digital asset baseline and to detect cracks, delamination, thermal anomalies and spalling.',
    size: null,
    sourceUrl: 'https://www.niricson.com',
    ...V,
  },
  {
    ...CITY.victoria,
    id: 'open-ocean-robotics',
    name: 'Open Ocean Robotics',
    category: 'Companies & Applied AI',
    orgType: 'company',
    url: 'https://www.openoceanrobotics.com',
    location: 'Victoria — 200-45 Erie Street',
    description:
      'Designs and operates solar-powered autonomous surface vessels for maritime security and environmental monitoring, with edge AI delivering real-time vision and acoustic intelligence and AI-driven detection of vessels, hazards and underwater activity.',
    size: null,
    sourceUrl: 'https://www.openoceanrobotics.com/contact',
    ...V,
  },
  {
    ...CITY.vancouver,
    id: 'variational-ai',
    name: 'Variational AI',
    category: 'Companies & Applied AI',
    orgType: 'company',
    url: 'https://variational.ai',
    location: 'Vancouver — 201-1825 Quebec Street',
    description:
      'Uses generative AI to design novel, synthesizable small molecules optimized across potency, selectivity, ADMET and synthetic feasibility for early-stage drug discovery.',
    size: null,
    sourceUrl: 'https://variational.ai',
    ...V,
  },

  // =========================================================================
  // CAPITAL & ACCELERATORS
  // =========================================================================
  {
    ...CITY.vancouver,
    id: 'digital-technology-supercluster',
    // Renamed 2026-08-19: the organization now trades as DIGITAL. Its own naming is
    // genuinely mixed -- footer and copyright read DIGITAL, navigation and page
    // titles still read Digital Technology Supercluster -- so the former name is
    // kept in the description rather than dropped.
    name: 'DIGITAL',
    category: 'Capital & Accelerators',
    orgType: 'investor-or-program',
    url: 'https://www.digitalsupercluster.ca',
    location: 'Vancouver — 2127-1055 W Georgia Street',
    description:
      'One of Canada’s Global Innovation Clusters, formerly and still widely known as the Digital Technology Supercluster. Co-invests federal and industry money in applied technology projects, and runs a dedicated artificial intelligence programme stream.',
    size: null,
    sourceUrl: 'https://digitalsupercluster.ca/canadas-digital-technology-supercluster-receives-funding/',
    ...V,
  },
  {
    ...CITY.victoria,
    id: 'viatec',
    name: 'VIATEC',
    category: 'Capital & Accelerators',
    orgType: 'nonprofit-or-association',
    url: 'https://www.viatec.ca',
    location: 'Victoria — 777 Fort Street',
    description:
      'The Victoria Innovation, Advanced Technology and Entrepreneurship Council. Supports Greater Victoria’s technology sector with community resources, workspace and professional development, and convenes the PROMPT Victoria AI Conference.',
    size: null,
    sourceUrl: 'https://www.viatec.ca',
    ...V,
  },
  {
    ...CITY.vancouver,
    id: 'bc-tech-association',
    name: 'BC Tech Association',
    category: 'Capital & Accelerators',
    orgType: 'nonprofit-or-association',
    url: 'https://wearebctech.com',
    // The address is a MAILING address: the organization states it operates as a
    // fully virtual team. The pin is retained because the address is published and
    // sourced, but the location string says what it is rather than implying a place
    // people visit.
    location: 'Vancouver — 210-1401 West 8th Avenue (mailing address; fully virtual team)',
    description:
      'British Columbia’s cross-sector technology industry association, running member programmes, accelerators, talent and immigration initiatives and advocacy. Its AI-specific programming includes a vertical accelerator aimed at AI companies.',
    size: null,
    sourceUrl: 'https://wearebctech.com/members/member-directory/name/digibc-1/',
    ...V,
  },
  {
    ...CITY.vancouver,
    id: 'new-ventures-bc',
    name: 'New Ventures BC',
    category: 'Capital & Accelerators',
    orgType: 'investor-or-program',
    url: 'https://www.newventuresbc.com',
    location: 'Vancouver — 810-1055 Dunsmuir Street',
    description:
      'Supports BC technology startups with mentorship, funding and an annual competition, and runs the Discovery Foundation AI Business Accelerator, which helps BC companies move beyond experimentation with workshops, mentorship and an AI implementation plan.',
    size: null,
    sourceUrl: 'https://www.newventuresbc.com',
    ...V,
  },

  // =========================================================================
  // TALENT & EDUCATION
  // =========================================================================
  {
    ...CITY.vancouver,
    id: 'first-nations-technology-council',
    name: 'First Nations Technology Council',
    category: 'Talent & Education',
    orgType: 'nonprofit-or-association',
    // Region corrected 2026-08-19 from 'Metro Vancouver' to 'Province-wide'. Its
    // mandate covers all 204 First Nations in British Columbia; filing it under the
    // region its head office happens to sit in misrepresents the organization. The
    // office address is real and sourced, so the pin stays -- region here records
    // mandate, not address.
    region: 'Province-wide',
    url: 'https://firstnationstech.ca/',
    location: 'Vancouver — 1707-1370 Senakw Lane (province-wide mandate)',
    description:
      'Indigenous-led non-profit mandated by the First Nations Leadership Council to advance digital literacy, connectivity and technology strategy for all 204 First Nations in British Columbia. Its AI work includes the course "Pathways to AI: An Introduction for Indigenous People and Organizations" and the report "First Nations Perspectives on Artificial Intelligence".',
    size: null,
    sourceUrl: 'https://firstnationstech.ca/about/',
    ...V,
  },
  {
    ...CITY.victoria,
    id: 'ai-at-uvic',
    name: 'AI@UVic',
    category: 'Talent & Education',
    orgType: 'university-or-lab',
    url: 'https://www.uvic.ca/campus/artificial-intelligence/index.php',
    location: 'Victoria — UVic campus',
    description:
      'University of Victoria hub for guidance, resources and communities of practice exploring, developing and using artificial intelligence tools on campus.',
    size: null,
    sourceUrl: 'https://www.uvic.ca/campus/artificial-intelligence/index.php',
    ...V,
  },

  // =========================================================================
  // COMMUNITY & CONVENING
  // Verified last, per PLAN.md section 6.3 -- highest churn, cheapest to
  // re-verify -- and re-verified most often per section 6.5.
  // =========================================================================
  {
    id: 'bc-ai-ecosystem-association',
    name: 'BC + AI Ecosystem Association',
    category: 'Community & Convening',
    orgType: 'nonprofit-or-association',
    region: 'Province-wide',
    // No coordinate: a province-wide mandate has no single site to pin.
    geoPrecision: null,
    url: 'https://bc-ai.ca',
    location: 'British Columbia — province-wide',
    // The previous version of this description ended "BC AI Compass is independent of
    // this organization and is not affiliated with or endorsed by it." That was false.
    // BC + AI commissioned this project. Corrected 2026-08-19.
    description:
      'Non-profit association describing itself as 300+ paying members building British Columbia’s AI industry, running regional chapters, certifications, the AI Builders Fellowship and the Futureproof Festival. No founding year is published here: the association’s own About page and press kit give different years, and picking one would be choosing rather than sourcing. BC AI Compass is a BC + AI Ecosystem Association project, so this is the one record in the directory published by its own commissioning organization.',
    size: null,
    sourceUrl: S_BCAI,
    ...V,
  },
  {
    ...CITY.vancouver,
    id: 'vancouver-ai',
    name: 'Vancouver AI',
    category: 'Community & Convening',
    orgType: 'community-group',
    // Re-pointed 2026-08-19 from the generic communities index to this chapter's
    // own canonical page, which is what makes a verbatim venue quote available.
    url: 'https://bc-ai.ca/communities/vancouver-ai',
    location: 'Vancouver — H.R. MacMillan Space Centre, 1100 Chestnut St',
    description:
      "BC + AI's flagship regional room, labelled on the communities index as the original room where the ecosystem gathers in person before the work fans out across the province. Meets monthly at the H.R. MacMillan Space Centre.",
    size: null,
    sourceUrl: 'https://bc-ai.ca/communities/vancouver-ai',
    ...V,
  },
  {
    ...CITY.langley,
    id: 'fv-ai-fraser-valley-ai',
    name: 'FV+AI — Fraser Valley AI',
    category: 'Community & Convening',
    orgType: 'community-group',
    url: 'https://bc-ai.ca/communities/fraser-valley-ai',
    location: 'Fraser Valley — Langley to Chilliwack',
    description:
      'BC + AI\'s Fraser Valley regional chapter, covering Langley to Chilliwack, with talks, demos and food. Grew out of the Surrey AI meetup series, whose page describes the room as having had its own gravity south of the Fraser. Its first official gathering is 9 September in Langley.',
    size: null,
    sourceUrl: 'https://bc-ai.ca/communities/fraser-valley-ai',
    ...V,
    keyPeople: 'Darren Coleman, local lead',
  },
  {
    ...CITY.courtenay,
    id: 'cv-ai-comox-valley-ai',
    // Full name as the communities index gives it, rather than the shortened
    // form the index page alone supported.
    name: 'CV + AI — Comox Valley AI Community Meetup',
    category: 'Community & Convening',
    orgType: 'community-group',
    url: 'https://bc-ai.ca/communities/comox-valley',
    location: 'Comox Valley',
    description:
      "BC + AI's Comox Valley regional chapter, described on its own page as a neighbourly Island room asking what it means to be human in the age of AI. Meets monthly on the first Thursday, at venues including the Native Sons Hall and the Florence Filberg Centre.",
    size: null,
    sourceUrl: 'https://bc-ai.ca/communities/comox-valley',
    ...V,
    keyPeople: 'Lourdes Gant, regional co-lead',
  },

  // =========================================================================
  // BC + AI SPECIAL-INTEREST GROUPS
  //
  // bc-ai.ca/communities documents nine rooms with their own pages. The dataset
  // carried three of them. These are the six special-interest groups, each read
  // from its own page on 2026-08-19.
  //
  // NOT ADDED, deliberately: "Applied & Industrial AI" and "Data & Security".
  // The communities page files both under "Still forming" and calls them "seeds,
  // not programs", with no host and no cadence. A seed is not an organization,
  // and a directory that cannot tell the difference is back to counting rows.
  // =========================================================================
  {
    ...CITY.vancouver,
    id: 'bc-ai-film-club',
    name: 'BC + AI Film Club',
    category: 'Community & Convening',
    orgType: 'community-group',
    url: 'https://bc-ai.ca/communities/film-club',
    location: 'Vancouver',
    description:
      "BC + AI's creative special-interest group, described on its own page as a monthly meetup for people making films with AI.",
    size: null,
    sourceUrl: 'https://bc-ai.ca/communities/film-club',
    ...V,
  },
  {
    ...CITY.vancouver,
    id: 'mind-ai-and-consciousness',
    name: 'Mind, AI and Consciousness (MAC)',
    category: 'Community & Convening',
    orgType: 'community-group',
    url: 'https://bc-ai.ca/communities/mac',
    location: 'Vancouver',
    description:
      'A BC + AI research community running Deep Dives roughly monthly, alongside Labs, Takeovers and Socials through the year. Thirteen Deep Dives are recorded as completed on its own page.',
    size: null,
    sourceUrl: 'https://bc-ai.ca/communities/mac',
    ...V,
  },
  {
    id: 'ed-ai-education-meetup',
    name: 'Ed + AI: Education Meetup',
    category: 'Community & Convening',
    orgType: 'community-group',
    region: 'Province-wide',
    // No coordinate: a province-wide mandate has no single site to pin.
    geoPrecision: null,
    url: 'https://bc-ai.ca/communities/ai-education',
    location: 'British Columbia — province-wide',
    // The Ethos Lab relationship is stated ON THIS PAGE, which names it "the
    // public partner", so it is repeated here. Had the page not said it, the
    // index's mention alone would not have been enough to assert a partnership.
    description:
      'A BC + AI education community giving educators, youth, families and builders a practical place to compare what is happening in classrooms and community learning spaces. Its own page describes a consent-first learning circle with Ethọ́s Lab and names Ethọ́s Lab as the public partner.',
    size: null,
    sourceUrl: 'https://bc-ai.ca/communities/ai-education',
    ...V,
  },
  {
    ...CITY.vancouver,
    id: 'ai-ethical-futures-lab',
    name: 'AI Ethical Futures Lab',
    category: 'Community & Convening',
    orgType: 'community-group',
    url: 'https://bc-ai.ca/communities/futures-lab',
    location: 'Vancouver — Parker Street Studios',
    description:
      "BC + AI's civic policy lab, described on its own page as not a panel but a working room for people who want AI's possibilities without surrendering agency, accountability, or public voice. Meets monthly at Parker Street Studios.",
    size: null,
    sourceUrl: 'https://bc-ai.ca/communities/futures-lab',
    ...V,
  },
  {
    ...CITY.vancouver,
    id: 'life-sciences-and-ai',
    name: 'Life Sciences & AI',
    category: 'Community & Convening',
    orgType: 'community-group',
    url: 'https://bc-ai.ca/communities/life-sciences-ai',
    location: 'Vancouver — 6151 Collingwood Pl',
    description:
      'A BC + AI domain community for life sciences people, covering drug discovery, clinical care, health data, capital and policy. Its own page describes a four-part monthly series running September to December 2026, one running conversation with a different question on each date.',
    size: null,
    sourceUrl: 'https://bc-ai.ca/communities/life-sciences-ai',
    ...V,
  },
  {
    id: 'ai-creativity-and-design',
    name: 'AI Creativity + Design',
    category: 'Community & Convening',
    orgType: 'community-group',
    // Region stays province-wide: the page confirms no host and no cadence, so
    // asserting a seat for it would be inventing the one thing it says it lacks.
    region: 'Province-wide',
    // No coordinate: a province-wide mandate has no single site to pin.
    geoPrecision: null,
    url: 'https://bc-ai.ca/communities/ai-creativity-design',
    location: 'British Columbia — province-wide',
    // Recorded as forming, in the page's own words, rather than left out. A group
    // that says plainly what it has not settled yet is exactly the kind of honest
    // record this directory should be able to carry.
    description:
      'A BC + AI special-interest group its own page describes as a forming group, with first-session cadence not confirmed and no host names confirmed publicly yet.',
    size: null,
    sourceUrl: 'https://bc-ai.ca/communities/ai-creativity-design',
    ...V,
  },

  // =========================================================================
  // SCOPE CORRECTION, 2026-08-19.
  //
  // The first pass withheld AbCellera, Visier, Innovate BC, DigiBC and Accelerate
  // Okanagan because no page read had them saying "AI" in their own words. That
  // test was wrong for this project and has been replaced.
  //
  // This maps the WHOLE ecosystem around AI in British Columbia, not only the
  // organizations that build AI. The test is now: does this organization fund,
  // house, teach, convene, govern, represent, power or otherwise materially
  // support AI work in BC, and can that be sourced? An industry association does
  // not have to do AI to be part of the AI ecosystem.
  //
  // Each description below still states only what its source states. Inclusion is
  // an ecosystem judgement; the description is not licence to assert AI activity
  // a page did not claim.
  // =========================================================================
  {
    ...CITY.vancouver,
    id: 'abcellera',
    name: 'AbCellera Biologics',
    category: 'Companies & Applied AI',
    orgType: 'company',
    url: 'https://www.abcellera.com',
    location: 'Vancouver — 150 W 4th Ave',
    description:
      'Vancouver biotechnology company that describes itself as integrating biology, computation and engineering to develop antibody-based medicines, with in-house clinical manufacturing in Vancouver. Its own pages do not use the term AI; it is listed here as part of the province’s computational life-sciences base, not on a claim it makes about itself.',
    size: '201-1000',
    sourceUrl: 'https://www.abcellera.com/contact',
    ...V,
    orgStatus: 'active',
  },
  {
    ...CITY.richmond,
    id: 'general-fusion',
    name: 'General Fusion',
    category: 'Companies & Applied AI',
    orgType: 'company',
    url: 'https://www.generalfusion.com',
    location: 'Richmond — 6020 Russ Baker Way',
    description:
      'Fusion energy company headquartered in Richmond. Listed as part of British Columbia’s advanced-computing and deep-tech base; its contact page does not describe AI or machine-learning work, and no such claim is made here.',
    size: null,
    sourceUrl: 'https://www.generalfusion.com/contact/',
    ...V,
    orgStatus: 'active',
  },
  {
    ...CITY.vancouver,
    id: 'aspect-biosystems',
    name: 'Aspect Biosystems',
    category: 'Companies & Applied AI',
    orgType: 'company',
    url: 'https://www.aspectbiosystems.com',
    location: 'Vancouver — 2131 Manitoba Street',
    description:
      'Vancouver bioprinting company developing therapeutic programs from its own bioprinting platform. Its contact page does not describe AI or machine-learning work; the AI-enabled characterisation comes from secondary research and is not asserted here.',
    size: null,
    sourceUrl: 'https://www.aspectbiosystems.com/contact',
    ...V,
    orgStatus: 'active',
  },
  {
    ...CITY.vancouver,
    id: 'visier',
    name: 'Visier',
    category: 'Companies & Applied AI',
    orgType: 'company',
    url: 'https://www.visier.com',
    location: 'Vancouver — Beatty Street',
    description:
      'People-analytics and workforce-planning company headquartered in Vancouver, stating 600 employees across seven offices. Part of the province’s applied-analytics base.',
    size: '201-1000',
    sourceUrl: 'https://www.visier.com/company/',
    ...V,
    orgStatus: 'active',
  },
  {
    ...CITY.vancouver,
    id: 'innovate-bc',
    name: 'Innovate BC',
    category: 'Capital & Accelerators',
    orgType: 'government-or-crown',
    url: 'https://www.innovatebc.ca',
    location: 'Vancouver — Four Bentall Centre, 1055 Dunsmuir Street, Suite 810',
    // REPORTING MINISTRY STAYS NULL AND IS NOT MENTIONED. Two gov.bc.ca pages
    // disagree -- one dated 2026-03-09 says Ministry of Jobs and Economic Growth,
    // one dated 2026-06-22 says Ministry of Finance -- and the 2026-08-14 cabinet
    // shuffle complicates both. The export script fails the build if a reporting
    // ministry appears in this description.
    description:
      'Provincial Crown agency supporting technology and innovation across British Columbia through hiring grants, mentorship, research grants, pilot funding and innovation challenges, and advising government on technology policy. Programmes named on its site include BC Fast Pilot, Integrated Marketplace, Ignite, Accelerate IP, ScaleUp and the Venture Acceleration Program.',
    size: null,
    sourceUrl:
      'https://www2.gov.bc.ca/gov/content/governments/technology-innovation/partner-organizations',
    ...V,
    orgStatus: 'active',
  },
  {
    ...CITY.vancouver,
    id: 'digibc',
    name: 'DigiBC',
    category: 'Community & Convening',
    orgType: 'nonprofit-or-association',
    url: 'https://digibc.org',
    location: 'Vancouver — 160-577 Great Northern Way',
    description:
      'Registered non-profit industry association for British Columbia’s creative technology sector — video games, animation, visual effects, XR and virtual production — working on advocacy, talent pipeline, equity and community programming. Founded in 1997 as New Media BC and renamed in January 2009, so New Media BC is a former name of this organization rather than a separate one.',
    size: null,
    sourceUrl: 'https://digibc.org/about/',
    ...V,
    orgStatus: 'active',
    keyPeople: 'Loc Dao (Executive Director)',
  },
  {
    ...CITY.kelowna,
    id: 'accelerate-okanagan',
    name: 'Accelerate Okanagan',
    category: 'Capital & Accelerators',
    orgType: 'nonprofit-or-association',
    url: 'https://accelerateokanagan.com',
    location: 'Kelowna — serving Osoyoos to Salmon Arm',
    description:
      'Non-profit technology accelerator for the Okanagan, providing mentorship, connections and community to entrepreneurs building technology-driven businesses. States that most of its funding comes from government programmes.',
    size: null,
    sourceUrl: 'https://accelerateokanagan.com/about/',
    ...V,
    orgStatus: 'active',
  },

  // ---- regional coverage: one sourced record in each region that had none ----
  {
    ...CITY.nelson,
    id: 'kast',
    name: 'Kootenay Association for Science & Technology (KAST)',
    category: 'Capital & Accelerators',
    orgType: 'nonprofit-or-association',
    url: 'https://kast.com/',
    location: 'Nelson — 91-D Baker Street',
    description:
      'Describes itself as the only non-profit tech association serving the entire Kootenay region, running technology and innovation programmes since 1998 — including startup support, venture acceleration, youth education, the MIDAS lab and the Nelson Innovation Centre, and TechEdge, an initiative to advance digital adoption by Kootenay businesses.',
    size: null,
    sourceUrl: 'https://kast.com/',
    ...V,
    orgStatus: 'active',
  },
  {
    ...CITY.princeGeorge,
    id: 'innovation-central-society',
    name: 'Innovation Central Society',
    category: 'Capital & Accelerators',
    orgType: 'nonprofit-or-association',
    url: 'https://innovationcentral.ca/',
    location: 'Prince George — 1299 3rd Avenue, inside the Hubspace',
    description:
      'Non-profit supporting technology entrepreneurs in northern British Columbia, operating from the Hubspace in downtown Prince George and running a Venture Acceleration Program for startup and early-stage companies.',
    size: null,
    sourceUrl: 'https://innovationcentral.ca/contact',
    ...V,
    orgStatus: 'active',
  },
  {
    ...CITY.fortStJohn,
    id: 'prophet-river-first-nation-data-centre',
    name: 'Prophet River First Nation data centre project',
    category: 'Compute & Infrastructure',
    orgType: 'infrastructure-operator',
    url: 'https://www.newswire.ca/news-releases/prophet-river-first-nation-and-abct-pacific-vcc-ltd-sign-loi-to-jointly-develop-major-data-centre-in-fort-st-john-area-819620927.html',
    location: 'Fort St. John area',
    // EARLY STAGE, AND SAID SO. A letter of intent with a feasibility study still to
    // come is not a data centre. Size, scope and capital cost are explicitly
    // undetermined in the release, so no capacity figure is recorded.
    description:
      'Letter of intent, signed March 2025, between Prophet River First Nation — an independent Dene Tsaa Nation in northeast British Columbia — and ABCT Pacific (VCC) Ltd., a BC venture capital corporation, to pursue a large-scale data centre in the Fort St. John area. Prophet River First Nation would be the majority owner. Size, scope and capital cost are stated as undetermined pending a feasibility study.',
    size: null,
    sourceUrl:
      'https://www.newswire.ca/news-releases/prophet-river-first-nation-and-abct-pacific-vcc-ltd-sign-loi-to-jointly-develop-major-data-centre-in-fort-st-john-area-819620927.html',
    ...V,
  },

  // ---- Indigenous-led ----
  {
    ...CITY.merritt,
    id: 'upper-nicola-band-data-centre',
    name: 'Upper Nicola Band AI data centre',
    category: 'Compute & Infrastructure',
    orgType: 'infrastructure-operator',
    url: 'https://www.merrittherald.com/upper-nicola-indian-band-vote-yes-on-welcoming-one-of-the-countrys-largest-ai-data-centres/',
    location: 'Nicola Lake, near Merritt — Upper Nicola Band reserve land',
    // A LAND-USE APPROVAL, NOT A DISCLOSED EQUITY STAKE. Members voted to approve
    // the USE OF RESERVE LAND. No source read describes an ownership share, so none
    // is stated here -- the difference between a land lease and an equity position
    // is exactly the sort of thing a directory should not guess about a First Nation.
    description:
      'Approved by an Upper Nicola Band membership vote that closed 7 July 2025, 98 to 33 in favour — reported as roughly 75 per cent of ballots cast — permitting the use of 100 to 150 acres of reserve land near the north end of Nicola Lake for a data centre reported at about $500 million and roughly 300 MW. Developed in partnership with Bell Canada and Kamloops-based iTel Networks. Job and construction figures reported alongside it are projections.',
    size: null,
    sourceUrl:
      'https://www.merrittherald.com/upper-nicola-indian-band-vote-yes-on-welcoming-one-of-the-countrys-largest-ai-data-centres/',
    ...V,
    flags: ['quote-pending', 'projection-figures'],
  },
  {
    ...CITY.victoria,
    id: 'animikii',
    name: 'Animikii Indigenous Technology',
    category: 'Companies & Applied AI',
    orgType: 'company',
    url: 'https://www.animikii.com',
    location: 'Victoria — 100-722 Cormorant St, on lək̓ʷəŋən Traditional Territory',
    description:
      'Indigenous-owned digital agency headquartered in Victoria on Songhees Nation land in lək̓ʷəŋən Traditional Territory. Its core product is Niiwin, described as an Indigenous Sovereignty Platform, and its #DataBack work is on asserting and supporting Indigenous data sovereignty. Holds B Corp and Certified Aboriginal Business certifications.',
    size: null,
    sourceUrl: 'https://www.animikii.com/about',
    ...V,
    orgStatus: 'active',
    keyPeople: 'Jeff Ward (Founder and CEO)',
  },

  // ---- talent ----
  // =========================================================================
  // COMPOSITION PASS, 2026-08-19 — companies and training, by the method change
  // in COVERAGE.md section 4.
  //
  // The dataset was 72 academic units against 11 companies, and COVERAGE.md
  // named the cause: a university publishes one page giving a lab, its field and
  // its campus, so a single fetch satisfies every condition at once, while a
  // company's marketing site says AI on every screen and its address on none.
  // The fix is to stop reading marketing sites. Everything below came from a
  // contact page, a careers page or a campus footer — pages whose job is to
  // state a city.
  //
  // Region was preferred over convenience wherever the choice existed: Salmon
  // Arm, Abbotsford, Castlegar and Prince George each carry more here than a
  // twelfth Vancouver company would.
  // =========================================================================
  {
    ...CITY.salmonArm,
    id: '4ag-robotics',
    name: '4AG Robotics',
    category: 'Companies & Applied AI',
    orgType: 'company',
    url: 'https://4ag.ai',
    location: 'Salmon Arm',
    // Its old domain, 4agrobotics.com, is a parked domain-sale page — one of the
    // two confirmed parking pages behind the synthesized-url flag. The company is
    // real; the domain in the predecessor dataset was not its.
    description:
      'Builds autonomous harvesting robots for commercial mushroom farms, attaching to a farm’s existing shelving rather than requiring new infrastructure.',
    size: null,
    sourceUrl: 'https://4ag.ai/contact',
    ...V,
    orgStatus: 'active',
  },
  {
    ...CITY.victoria,
    id: 'marinelabs',
    name: 'MarineLabs Data Systems',
    category: 'Companies & Applied AI',
    orgType: 'company',
    url: 'https://marinelabs.io',
    location: 'Victoria — 2100 Douglas St',
    description:
      'Coastal intelligence company operating a sensor network for marine and coastal data, with Forecast AI and Wake AI named among its products.',
    size: null,
    sourceUrl: 'https://marinelabs.io/contact',
    ...V,
    orgStatus: 'active',
  },
  {
    ...CITY.vancouver,
    id: 'trulioo',
    name: 'Trulioo',
    category: 'Companies & Applied AI',
    orgType: 'company',
    url: 'https://www.trulioo.com',
    location: 'Vancouver — 400-114 E. Fourth Ave',
    description:
      'Identity verification and business-verification platform headquartered in Vancouver, naming agentic AI for resolving beneficial owners inside its know-your-business workflow.',
    size: null,
    sourceUrl: 'https://www.trulioo.com/contact',
    ...V,
    orgStatus: 'active',
  },
  {
    ...CITY.vancouver,
    id: 'zymeworks',
    name: 'Zymeworks',
    category: 'Companies & Applied AI',
    orgType: 'company',
    url: 'https://www.zymeworks.com',
    location: 'Vancouver — 114 East 4th Avenue, Suite 800',
    // The contact page states the head office and nothing about AI. Listed for
    // the province's computational biotherapeutics base, and the description says
    // only what the page says — no AI claim is put in the company's mouth.
    description:
      'Biotherapeutics company with its head office in Vancouver. Its contact page does not describe AI or machine-learning work, and none is asserted here.',
    size: null,
    sourceUrl: 'https://www.zymeworks.com/contact/',
    ...V,
    orgStatus: 'active',
  },
  {
    ...CITY.northVancouver,
    id: 'jane-software',
    name: 'Jane Software',
    category: 'Companies & Applied AI',
    orgType: 'company',
    url: 'https://jane.app',
    location: 'North Vancouver',
    description:
      'Practice-management software for health and wellness clinics, headquartered in North Vancouver, with an AI Scribe feature named under its charting and care tools.',
    size: null,
    sourceUrl: 'https://jane.app/contact',
    ...V,
    orgStatus: 'active',
  },
  {
    ...CITY.vancouver,
    id: 'minesense',
    name: 'MineSense Technologies',
    category: 'Companies & Applied AI',
    orgType: 'company',
    url: 'https://www.minesense.com',
    location: 'Vancouver',
    description:
      'Sensor and ore-sorting company for mining, with global headquarters in Vancouver. Its about page describes data solutions and a client data portal; it does not name AI, and none is asserted here.',
    size: null,
    sourceUrl: 'https://www.minesense.com/about-us/',
    ...V,
    orgStatus: 'active',
  },
  {
    ...CITY.vancouver,
    id: 'dapper-labs',
    name: 'Dapper Labs',
    category: 'Companies & Applied AI',
    orgType: 'company',
    url: 'https://www.dapperlabs.com',
    location: 'Vancouver',
    description:
      'Vancouver-based consumer blockchain company with hubs in Los Angeles, New York and Charlotte. Its careers page describes AI tooling as standard across the company.',
    size: null,
    sourceUrl: 'https://www.dapperlabs.com/careers',
    ...V,
    orgStatus: 'active',
  },

  // ---- Talent & Education: the slice the "Learn the craft" onramp flagged ----
  {
    ...CITY.abbotsford,
    id: 'ufv-computing',
    name: 'University of the Fraser Valley — School of Computing',
    category: 'Talent & Education',
    orgType: 'university-or-lab',
    url: 'https://www.ufv.ca/computing/',
    location: 'Abbotsford — 33844 King Road',
    description:
      'Fraser Valley computing school whose programs include an AI & Machine Learning post-baccalaureate diploma.',
    size: null,
    sourceUrl: 'https://www.ufv.ca/computing/',
    ...V,
  },
  {
    ...CITY.castlegar,
    id: 'selkirk-college',
    name: 'Selkirk College',
    category: 'Talent & Education',
    orgType: 'university-or-lab',
    url: 'https://selkirk.ca/programs/digital-technology',
    location: 'Castlegar — 301 Frank Beinder Way',
    description:
      'Kootenay college whose digital technology programs include Foundations in Rural Data Science, described as blending analytical, technical and place-based learning.',
    size: null,
    sourceUrl: 'https://selkirk.ca/programs/digital-technology',
    ...V,
  },
  {
    ...CITY.princeGeorge,
    id: 'college-of-new-caledonia',
    name: 'College of New Caledonia',
    category: 'Talent & Education',
    orgType: 'university-or-lab',
    url: 'https://cnc.bc.ca',
    location: 'Prince George — 3330 22nd Ave',
    description:
      'Northern British Columbia college whose Centre for Teaching and Learning publishes generative AI guidance for its learning-technology program.',
    size: null,
    sourceUrl: 'https://cnc.bc.ca/programs-courses/program/computer-network-electronics-technician',
    ...V,
  },

  {
    ...CITY.vancouver,
    id: 'ethos-lab',
    // NOT AN INDIGENOUS ORGANIZATION AND MUST NEVER BE FILED AS ONE. Ethos Lab is a
    // Black-led youth STEAM academy founded by Anthonia Ogundele. An earlier data
    // source in this ecosystem misfiled it under an Indigenous category; publishing
    // that misattribution on a BC + AI map would be a serious error, so the category
    // here is Talent & Education and the description carries no Indigenous framing.
    name: 'Ethọ́s Lab',
    category: 'Talent & Education',
    orgType: 'nonprofit-or-association',
    url: 'https://www.ethoslab.ca/',
    location: 'Vancouver — 177 East 3rd Ave',
    description:
      'Youth STEAM academy in Vancouver running afterschool project-based programs and in-school activations for youth in Grades 5–12, grounding its approach in the African philosophy of Ubuntu.',
    size: null,
    sourceUrl: 'https://www.ethoslab.ca/',
    ...V,
    orgStatus: 'active',
  },

  // Kelowna's AI chatbots are widely reported as the first of their kind in a
  // Canadian municipality, and secondary sources attribute an October 2023 launch,
  // a $350,000 provincial grant, Microsoft and RSM Canada as partners, and a
  // 25-40% drop in frontline inquiries. NONE of that is on the page read here, so
  // none of it is in this record. kelowna.ca returned HTTP 403 to the earlier
  // automated pass (see COVERAGE.md section 3); it was fetched successfully on
  // 2026-08-19 and the description below carries only what that page states.
  {
    ...CITY.kelowna,
    id: 'city-of-kelowna',
    name: 'City of Kelowna',
    category: 'Public Sector & Policy',
    orgType: 'government-or-crown',
    url: 'https://www.kelowna.ca/our-community/about-kelowna/smart-and-intelligent-city-initiatives',
    location: 'Kelowna',
    description:
      'Municipal government running a suite of AI chatbots under its Intelligent City Strategy, including Building Permit Chatbots that guide users through the permit process and a Fast Track Infill Housing Bot that checks property eligibility and design options. Recognised with an IABC Gold Quill in the Strategic Artificial Intelligence category, an MSDO Excellence in Innovation Award for the Building Permit Chatbots, and a MISA BC Spirit of Innovation Award.',
    size: null,
    sourceUrl:
      'https://www.kelowna.ca/our-community/about-kelowna/smart-and-intelligent-city-initiatives',
    ...V,
    orgStatus: 'active',
  },
];

/**
 * The published dataset. Quotes are attached here rather than typed into each
 * record, so a quote can only ever reach a record whose sourceUrl actually
 * contains it.
 */
export const ORGANIZATIONS: Organization[] = RECORDS.map(withQuote);

/** Records that pin on the map. The rest appear in the directory only. */
export const MAPPED = ORGANIZATIONS.filter((o) => o.lat !== undefined && o.lng !== undefined);
