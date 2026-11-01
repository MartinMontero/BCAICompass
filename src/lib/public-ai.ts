import {
  PUBLIC_AI_RESOURCES,
  type PublicAiPrinciple,
  type PublicAiResource,
  type PublicAiType,
} from '../data/public-ai';

export { PUBLIC_AI_RESOURCES };
export type { PublicAiPrinciple, PublicAiResource, PublicAiType };

export type PublicAiFilters = {
  query: string;
  principle: 'All' | PublicAiPrinciple;
  type: 'All' | PublicAiType;
};

function normalize(value: string): string {
  return value.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, ' ').trim();
}

export function searchPublicAiResources(
  resources: PublicAiResource[],
  filters: PublicAiFilters,
): PublicAiResource[] {
  const terms = normalize(filters.query).split(' ').filter(Boolean);
  return resources.filter((resource) => {
    if (filters.principle !== 'All' && !resource.principles.includes(filters.principle)) return false;
    if (filters.type !== 'All' && resource.type !== filters.type) return false;
    if (terms.length === 0) return true;
    const searchable = normalize([
      resource.name,
      resource.type,
      resource.description,
      resource.practicalUse,
      ...resource.principles,
    ].join(' '));
    return terms.every((term) => searchable.includes(term));
  });
}
