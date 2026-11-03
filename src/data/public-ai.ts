export const PUBLIC_AI_PRINCIPLES = [
  'Universal access',
  'Preservation',
  'Open infrastructure',
  'Privacy',
  'Accountability',
  'Public-interest AI',
] as const;

export const PUBLIC_AI_TYPES = ['Library', 'Archive', 'Data', 'Legal', 'Inference', 'Community', 'API'] as const;

export type PublicAiPrinciple = (typeof PUBLIC_AI_PRINCIPLES)[number];
export type PublicAiType = (typeof PUBLIC_AI_TYPES)[number];

export type PublicAiResource = {
  id: string;
  name: string;
  type: PublicAiType;
  url: string;
  description: string;
  practicalUse: string;
  principles: PublicAiPrinciple[];
  relatedOrgIds: string[];
  checked: string;
};

// Curated separately from the verified organization registry. A relatedOrgIds
// entry is a navigational relationship, never a Public AI certification.
export const PUBLIC_AI_RESOURCES: PublicAiResource[] = [
  {
    id: 'internet-archive',
    name: 'Internet Archive',
    type: 'Library',
    url: 'https://archive.org/',
    description: 'A nonprofit digital library preserving web pages, books, audio, video, and software for public access.',
    practicalUse: 'Find a preserved source, check an older version of a public page, or build a reading list with stable references.',
    principles: ['Universal access', 'Preservation', 'Privacy', 'Accountability'],
    relatedOrgIds: ['ubc-dmm', 'sfu-digital-democracies-institute'],
    checked: '2026-11-01',
  },
  {
    id: 'democracys-library',
    name: "Democracy's Library",
    type: 'Archive',
    url: 'https://blog.archive.org/2022/11/30/what-is-the-democracys-library/',
    description: 'A collaborative collection of government research and publications intended to preserve public records and keep them accessible.',
    practicalUse: 'Start here when you need to preserve government records or locate public-interest research across jurisdictions.',
    principles: ['Universal access', 'Preservation', 'Accountability'],
    relatedOrgIds: ['city-of-vancouver', 'bc-hydro', 'sfu-digital-democracies-institute'],
    checked: '2026-11-01',
  },
  {
    id: 'internet-archive-apis',
    name: 'Internet Archive Developer Portal',
    type: 'API',
    url: 'https://archive.org/services/docs/api/',
    description: 'Documented APIs and command-line tools for searching archive metadata and working with public digital collections.',
    practicalUse: 'Build a collection search, retrieve item metadata, or prototype a citation-aware research tool.',
    principles: ['Universal access', 'Open infrastructure', 'Preservation'],
    relatedOrgIds: ['ubc-dmm', 'ubc-data-science-institute'],
    checked: '2026-11-01',
  },
  {
    id: 'public-ai-inference',
    name: 'Public AI Inference Utility',
    type: 'Inference',
    url: 'https://publicai.co/',
    description: 'A nonprofit, open-source access point for public and sovereign AI models, with a web interface and model-serving infrastructure.',
    practicalUse: 'Try a public model before choosing infrastructure, or evaluate an open model for a public-interest prototype.',
    principles: ['Public-interest AI', 'Open infrastructure', 'Universal access'],
    relatedOrgIds: ['ubc-trustml', 'quantum-algorithms-institute', 'bc-ai-ecosystem-association'],
    checked: '2026-11-01',
  },
  {
    id: 'bc-public-compute',
    name: 'Public Compute Project',
    type: 'Data',
    url: 'https://bc-ai.ca/public-compute',
    description: 'An independent BC + AI public-interest framework and pilot registry for B.C. data-centre proposals, tracking ownership, electricity, costs, authority, and durable public value.',
    practicalUse: 'Check who owns a major compute proposal, separate requested from connected electricity, and review source-backed accountability questions, commitments, and missing information.',
    principles: ['Open infrastructure', 'Accountability', 'Public-interest AI'],
    relatedOrgIds: ['bc-ai-ecosystem-association'],
    checked: '2026-11-01',
  },
  {
    id: 'mozilla-common-voice',
    name: 'Mozilla Common Voice',
    type: 'Community',
    url: 'https://commonvoice.mozilla.org/',
    description: 'A community-created, open voice dataset that helps people build speech technology across languages and accents.',
    practicalUse: 'Contribute voice samples, validate recordings, or investigate language-local speech data for an accessibility project.',
    principles: ['Universal access', 'Public-interest AI', 'Open infrastructure'],
    relatedOrgIds: ['ubc-nlp-group', 'ubc-data-science-institute'],
    checked: '2026-11-01',
  },
  {
    id: 'wikidata',
    name: 'Wikidata',
    type: 'Data',
    url: 'https://www.wikidata.org/',
    description: 'A collaboratively edited, multilingual knowledge base of structured data that people and machines can read and reuse.',
    practicalUse: 'Resolve entities, connect public records, or add structured context to a knowledge-sharing prototype.',
    principles: ['Universal access', 'Open infrastructure', 'Accountability'],
    relatedOrgIds: ['ubc-dmm', 'ubc-nlp-group'],
    checked: '2026-11-01',
  },
  {
    id: 'mediawiki-api',
    name: 'MediaWiki Action API',
    type: 'API',
    url: 'https://www.mediawiki.org/wiki/API:Main_page',
    description: 'A documented web API for reading and working with MediaWiki sites, including search, page content, and metadata.',
    practicalUse: 'Build a searchable community knowledge base or retrieve wiki content with explicit source references.',
    principles: ['Open infrastructure', 'Universal access'],
    relatedOrgIds: ['ubc-dmm', 'ubc-data-science-institute'],
    checked: '2026-11-01',
  },
  {
    id: 'canlii',
    name: 'CanLII',
    type: 'Legal',
    url: 'https://www.canlii.org/en/',
    description: 'A nonprofit legal information service providing access to Canadian court decisions, legislation, and legal commentary.',
    practicalUse: 'Check the primary legal text behind a policy question and keep the decision or statute with your research notes.',
    principles: ['Universal access', 'Accountability', 'Preservation'],
    relatedOrgIds: ['sfu-digital-democracies-institute', 'ubc-security-privacy'],
    checked: '2026-11-01',
  },
  {
    id: 'bc-laws',
    name: 'BC Laws',
    type: 'Legal',
    url: 'https://www.bclaws.gov.bc.ca/',
    description: 'The official source for British Columbia legislation, including current consolidated statutes and regulations.',
    practicalUse: 'Confirm the current provincial rule before drafting an AI policy, procurement requirement, or compliance checklist.',
    principles: ['Universal access', 'Accountability', 'Preservation'],
    relatedOrgIds: ['city-of-vancouver', 'bc-hydro'],
    checked: '2026-11-01',
  },
  {
    id: 'bc-data-catalogue',
    name: 'B.C. Data Catalogue',
    type: 'Data',
    url: 'https://catalogue.data.gov.bc.ca/',
    description: 'British Columbia’s catalogue for discovering public provincial datasets and their supporting metadata.',
    practicalUse: 'Find a provincial dataset for a public-service question, then review its licence and metadata before reuse.',
    principles: ['Universal access', 'Open infrastructure', 'Accountability'],
    relatedOrgIds: ['bc-hydro', 'city-of-vancouver', 'ubc-data-science-institute'],
    checked: '2026-11-01',
  },
  {
    id: 'open-government-canada',
    name: 'Open Government — Government of Canada',
    type: 'Data',
    url: 'https://open.canada.ca/en/open-data',
    description: 'A federal open-data portal for discovering and reusing Government of Canada datasets and related resources.',
    practicalUse: 'Locate federal data for a B.C. research question and assess whether it can support a transparent public-interest tool.',
    principles: ['Universal access', 'Open infrastructure', 'Accountability'],
    relatedOrgIds: ['bc-hydro', 'ubc-data-science-institute'],
    checked: '2026-11-01',
  },
];
