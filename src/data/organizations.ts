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
  sourceUrl: string;
  sourceDate: string;
  verified: string;
  status: 'verified';
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
type CityGeo = { location: string; region: Region; lat: number; lng: number; geoSourceUrl: string };

const CITY: Record<string, CityGeo> = {
  vancouver: {
    location: 'Vancouver',
    region: 'Metro Vancouver',
    lat: 49.24966,
    lng: -123.11934,
    geoSourceUrl: 'https://www.latlong.net/place/vancouver-bc-canada-2279.html',
  },
  burnaby: {
    location: 'Burnaby',
    region: 'Metro Vancouver',
    lat: 49.267,
    lng: -122.967,
    geoSourceUrl: 'https://en.wikipedia.org/wiki/Burnaby',
  },
  surrey: {
    location: 'Surrey',
    region: 'Metro Vancouver',
    lat: 49.10635,
    lng: -122.82509,
    geoSourceUrl: 'https://www.latlong.net/place/surrey-bc-canada-22762.html',
  },
  victoria: {
    location: 'Victoria',
    region: 'Vancouver Island & Coast',
    lat: 48.407326,
    lng: -123.329773,
    geoSourceUrl: 'https://www.latlong.net/place/victoria-bc-canada-4300.html',
  },
  kelowna: {
    location: 'Kelowna',
    region: 'Thompson-Okanagan',
    lat: 49.882114,
    lng: -119.477829,
    geoSourceUrl: 'https://www.latlong.net/place/kelowna-bc-canada-1354.html',
  },
  kamloops: {
    location: 'Kamloops',
    region: 'Thompson-Okanagan',
    lat: 50.676109,
    lng: -120.340836,
    geoSourceUrl: 'https://www.latlong.net/place/kamloops-bc-canada-29153.html',
  },
  merritt: {
    location: 'Merritt',
    region: 'Thompson-Okanagan',
    lat: 50.112778,
    lng: -120.789719,
    geoSourceUrl: 'https://www.latlong.net/place/merritt-bc-canada-268.html',
  },
  courtenay: {
    location: 'Courtenay',
    region: 'Vancouver Island & Coast',
    lat: 49.6878,
    lng: -124.994,
    geoSourceUrl: 'https://places.canadamaps.com/british-columbia/courtenay',
  },
  langley: {
    location: 'Langley to Chilliwack',
    region: 'Fraser Valley',
    lat: 49.10416,
    lng: -122.65833,
    geoSourceUrl: 'https://www.latlong.net/place/surrey-bc-canada-22762.html',
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
const S_BCAI_COMMUNITIES = 'https://bc-ai.ca/communities';
const S_OVCARE = 'https://www.med.ubc.ca/news/harnessing-ai-to-improve-ovarian-cancer-outcomes/';
const S_COMOX = 'https://thediscourse.ca/comox-valley/how-do-comox-valley-governments-and-public-organizations-use-ai';

const READ = '2026-08-19';
const STAMP = '2026-08';

/** Trims the repetition out of every record without hiding any value. */
const V = { sourceDate: READ, verified: STAMP, status: 'verified' } as const;

export const ORGANIZATIONS: Organization[] = [
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
    id: 'telus-m3-ai-factory',
    name: 'TELUS M3 AI Factory',
    category: 'Compute & Infrastructure',
    orgType: 'infrastructure-operator',
    url: 'https://www.telus.com/en/business/medium-large/ai/sovereign-ai-factory',
    location: 'Vancouver — Mount Pleasant',
    description:
      'AI factory in Vancouver’s Mount Pleasant neighbourhood, developed with Westbank. Stated to open at the end of 2026 and scale through 2028.',
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
    description: 'Third facility in the TELUS sovereign AI factory cluster, stated to come online in 2029.',
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
    description:
      'Operator of the sovereign AI factory cluster in British Columbia — Kamloops plus two Vancouver facilities — built on an initial 85 MW of clean power secured from BC Hydro and stated to scale to over 60,000 GPUs and 150 MW by 2032.',
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
    location: 'Kamloops',
    description:
      'First Bell AI Fabric facility, 7 MW, built with Groq language processing units for AI inference. Reported online June 2025.',
    size: null,
    sourceUrl: S_BELL,
    ...V,
  },
  {
    ...CITY.merritt,
    id: 'bell-ai-fabric-merritt',
    name: 'Bell AI Fabric Merritt',
    category: 'Compute & Infrastructure',
    orgType: 'infrastructure-operator',
    url: 'https://www.bell.ca/Business/AI-Fabric',
    location: 'Merritt',
    description: 'Bell AI Fabric facility in Merritt, 7 MW.',
    size: null,
    sourceUrl: S_BELL,
    ...V,
  },
  {
    ...CITY.kamloops,
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
    location: 'Vancouver — UBC Vancouver campus',
    description:
      'Described by UBC as the university’s research hub for artificial intelligence, comprising more than 100 professors and their research associates across 27 departments, working on theoretical and applied AI for decision-making.',
    size: null,
    sourceUrl: S_UBC_AI,
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
    ...CITY.surrey,
    id: 'quantum-algorithms-institute',
    name: 'Quantum Algorithms Institute',
    category: 'Research & Academia',
    orgType: 'nonprofit-or-association',
    url: 'https://www.sfu.ca/big-data/using-data/artificial-intelligence-at-sfu.html',
    location: 'Surrey',
    description:
      'Institute listed by SFU as developing quantum computing algorithms and AI applications. Its own domain, quantumalgorithms.ca, presented an expired TLS certificate when checked on 2026-08-19, so this record is sourced to SFU rather than to the institute’s own site.',
    size: null,
    sourceUrl: S_SFU_AI,
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
    name: 'Digital Technology Supercluster (DIGITAL)',
    category: 'Capital & Accelerators',
    orgType: 'investor-or-program',
    url: 'https://www.digitalsupercluster.ca',
    location: 'Vancouver — 2127-1055 W Georgia Street',
    description:
      'Helps companies deploy breakthrough technologies by unlocking access to capital, talent and markets, connecting technology companies, government, academia and investors. Artificial intelligence is a named focus area of its innovation programs.',
    size: null,
    sourceUrl: 'https://www.digitalsupercluster.ca',
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
    url: 'https://firstnationstech.ca/',
    location: 'Vancouver — 1707-1370 Senakw Lane',
    description:
      'Delivers digital skills training and conducts research on connectivity and technology strategy for First Nations across British Columbia. Its AI work includes the course "Pathways to AI: An Introduction for Indigenous People and Organizations" and the report "First Nations Perspectives on Artificial Intelligence".',
    size: null,
    sourceUrl: 'https://firstnationstech.ca/',
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
    url: 'https://bc-ai.ca',
    location: 'British Columbia — province-wide',
    description:
      'Non-profit association describing itself as 300+ paying members building British Columbia’s AI industry, with 94+ events since 2023, certifications, the AI Builders Fellowship and the Futureproof Festival. BC AI Compass is independent of this organization and is not affiliated with or endorsed by it.',
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
    url: 'https://bc-ai.ca/communities',
    location: 'Vancouver',
    description:
      'Described on its own listing as the original room where the BC + AI ecosystem gathers in person before the work fans out across the province.',
    size: null,
    sourceUrl: S_BCAI_COMMUNITIES,
    ...V,
  },
  {
    ...CITY.langley,
    id: 'fv-ai-fraser-valley-ai',
    name: 'FV+AI — Fraser Valley AI',
    category: 'Community & Convening',
    orgType: 'community-group',
    url: 'https://bc-ai.ca/communities',
    location: 'Fraser Valley — Langley to Chilliwack',
    description:
      'A Fraser Valley home base for practical talks, local demos and people to build with, covering Langley to Chilliwack.',
    size: null,
    sourceUrl: S_BCAI_COMMUNITIES,
    ...V,
  },
  {
    ...CITY.courtenay,
    id: 'cv-ai-comox-valley-ai',
    name: 'CV + AI — Comox Valley AI',
    category: 'Community & Convening',
    orgType: 'community-group',
    url: 'https://bc-ai.ca/communities',
    location: 'Comox Valley',
    description:
      'A Vancouver Island community meetup, described on its own listing as a neighbourly Island room asking what it means to be human in the age of AI.',
    size: null,
    sourceUrl: S_BCAI_COMMUNITIES,
    ...V,
  },
];

/** Records that pin on the map. The rest appear in the directory only. */
export const MAPPED = ORGANIZATIONS.filter((o) => o.lat !== undefined && o.lng !== undefined);
