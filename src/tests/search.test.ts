import { describe, expect, it } from 'vitest';
import { ORGANIZATIONS } from '../data/organizations';
import { MAX_SEARCH_LENGTH, normalizeSearchText, searchOrganizations } from '../lib/search';

describe('searchOrganizations', () => {
  it('returns no matches for an empty or stop-word-only question', () => {
    // Arrange
    const questions = ['', '   ', 'I need help with AI'];

    // Act
    const results = questions.map((question) => searchOrganizations(ORGANIZATIONS, question));

    // Assert
    expect(results).toEqual([[], [], []]);
  });

  it('ranks an exact organization-name match first and explains the match', () => {
    // Arrange
    const expected = ORGANIZATIONS[0];

    // Act
    const [first] = searchOrganizations(ORGANIZATIONS, expected.name);

    // Assert
    expect(first.organization.id).toBe(expected.id);
    expect(first.reason).toContain('organization name');
    expect(first.matchedTerms.length).toBeGreaterThan(0);
  });

  it('uses vocabulary expansion without returning unmatched organizations', () => {
    // Arrange
    const question = 'Where can I find funding for a startup?';

    // Act
    const results = searchOrganizations(ORGANIZATIONS, question);

    // Assert
    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThanOrEqual(6);
    for (const result of results) {
      expect(result.score).toBeGreaterThan(0);
      expect(result.reason).toMatch(/^Matched .+\.$/);
      expect(result.organization.sourceUrl).toMatch(/^https?:\/\//);
    }
  });

  it('is deterministic and preserves source order for equivalent matches', () => {
    // Arrange
    const question = 'community meetup';

    // Act
    const first = searchOrganizations(ORGANIZATIONS, question, 12);
    const second = searchOrganizations(ORGANIZATIONS, question, 12);

    // Assert
    expect(second.map((result) => result.organization.id)).toEqual(first.map((result) => result.organization.id));
    expect(first).toHaveLength(12);
  });

  it('recognizes the plural funds as funding vocabulary', () => {
    // Arrange
    const question = 'funds';

    // Act
    const results = searchOrganizations(ORGANIZATIONS, question, 12);

    // Assert
    expect(results.map((result) => result.organization.id)).toContain('pacifican');
  });

  it('does not treat a substring inside a different word as a match', () => {
    // Arrange
    const fundamentalResearch = ORGANIZATIONS.find((organization) => organization.name.startsWith('Optimization, Learning'));
    expect(fundamentalResearch).toBeDefined();

    // Act
    const results = searchOrganizations(ORGANIZATIONS, 'fund', 12);

    // Assert
    expect(results.map((result) => result.organization.id)).not.toContain(fundamentalResearch?.id);
  });

  it('honours a plain-language location exclusion', () => {
    // Arrange
    const question = 'Where can I learn AI outside Vancouver?';

    // Act
    const results = searchOrganizations(ORGANIZATIONS, question, 12);

    // Assert
    expect(results.length).toBeGreaterThan(0);
    for (const result of results) {
      expect(normalizeSearchText(`${result.organization.location} ${result.organization.region}`)).not.toContain('vancouver');
    }
    for (const result of results.slice(0, 6)) {
      expect(result.organization.category).not.toBe('Compute & Infrastructure');
    }
  });

  it('bounds both result count and query length', () => {
    // Arrange
    const overLimit = `${'x'.repeat(MAX_SEARCH_LENGTH)} funding`;

    // Act
    const capped = searchOrganizations(ORGANIZATIONS, 'research', 500);
    const truncated = searchOrganizations(ORGANIZATIONS, overLimit);

    // Assert
    expect(capped).toHaveLength(12);
    expect(truncated).toEqual([]);
  });
});

describe('normalizeSearchText', () => {
  it('normalizes accents, punctuation, apostrophes, and case', () => {
    // Arrange
    const input = '  Café—Vancouver’s AI  ';

    // Act
    const normalized = normalizeSearchText(input);

    // Assert
    expect(normalized).toBe('cafe vancouvers ai');
  });
});
