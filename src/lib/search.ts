import type { Organization } from '../data/organizations';
import { ORG_TYPE_LABELS } from '../data/organizations';

export const MAX_SEARCH_LENGTH = 240;

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'bc', 'be', 'british', 'can', 'columbia', 'could',
  'do', 'for', 'from', 'get', 'have', 'help', 'how', 'i', 'in', 'into', 'is', 'it', 'me',
  'my', 'need', 'of', 'on', 'or', 'our', 'some', 'something', 'that', 'the', 'their', 'to',
  'outside', 'except', 'excluding',
  'want', 'we', 'what', 'when', 'where', 'which', 'who', 'with', 'would', 'you', 'your',
  'ai', 'artificial', 'intelligence', 'organization', 'organisation', 'looking', 'find', 'show',
]);

// Query expansion supplies vocabulary, never facts. A result still has to match
// text in a verified record before it can be returned.
const EXPANSIONS: Record<string, string[]> = {
  accelerate: ['accelerator', 'incubator', 'mentorship', 'program'],
  accelerator: ['incubator', 'mentorship', 'program'],
  adopt: ['adoption', 'implementation', 'procurement', 'governance'],
  adoption: ['implementation', 'procurement', 'governance'],
  business: ['company', 'companies', 'commercialization', 'startup'],
  businesses: ['company', 'companies', 'commercialization', 'startup'],
  capital: ['funding', 'funds', 'investment', 'grants', 'accelerator'],
  career: ['training', 'education', 'course', 'program'],
  careers: ['training', 'education', 'course', 'program'],
  community: ['meetup', 'chapter', 'community', 'gathering'],
  compute: ['infrastructure', 'gpu', 'data centre', 'data-center', 'cloud'],
  computing: ['infrastructure', 'gpu', 'data centre', 'data-center', 'cloud'],
  course: ['education', 'training', 'program', 'learning'],
  courses: ['education', 'training', 'program', 'learning'],
  education: ['training', 'course', 'teaching', 'student', 'learning'],
  event: ['meetup', 'gathering', 'chapter', 'monthly'],
  events: ['meetup', 'gathering', 'chapter', 'monthly'],
  fund: ['funding', 'funds', 'capital', 'investment', 'grants', 'accelerator'],
  funding: ['funds', 'capital', 'investment', 'grants', 'accelerator'],
  funds: ['funding', 'capital', 'investment', 'grants', 'accelerator'],
  grant: ['funding', 'grants', 'program'],
  grants: ['funding', 'program'],
  gpu: ['compute', 'infrastructure', 'cloud', 'data centre'],
  health: ['healthcare', 'clinical', 'medical', 'patient'],
  healthcare: ['health', 'clinical', 'medical', 'patient'],
  indigenous: ['indigenous', 'first nations', 'sovereignty'],
  invest: ['investment', 'capital', 'funding'],
  investment: ['capital', 'funding', 'investor'],
  lab: ['research', 'laboratory', 'university', 'institute'],
  labs: ['research', 'laboratory', 'university', 'institute'],
  learn: ['learning', 'training', 'education', 'course', 'teaching'],
  learning: ['training', 'education', 'course', 'teaching'],
  meet: ['meetup', 'community', 'chapter', 'gathering'],
  meetup: ['community', 'chapter', 'gathering', 'monthly'],
  mentor: ['mentorship', 'accelerator', 'program'],
  mentorship: ['accelerator', 'program'],
  policy: ['governance', 'public sector', 'government', 'municipal'],
  privacy: ['privacy', 'security', 'trustworthy', 'governance'],
  procurement: ['adoption', 'governance', 'implementation'],
  research: ['researcher', 'lab', 'university', 'institute'],
  researcher: ['research', 'lab', 'university', 'institute'],
  researchers: ['research', 'lab', 'university', 'institute'],
  responsible: ['trustworthy', 'ethical', 'governance', 'privacy'],
  robot: ['robotics', 'robot', 'autonomous'],
  robotics: ['robot', 'autonomous'],
  startup: ['startups', 'founder', 'accelerator', 'venture'],
  startups: ['startup', 'founder', 'accelerator', 'venture'],
  student: ['education', 'training', 'course', 'university', 'college'],
  students: ['education', 'training', 'course', 'university', 'college'],
  teach: ['teaching', 'education', 'training', 'course'],
  training: ['education', 'course', 'learning', 'program'],
};

type FieldName = 'name' | 'description' | 'category' | 'location' | 'type' | 'evidence';

interface FieldMatch {
  field: FieldName;
  term: string;
  points: number;
}

export interface SearchResult {
  organization: Organization;
  score: number;
  matchedTerms: string[];
  reason: string;
}

