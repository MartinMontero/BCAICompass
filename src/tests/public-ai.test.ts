import { describe, expect, it } from 'vitest';
import { ORGANIZATIONS } from '../data/organizations';
import { PUBLIC_AI_RESOURCES, searchPublicAiResources } from '../lib/public-ai';

describe('Public AI resource discovery', () => {
  it('finds practical resources by their public-interest purpose, not just their names', () => {
    const results = searchPublicAiResources(PUBLIC_AI_RESOURCES, {
      query: 'preserve government records',
      principle: 'All',
      type: 'All',
    });

    expect(results.length).toBeGreaterThan(0);
    expect(results.some((resource) => resource.id === 'democracys-library')).toBe(true);
  });

  it('finds the BC public-compute registry by its accountability purpose', () => {
    const results = searchPublicAiResources(PUBLIC_AI_RESOURCES, {
      query: 'public compute electricity ownership',
      principle: 'All',
      type: 'All',
    });

    expect(results.some((resource) => resource.id === 'bc-public-compute')).toBe(true);
  });

  it('combines privacy principle and resource-type filters deterministically', () => {
    const results = searchPublicAiResources(PUBLIC_AI_RESOURCES, {
      query: '',
      principle: 'Privacy',
      type: 'Library',
    });

    expect(results.length).toBeGreaterThan(0);
    expect(results.every((resource) => resource.principles.includes('Privacy') && resource.type === 'Library')).toBe(true);
  });

  it('keeps related organizations limited to existing verified directory records', () => {
    const organizationIds = new Set(ORGANIZATIONS.map((organization) => organization.id));
    for (const resource of PUBLIC_AI_RESOURCES) {
      expect(resource.url).toMatch(/^https:\/\//);
      expect(resource.checked).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      for (const id of resource.relatedOrgIds) expect(organizationIds.has(id)).toBe(true);
    }
  });
});
