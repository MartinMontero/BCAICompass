import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { ACTIVE_PEOPLE_COMMUNITIES, COMMUNITIES_WITHOUT_CONFIRMED_LEAD, CONNECTION_KINDS, PEOPLE } from '../data/people';
import { ORGANIZATIONS } from '../data/organizations';
import { searchPeople } from '../lib/people';

const filters = { query: '', community: 'All', connection: 'All' } as const;

describe('sourced People directory', () => {
  it('contains community leaders and additional project contributors with honest coverage gaps', () => {
    expect(PEOPLE.length).toBeGreaterThanOrEqual(20);
    expect(PEOPLE.filter((person) => !person.communityLead).length).toBeGreaterThanOrEqual(6);
    const leadCommunities = new Set(PEOPLE.filter((person) => person.communityLead).map((person) => person.community));
    expect(leadCommunities.size).toBe(8);
    expect(ACTIVE_PEOPLE_COMMUNITIES.length).toBe(10);
    expect(COMMUNITIES_WITHOUT_CONFIRMED_LEAD).toHaveLength(2);
    for (const community of COMMUNITIES_WITHOUT_CONFIRMED_LEAD) expect(leadCommunities.has(community)).toBe(false);
  });

  it('keeps every profile public, sourced, and connected without personal contact fields', () => {
    const organizationIds = new Set(ORGANIZATIONS.map((organization) => organization.id));
    for (const person of PEOPLE) {
      expect(person.status).toBe('verified');
      expect(person.sourceUrl).toMatch(/^https:\/\//);
      expect(person.sourceDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(person.evidenceQuote.trim().split(/\s+/).length).toBeLessThan(15);
      expect(person.connections.length).toBeGreaterThan(0);
      expect(person.profileUrl ?? '').not.toMatch(/^mailto:/i);
      expect(JSON.stringify(person)).not.toMatch(/mailto:|"(?:email|phone)"/i);
      for (const connection of person.connections) {
        expect(connection.url).toMatch(/^https:\/\//);
        expect(CONNECTION_KINDS).toContain(connection.kind);
      }
      for (const id of person.relatedOrgIds) expect(organizationIds.has(id)).toBe(true);
    }
    expect(new Set(PEOPLE.map((person) => person.id)).size).toBe(PEOPLE.length);
  });

  it('finds people by name, expertise, project, community, and location', () => {
    expect(searchPeople(PEOPLE, { ...filters, query: 'Kris Krüg' })[0]?.person.id).toBe('kris-krug');
    expect(searchPeople(PEOPLE, { ...filters, query: 'drug discovery' }).map((result) => result.person.id)).toContain('simon-haworth');
    expect(searchPeople(PEOPLE, { ...filters, query: 'Niiwin' }).map((result) => result.person.id)).toEqual(['jeff-ward']);
    expect(searchPeople(PEOPLE, { ...filters, query: 'Fraser Valley' }).map((result) => result.person.id)).toEqual(expect.arrayContaining(['darren-coleman', 'matthew-schwartzman']));
    expect(searchPeople(PEOPLE, { ...filters, query: 'Victoria' }).map((result) => result.person.id)).toEqual(expect.arrayContaining(['jeff-ward', 'julie-angus', 'kevin-stanley']));
  });

  it('requires every meaningful query term and explains the match', () => {
    const results = searchPeople(PEOPLE, { ...filters, query: 'Simon drug discovery' });
    expect(results.map((result) => result.person.id)).toEqual(['simon-haworth']);
    expect(results[0]?.reason).toContain('Matched');
    expect(results[0]?.matchedTerms).toEqual(expect.arrayContaining(['simon', 'drug', 'discovery']));
    expect(searchPeople(PEOPLE, { ...filters, query: 'Simon quantum pancake' })).toHaveLength(0);
  });

  it('combines community and connection-intent filters deterministically', () => {
    const results = searchPeople(PEOPLE, { query: '', community: 'AI Film Club', connection: 'offer-help' });
    expect(results.map((result) => result.person.id)).toEqual(['kevin-friel']);
    expect(results[0]?.reason).toContain('selected community and connection filters');
    expect(searchPeople(PEOPLE, filters)).toHaveLength(PEOPLE.length);
  });

  it('covers all 136 organizations and keeps the first-pass profiles', () => {
    const review = JSON.parse(readFileSync('research/people-source-review.json', 'utf8'));
    expect(review.organizationCount).toBe(136);
    expect(review.reviewedCount).toBe(136);
    expect(review.coverageComplete).toBe(true);
    expect(review.expandedPeopleCount).toBe(PEOPLE.length);
    expect(PEOPLE.length).toBe(127);
    expect(review.organizationsWithPublishedPeople).toBe(134);
    expect(review.organizationsWithoutPublishedPeople).toBe(2);
    const firstPassIds = ['kris-krug', 'kevin-friel', 'fiann-ohagan', 'david-gloyn-cox', 'darren-coleman', 'matthew-schwartzman', 'lourdes-gant', 'steve-jones', 'colin-fitzgerald', 'mel-dipietro', 'anthonia-ogundele', 'nessa-palmer', 'jesi-carson', 'peter-van-garderen', 'sara-taherzadeh', 'simon-haworth', 'mauricio-penteado', 'martin-lopatka', 'sarah-downey', 'loc-dao', 'jeff-ward'];
    for (const id of firstPassIds) expect(PEOPLE.some((person) => person.id === id)).toBe(true);
    const reviewIds = new Set(review.organizations.map((organization: { organizationId: string }) => organization.organizationId));
    for (const organization of ORGANIZATIONS) expect(reviewIds.has(organization.id)).toBe(true);
  });

  it('expands practical vocabulary without introducing unsupported people', () => {
    const results = searchPeople(PEOPLE, { ...filters, query: 'robot' });
    expect(results.map((result) => result.person.id)).toEqual(expect.arrayContaining(['fiann-ohagan', 'david-gloyn-cox']));
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((result) => result.person.expertise.some((item) => item.includes('robot')))).toBe(true);
  });
});