export function normalizeSearchText(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function queryTokens(question: string): string[] {
  const normalized = normalizeSearchText(question.slice(0, MAX_SEARCH_LENGTH));
  return [...new Set(normalized.split(/\s+/).filter((token) => token.length > 1 && !STOP_WORDS.has(token)))];
}

function queryLocationExclusions(question: string): string[] {
  const normalized = normalizeSearchText(question.slice(0, MAX_SEARCH_LENGTH));
  const exclusions: string[] = [];
  const pattern = /\b(?:outside|except|excluding) ([a-z0-9]+(?: [a-z0-9]+)?)(?= (?:for|to|with|that|who|which|in|on|at|and|or)\b|$)/g;
  for (const match of normalized.matchAll(pattern)) exclusions.push(match[1]);
  return exclusions;
}

function containsTerm(text: string, term: string): boolean {
  // Match complete normalized words or phrases, not substrings such as the
  // "fund" in "fundamental". Padding supplies boundaries at both ends.
  return ` ${text} `.includes(` ${term} `);
}

function fieldText(organization: Organization, field: FieldName): string {
  switch (field) {
    case 'name': return normalizeSearchText(organization.name);
    case 'description': return normalizeSearchText(organization.description ?? '');
    case 'category': return normalizeSearchText(organization.category);
    case 'location': return normalizeSearchText(`${organization.location} ${organization.region}`);
    case 'type': return normalizeSearchText(ORG_TYPE_LABELS[organization.orgType]);
    case 'evidence': return normalizeSearchText(organization.evidenceQuote ?? '');
  }
}

const FIELD_WEIGHTS: Record<FieldName, number> = {
  name: 9,
  description: 4,
  category: 6,
  location: 7,
  type: 3,
  evidence: 2,
};

const FIELD_LABELS: Record<FieldName, string> = {
  name: 'organization name',
  description: 'verified description',
  category: 'category',
  location: 'place or region',
  type: 'organization type',
  evidence: 'evidence quote',
};

const LEARNING_INTENT = new Set(['learn', 'learning', 'course', 'courses', 'education', 'student', 'students', 'teach', 'training']);
const COMPUTE_INTENT = new Set(['compute', 'computing', 'gpu', 'infrastructure']);

function intentMultiplier(organization: Organization, tokens: string[]): number {
  const learning = tokens.some((token) => LEARNING_INTENT.has(token));
  const compute = tokens.some((token) => COMPUTE_INTENT.has(token));
  // "Training" in a data-centre record usually describes a model workload, not
  // a person learning. Keep such records discoverable, but below human-learning
  // providers unless the question also asks for compute.
  return learning && !compute && organization.category === 'Compute & Infrastructure' ? 0.35 : 1;
}

function reasonFor(matches: FieldMatch[]): string {
  const best = [...matches]
    .sort((a, b) => b.points - a.points)
    .slice(0, 3);
  return `Matched ${best.map((match) => `“${match.term}” in ${FIELD_LABELS[match.field]}`).join('; ')}.`;
}

/**
 * Deterministic, explainable retrieval over published verified fields only.
 * No generated descriptions, remote embeddings, or unsupported service claims.
 */
export function searchOrganizations(
  organizations: Organization[],
  question: string,
  limit = 6,
): SearchResult[] {
  const tokens = queryTokens(question);
  const locationExclusions = queryLocationExclusions(question);
  const cappedLimit = Math.max(1, Math.min(12, Math.floor(limit) || 6));
  if (tokens.length === 0) return [];

  const results: SearchResult[] = [];
  organizations.forEach((organization, index) => {
    const location = fieldText(organization, 'location');
    if (locationExclusions.some((exclusion) => containsTerm(location, exclusion))) return;
    const matches: FieldMatch[] = [];
    let score = 0;

    for (const token of tokens) {
      const candidates = [{ term: token, factor: 1 }, ...(EXPANSIONS[token] ?? []).map((term) => ({ term, factor: 0.65 }))];
      let bestTokenScore = 0;
      for (const candidate of candidates) {
        const needle = normalizeSearchText(candidate.term);
        for (const field of Object.keys(FIELD_WEIGHTS) as FieldName[]) {
          if (!containsTerm(fieldText(organization, field), needle)) continue;
          const points = FIELD_WEIGHTS[field] * candidate.factor;
          if (points > bestTokenScore) bestTokenScore = points;
          matches.push({ field, term: candidate.term, points });
        }
      }
      score += bestTokenScore;
    }

    if (score <= 0) return;
    score *= intentMultiplier(organization, tokens);
    const uniqueMatches = [...new Map(matches.map((match) => [`${match.field}:${match.term}`, match])).values()];
    results.push({
      organization,
      score,
      matchedTerms: [...new Set(uniqueMatches.map((match) => match.term))].slice(0, 6),
      reason: reasonFor(uniqueMatches),
    });
    // Stable source order is the final tie-breaker, never an invented quality rank.
    results[results.length - 1].score += (organizations.length - index) * 1e-6;
  });

  return results.sort((a, b) => b.score - a.score).slice(0, cappedLimit);
}
