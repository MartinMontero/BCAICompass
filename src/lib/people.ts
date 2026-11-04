import type { ConnectionKind, Person, PersonCommunity } from '../data/people';
import { normalizeSearchText } from './search';

export type PeopleFilters = {
  query: string;
  community: 'All' | PersonCommunity;
  connection: 'All' | ConnectionKind;
};

export type PeopleSearchResult = {
  person: Person;
  score: number;
  matchedTerms: string[];
  reason: string;
};

type SearchField = 'name' | 'role' | 'expertise' | 'projects' | 'community' | 'location' | 'summary' | 'connections';

const FIELD_WEIGHTS: Record<SearchField, number> = {
  name: 12,
  role: 9,
  expertise: 8,
  projects: 7,
  community: 6,
  location: 5,
  summary: 4,
  connections: 3,
};

const FIELD_LABELS: Record<SearchField, string> = {
  name: 'name',
  role: 'role',
  expertise: 'expertise',
  projects: 'projects',
  community: 'community',
  location: 'location',
  summary: 'public bio',
  connections: 'connection paths',
};

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'can', 'could', 'do', 'for', 'from', 'get',
  'help', 'i', 'in', 'into', 'is', 'it', 'me', 'my', 'need', 'of', 'on', 'or', 'our',
  'person', 'people', 'some', 'someone', 'that', 'the', 'their', 'to', 'want', 'we', 'what',
  'when', 'where', 'which', 'who', 'with', 'would', 'you', 'your', 'find', 'show', 'looking',
]);

// Expansions supply vocabulary only. Returned people still match published fields.
const EXPANSIONS: Record<string, string[]> = {
  robot: ['robotics'],
  robots: ['robotics'],
  film: ['filmmaking', 'filmmakers'],
  films: ['filmmaking', 'filmmakers'],
  teach: ['education', 'educator'],
  teacher: ['education', 'educator'],
  teaching: ['education', 'educator'],
  health: ['healthcare'],
  policy: ['governance', 'civic'],
  mentor: ['mentoring', 'coaching'],
};

function fieldsFor(person: Person): Record<SearchField, string> {
  return {
    name: person.name,
    role: person.role,
    expertise: person.expertise.join(' '),
    projects: person.projects.join(' '),
    community: person.community,
    location: person.location,
    summary: person.summary,
    connections: person.connections.map((connection) => connection.label).join(' '),
  };
}

function hasTerm(text: string, term: string): boolean {
  return ` ${normalizeSearchText(text)} `.includes(` ${term} `);
}

export function searchPeople(people: Person[], filters: PeopleFilters): PeopleSearchResult[] {
  const normalizedQuery = normalizeSearchText(filters.query.slice(0, 240));
  const terms = [...new Set(normalizedQuery.split(/\s+/).filter((term) => term.length > 1 && !STOP_WORDS.has(term)))];

  return people.flatMap((person, index) => {
    if (filters.community !== 'All' && person.community !== filters.community) return [];
    if (filters.connection !== 'All' && !person.connections.some((connection) => connection.kind === filters.connection)) return [];

    const fields = fieldsFor(person);
    const matches: { field: SearchField; term: string; points: number }[] = [];
    let score = 0;

    for (const term of terms) {
      const candidates = [{ term, factor: 1 }, ...(EXPANSIONS[term] ?? []).map((candidate) => ({ term: candidate, factor: 0.65 }))];
      let best = 0;
      for (const candidate of candidates) {
        const needle = normalizeSearchText(candidate.term);
        for (const field of Object.keys(FIELD_WEIGHTS) as SearchField[]) {
          if (!hasTerm(fields[field], needle)) continue;
          const points = FIELD_WEIGHTS[field] * candidate.factor;
          best = Math.max(best, points);
          matches.push({ field, term: candidate.term, points });
        }
      }
      // Every meaningful term must match somewhere. This keeps multi-term people
      // searches precise instead of returning anyone who matches only one word.
      if (best === 0) return [];
      score += best;
    }

    const unique = [...new Map(matches.map((match) => [`${match.field}:${match.term}`, match])).values()];
    const bestMatches = unique.sort((a, b) => b.points - a.points).slice(0, 3);
    return [{
      person,
      score: score + (people.length - index) * 1e-6,
      matchedTerms: [...new Set(unique.map((match) => match.term))].slice(0, 6),
      reason: terms.length === 0
        ? 'Included by the selected community and connection filters.'
        : `Matched ${bestMatches.map((match) => `“${match.term}” in ${FIELD_LABELS[match.field]}`).join('; ')}.`,
    }];
  }).sort((a, b) => b.score - a.score);
}
