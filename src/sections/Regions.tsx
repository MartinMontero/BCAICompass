import { useMemo } from 'react';
import {
  CATEGORIES,
  CATEGORY_COLORS,
  ORGANIZATIONS,
  REGIONS,
  type Category,
  type Region,
} from '../data/organizations';
import type { PlanRegion } from '../lib/plan';

// Schematic positions make regional relationships browsable without pretending
// to be survey-grade boundaries. Exact organization coordinates remain on the
// Leaflet map; this atlas is explicitly a navigation and comparison view.
const POSITIONS: Record<Region, { x: number; y: number }> = {
  'North Coast & Nechako': { x: 31, y: 21 },
  Northeast: { x: 70, y: 24 },
  Cariboo: { x: 45, y: 45 },
  'Thompson-Okanagan': { x: 52, y: 65 },
  Kootenay: { x: 73, y: 79 },
  'Metro Vancouver': { x: 28, y: 82 },
  'Fraser Valley': { x: 48, y: 85 },
  'Vancouver Island & Coast': { x: 17, y: 72 },
  'Province-wide': { x: 83, y: 53 },
};

export default function Regions({
  region,
  onRegionChange,
}: {
  region: PlanRegion;
  onRegionChange: (region: PlanRegion) => void;
}) {
  const groups = useMemo(() => REGIONS.map((item) => {
    const items = ORGANIZATIONS.filter((organization) => organization.region === item);
    const counts = new Map<Category, number>();
    for (const organization of items) counts.set(organization.category, (counts.get(organization.category) ?? 0) + 1);
    return {
      region: item,
      items,
      mapped: items.filter((organization) => organization.lat !== undefined).length,
      mix: CATEGORIES.map((category) => ({ category, count: counts.get(category) ?? 0 })).filter((entry) => entry.count > 0).sort((a, b) => b.count - a.count),
    };
  }), []);

  const activeGroup = groups.find((group) => group.region === region);
  const displayItems = activeGroup?.items ?? ORGANIZATIONS;
  const displayMix = activeGroup?.mix ?? CATEGORIES.map((category) => ({
    category,
    count: ORGANIZATIONS.filter((organization) => organization.category === category).length,
  })).filter((entry) => entry.count > 0).sort((a, b) => b.count - a.count);
  const mapped = activeGroup?.mapped ?? ORGANIZATIONS.filter((organization) => organization.lat !== undefined).length;
  const maxMix = Math.max(...displayMix.map((entry) => entry.count), 1);
  const locationCounts = new Map<string, number>();
  for (const organization of displayItems) {
    const city = organization.location.split('—')[0].split(',')[0].trim();
    locationCounts.set(city, (locationCounts.get(city) ?? 0) + 1);
  }
  const topLocations = [...locationCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);

  const openMap = () => {
    document.getElementById('map')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="regions" className="relative bg-[var(--bg-raise)] py-16 md:py-24 border-t border-[var(--line)]">
      <div className="px-5 md:px-10 max-w-[1400px] mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-8 reveal">
          <div>
            <div className="eyebrow mb-3">03 · REGIONAL ATLAS</div>
            <h2 className="font-display uppercase text-4xl md:text-6xl leading-[0.95]">See where the ecosystem sits.</h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-[var(--ink-soft)]">
            Compare verified coverage and category mix. Selecting a region updates your plan, map, and directory together.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--bg)] reveal">
          <div className="lg:col-span-7 relative min-h-[520px] md:min-h-[600px] border-b lg:border-b-0 lg:border-r border-[var(--line)] overflow-hidden">
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
              <button type="button" onClick={() => onRegionChange('All regions')} aria-pressed={region === 'All regions'} className={`min-h-11 rounded-full border px-4 font-mono2 text-[9px] uppercase tracking-[0.08em] ${region === 'All regions' ? 'bg-[var(--ink)] text-[var(--bg)] border-[var(--ink)]' : 'bg-[var(--bg-raise)] border-[var(--line)]'}`}>
                All regions · {ORGANIZATIONS.length}
              </button>
            </div>
            <div className="absolute top-5 right-4 z-10 font-mono2 text-[8px] uppercase tracking-[0.1em] text-[var(--ink-faint)]">Schematic · not to scale</div>
            <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-8 w-[calc(100%-4rem)] h-[calc(100%-4rem)] opacity-70">
              <path d="M28 4 L72 7 L91 31 L79 48 L84 66 L69 94 L44 90 L30 77 L13 91 L5 70 L16 53 L10 34 Z" fill="var(--bg-sink)" stroke="var(--line-strong)" strokeWidth="0.35" vectorEffect="non-scaling-stroke" />
              <path d="M19 18 L74 82 M11 49 L83 47 M31 8 L43 89 M65 9 L59 90" fill="none" stroke="var(--line)" strokeWidth="0.25" vectorEffect="non-scaling-stroke" strokeDasharray="2 3" />
            </svg>
            {groups.map((group) => {
              const position = POSITIONS[group.region];
              const active = region === group.region;
              const empty = group.items.length === 0;
              return (
                <button
                  key={group.region}
                  type="button"
                  disabled={empty}
                  onClick={() => onRegionChange(group.region)}
                  aria-pressed={active}
                  aria-label={`${group.region}: ${empty ? 'not yet surveyed' : `${group.items.length} verified organizations, ${group.mapped} mapped`}`}
                  title={empty ? 'Not yet surveyed — no coverage claim is being made' : `Filter all views to ${group.region}`}
                  className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 min-h-11 min-w-11 rounded-full border px-2 py-1 shadow-[var(--shadow-sm)] transition-transform ${active ? 'scale-110 bg-[var(--brand)] text-[var(--brand-ink)] border-[var(--brand)]' : empty ? 'bg-[var(--bg)] text-[var(--ink-faint)] border-dashed border-[var(--line-strong)] cursor-not-allowed' : 'bg-[var(--bg-raise)] text-[var(--ink)] border-[var(--line-strong)] hover:border-[var(--brand)] hover:scale-105'}`}
                  style={{ left: `${position.x}%`, top: `${position.y}%` }}
                >
                  <span className="block font-display text-lg leading-none">{empty ? '—' : group.items.length}</span>
                  <span className="block max-w-24 font-mono2 text-[7px] md:text-[8px] uppercase leading-tight mt-1">{group.region}</span>
                </button>
              );
            })}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3 font-mono2 text-[8px] uppercase tracking-[0.08em] text-[var(--ink-faint)]">
              <span>Nodes = verified records</span><span>— = not yet surveyed</span>
            </div>
          </div>

          <div className="lg:col-span-5 p-5 md:p-7 flex flex-col">
            <div className="eyebrow">Selected view</div>
            <h3 className="mt-2 font-display uppercase text-3xl md:text-4xl leading-tight">{activeGroup?.region ?? 'All regions'}</h3>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-[var(--radius-md)] bg-[var(--bg-raise)] p-4">
                <div className="font-display text-4xl">{displayItems.length}</div>
                <div className="font-mono2 text-[9px] uppercase tracking-[0.08em] text-[var(--ink-faint)]">verified records</div>
              </div>
              <div className="rounded-[var(--radius-md)] bg-[var(--bg-raise)] p-4">
                <div className="font-display text-4xl">{mapped}</div>
                <div className="font-mono2 text-[9px] uppercase tracking-[0.08em] text-[var(--ink-faint)]">mapped locations</div>
              </div>
            </div>
            <div className="mt-4 h-1.5 rounded-full bg-[var(--bg-sink)] overflow-hidden" aria-label={`${mapped} of ${displayItems.length} records mapped`}>
              <div className="h-full bg-[var(--brand)]" style={{ width: `${displayItems.length ? (mapped / displayItems.length) * 100 : 0}%` }} />
            </div>

            <div className="mt-7">
              <div className="font-mono2 text-[9px] uppercase tracking-[0.12em] text-[var(--ink-faint)] mb-3">Category mix</div>
              <div className="space-y-2.5">
                {displayMix.map(({ category, count }) => (
                  <div key={category} className="grid grid-cols-[minmax(0,1fr)_2rem] gap-3 items-center">
                    <div>
                      <div className="flex justify-between gap-2 text-[11px] mb-1"><span className="truncate">{category}</span></div>
                      <div className="h-1.5 rounded-full bg-[var(--bg-sink)] overflow-hidden"><div className="h-full rounded-full" style={{ width: `${(count / maxMix) * 100}%`, background: CATEGORY_COLORS[category] }} /></div>
                    </div>
                    <span className="font-mono2 text-[11px] text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-7">
              <div className="font-mono2 text-[9px] uppercase tracking-[0.12em] text-[var(--ink-faint)] mb-2">Most represented locations</div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-[var(--ink-soft)]">
                {topLocations.map(([location, count]) => <span key={location}>{location} <strong className="text-[var(--ink)]">{count}</strong></span>)}
              </div>
            </div>

            <div className="mt-auto pt-7 flex flex-wrap gap-3">
              <button type="button" onClick={openMap} className="btn-primary">Open this view on map</button>
              <a href="#directory" className="btn-ghost">Browse records</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
