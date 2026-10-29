import { describe, expect, it } from 'vitest';
import { ORGANIZATIONS } from '../data/organizations';
import {
  MAX_SHORTLIST,
  parseShortlist,
  sanitizeShortlist,
  shortlistToCsv,
  shortlistToMarkdown,
  toggleShortlistId,
} from '../lib/shortlist';

describe('shortlist persistence validation', () => {
  it('keeps only known unique string IDs in their original order', () => {
    // Arrange
    const validIds = new Set(['a', 'b']);
    const stored = ['b', 'unknown', 'a', 'b', 42, null];

    // Act
    const sanitized = sanitizeShortlist(stored, validIds);

    // Assert
    expect(sanitized).toEqual(['b', 'a']);
  });

  it('recovers from malformed or non-array stored JSON', () => {
    // Arrange
    const validIds = new Set(['a']);

    // Act
    const malformed = parseShortlist('{bad json', validIds);
    const wrongShape = parseShortlist('{"ids":["a"]}', validIds);
    const valid = parseShortlist('["a"]', validIds);

    // Assert
    expect(malformed).toEqual([]);
    expect(wrongShape).toEqual([]);
    expect(valid).toEqual(['a']);
  });

  it('enforces the shortlist cap and rejects invalid toggles', () => {
    // Arrange
    const validIds = new Set(Array.from({ length: MAX_SHORTLIST + 1 }, (_, index) => `id-${index}`));
    const full = Array.from({ length: MAX_SHORTLIST }, (_, index) => `id-${index}`);

    // Act
    const addedBeyondCap = toggleShortlistId(full, `id-${MAX_SHORTLIST}`, validIds);
    const removed = toggleShortlistId(full, 'id-0', validIds);
    const invalid = toggleShortlistId([], 'not-valid', validIds);

    // Assert
    expect(addedBeyondCap).toEqual(full);
    expect(removed).toHaveLength(MAX_SHORTLIST - 1);
    expect(removed).not.toContain('id-0');
    expect(invalid).toEqual([]);
  });
});

describe('shortlist exports', () => {
  it('exports UTF-8 CSV with source fields and escaped spreadsheet cells', () => {
    // Arrange
    const organization = {
      ...ORGANIZATIONS[0],
      name: '=HYPERLINK("https://example.invalid")',
      location: 'Vancouver, BC',
    };

    // Act
    const csv = shortlistToCsv([organization]);

    // Assert
    expect(csv.startsWith('\uFEFFName,Category,Type,Location,Region,Website,Source,Verified')).toBe(true);
    expect(csv).toContain("'=HYPERLINK");
    expect(csv).toContain('"Vancouver, BC"');
    expect(csv).toContain(organization.sourceUrl);
    expect(csv.endsWith('\r\n')).toBe(true);
  });

  it('exports a useful Markdown shortlist with verification dates and links', () => {
    // Arrange
    const organizations = ORGANIZATIONS.slice(0, 2);

    // Act
    const markdown = shortlistToMarkdown(organizations);

    // Assert
    expect(markdown).toContain('# BC AI Compass shortlist');
    expect(markdown).toContain(`## ${organizations[0].name}`);
    expect(markdown).toContain(`Source checked ${organizations[0].verified}`);
    expect(markdown).toContain(organizations[0].url);
  });

  it('exports an explicit empty state', () => {
    // Arrange
    const organizations = [] as typeof ORGANIZATIONS;

    // Act
    const markdown = shortlistToMarkdown(organizations);

    // Assert
    expect(markdown).toContain('No organizations saved.');
  });
});
