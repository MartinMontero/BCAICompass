import { describe, expect, it } from 'vitest';
import { ORGANIZATIONS } from '../data/organizations';
import { GOALS, PLAN_REGIONS, buildActionPlan, planToMarkdown } from '../lib/plan';

describe('buildActionPlan', () => {
  it('provides four concrete steps and valid curated organizations for every goal', () => {
    // Arrange
    const organizationsById = new Map(ORGANIZATIONS.map((organization) => [organization.id, organization]));

    // Act
    const plans = GOALS.map((goal) => buildActionPlan(goal.id));

    // Assert
    expect(new Set(GOALS.map((goal) => goal.id)).size).toBe(GOALS.length);
    for (const plan of plans) {
      expect(plan.goal.steps).toHaveLength(4);
      expect(plan.organizations.length).toBeGreaterThan(0);
      for (const id of plan.goal.priorityIds) {
        const organization = organizationsById.get(id);
        expect(organization, `Missing curated organization: ${id}`).toBeDefined();
        expect(plan.goal.categories, `${id} is excluded by ${plan.goal.id} categories`).toContain(organization?.category);
      }
    }
  });

  it('includes only the selected region and province-wide records when filtered', () => {
    // Arrange
    const region = 'Thompson-Okanagan';

    // Act
    const plan = buildActionPlan('adopt', region, 12);

    // Assert
    expect(plan.region).toBe(region);
    expect(plan.organizations.length).toBeGreaterThan(0);
    for (const organization of plan.organizations) {
      expect([region, 'Province-wide']).toContain(organization.region);
    }
  });

  it('puts local records ahead of province-wide records at equal priority', () => {
    // Arrange
    const region = 'Metro Vancouver';

    // Act
    const plan = buildActionPlan('connect', region, 12);
    const priority = new Map(plan.goal.priorityIds.map((id, index) => [id, index]));
    const rank = (id: string) => priority.get(id) ?? 10_000;

    // Assert
    expect(plan.organizations.some((organization) => organization.region === region)).toBe(true);
    for (const local of plan.organizations.filter((organization) => organization.region === region)) {
      for (const provinceWide of plan.organizations.filter((organization) => organization.region === 'Province-wide')) {
        if (rank(local.id) !== rank(provinceWide.id)) continue;
        expect(plan.organizations.indexOf(local)).toBeLessThan(plan.organizations.indexOf(provinceWide));
      }
    }
  });

  it('caps plan size and falls back safely for an unknown runtime goal', () => {
    // Arrange
    const unknownGoal = 'not-a-real-goal' as never;

    // Act
    const capped = buildActionPlan('build', 'All regions', 999);
    const fallback = buildActionPlan(unknownGoal);

    // Assert
    expect(capped.organizations.length).toBeLessThanOrEqual(12);
    expect(fallback.goal.id).toBe(GOALS[0].id);
  });
});

describe('planToMarkdown', () => {
  it('exports checklist guidance, organization links, dated sources, and caveats', () => {
    // Arrange
    const plan = buildActionPlan('fund');

    // Act
    const markdown = planToMarkdown(plan);

    // Assert
    expect(markdown).toContain(`# BC AI Compass action plan — ${plan.goal.label}`);
    expect(markdown).toContain('## Checklist');
    expect(markdown).toContain('Source checked');
    expect(markdown).toContain('general planning guidance');
    expect(markdown).toContain(plan.organizations[0].sourceUrl);
  });
});

describe('PLAN_REGIONS', () => {
  it('offers an all-region option plus every dataset region', () => {
    // Arrange / Act
    const regions = new Set(PLAN_REGIONS);

    // Assert
    expect(regions.has('All regions')).toBe(true);
    expect(regions.has('Province-wide')).toBe(true);
    expect(PLAN_REGIONS[0]).toBe('All regions');
  });
});
