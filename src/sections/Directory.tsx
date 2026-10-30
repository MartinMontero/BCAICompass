import { useMemo, useState } from 'react';
import {
  CATEGORIES,
  CATEGORY_COLORS,
  ORGANIZATIONS,
  ORG_TYPE_LABELS,
  REGIONS,
  type Category,
} from '../data/organizations';
import type { Preset } from '../data/preset';
import type { PlanRegion } from '../lib/plan';

type CatFilter = 'All' | Category;

export default function Directory({
  preset,
  onClearPreset,
  savedIds,
  onToggle,
  region,
  onRegionChange,
}: {
  preset: Preset;
  onClearPreset: () => void;
  savedIds: Set<string>;
  onToggle: (id: string) => void;
  region: PlanRegion;
  onRegionChange: (region: PlanRegion) => void;
}) {
  const [cat, setCat] = useState<CatFilter>('All');
  const [q, setQ] = useState('');

  const presetCats = useMemo(
    () => (preset?.kind === 'onramp' ? new Set<Category>(preset.categories) : null),
    [preset],
  );
  const presetStops = useMemo(
    () => (preset?.kind === 'pathway' ? new Set<string>(preset.stops) : null),
    [preset],
  );

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return ORGANIZATIONS.filter(
      (o) =>
        (presetStops
          ? presetStops.has(o.id)
          : presetCats
            ? presetCats.has(o.category)
            : cat === 'All' || o.category === cat) &&
        (region === 'All regions' || o.region === region) &&
        (needle === '' ||
          o.name.toLowerCase().includes(needle) ||
          o.location.toLowerCase().includes(needle) ||
          (o.description ?? '').toLowerCase().includes(needle)),
    );
  }, [cat, region, q, presetCats, presetStops]);

  const catCounts = useMemo(() => {
    const counts: Record<string, number> = { All: ORGANIZATIONS.length };
    for (const category of CATEGORIES) counts[category] = ORGANIZATIONS.filter((o) => o.category === category).length;
    return counts;
  }, []);

  const regCounts = useMemo(() => {
    const counts: Record<string, number> = { 'All regions': ORGANIZATIONS.length };
    for (const item of REGIONS) counts[item] = ORGANIZATIONS.filter((o) => o.region === item).length;
    return counts;
  }, []);

  const locate = (id: string) => {
    window.dispatchEvent(new CustomEvent<string>('bcac:select', { detail: id }));
    document.getElementById('map')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="directory" className="relative bg-[var(--bg)] py-16 md:py-24 border-t border-[var(--line)]">
      <div className="px-5 md:px-10 max-w-[1400px] mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-8 reveal">
          <div>
            <div className="eyebrow mb-3">05 · DIRECTORY</div>
            <h2 className="font-display uppercase text-4xl md:text-6xl leading-[0.95]">Browse the evidence.</h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-[var(--ink-soft)]">
            Filter first. Open a record’s evidence only when you need to check it. Region stays synchronized with the planner, atlas, and map.
          </p>
        </div>

        <div className="mb-6 rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--bg-raise)] p-4 md:p-5 reveal">
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
            <label className="block flex-1">
              <span className="sr-only">Search organizations</span>
              <input
                type="search"
                value={q}
                maxLength={240}
                onChange={(event) => setQ(event.target.value)}
                placeholder="Search name, place or description…"
                className="w-full min-h-12 rounded-[var(--radius-sm)] bg-[var(--bg)] border border-[var(--line)] px-4 text-sm text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:border-[var(--brand)] outline-none transition-colors"
              />
            </label>
            <div className="font-mono2 text-[10px] tracking-[0.08em] text-[var(--ink-faint)] md:text-right" aria-live="polite">
              <strong className="text-[var(--ink)]">{rows.length}</strong> of {ORGANIZATIONS.length} shown
              {region !== 'All regions' && <span className="block mt-1 text-[var(--accent)]">{region}</span>}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-3" aria-label="Filter by category">
            {(['All', ...CATEGORIES] as CatFilter[]).map((category) => {
              const active = cat === category;
              const count = catCounts[category] ?? 0;
              const empty = category !== 'All' && count === 0;
              const color = category === 'All' ? 'var(--ink)' : CATEGORY_COLORS[category];
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => {
                    onClearPreset();
                    setCat(category);
                  }}
                  disabled={empty}
                  aria-pressed={active}
                  title={empty ? 'Not yet surveyed' : undefined}
                  className={`min-h-11 rounded-full font-mono2 text-[10px] tracking-[0.06em] uppercase px-3.5 border transition-colors ${empty ? 'border-dashed border-[var(--line)] text-[var(--ink-faint)] cursor-not-allowed' : active ? 'bg-[var(--ink)] text-[var(--bg)] border-[var(--ink)]' : 'border-[var(--line)] text-[var(--ink-soft)] hover:border-[var(--brand)] hover:text-[var(--ink)]'}`}
                >
                  <span className="inline-block w-1.5 h-1.5 rounded-full mr-2 align-middle" style={{ background: active && !empty ? 'var(--bg)' : color, opacity: empty ? 0.4 : 1 }} />
                  {category} <span className="opacity-60">{empty ? '—' : count}</span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-2" aria-label="Filter by region">
            {(['All regions', ...REGIONS] as PlanRegion[])
              .filter((item) => (regCounts[item] ?? 0) > 0)
              .map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => onRegionChange(item)}
                  aria-pressed={region === item}
                  className={`min-h-11 rounded-full font-mono2 text-[9.5px] tracking-[0.05em] uppercase px-3.5 border transition-colors ${region === item ? 'bg-[var(--brand)] text-[var(--brand-ink)] border-[var(--brand)]' : 'border-[var(--line)] text-[var(--ink-soft)] hover:border-[var(--brand)] hover:text-[var(--accent)]'}`}
                >
                  {item} <span className="opacity-65">{regCounts[item] ?? 0}</span>
                </button>
              ))}
          </div>
        </div>

        <div className="border-t border-[var(--line)]">
          {rows.map((organization) => {
            const saved = savedIds.has(organization.id);
            return (
              <article key={organization.id} className="org-row border-b border-[var(--line)] py-5">
                <div className="grid md:grid-cols-12 gap-3 md:gap-5 items-start">
                  <div className="md:col-span-4">
                    <a href={organization.url} target="_blank" rel="noreferrer" className="font-display uppercase text-xl md:text-2xl tracking-wide leading-tight hover:text-[var(--accent)] transition-colors">
                      {organization.name} <span className="text-[var(--ink-faint)] text-sm align-super">↗</span>
                    </a>
                    <div className="font-mono2 text-[9.5px] tracking-[0.08em] uppercase text-[var(--ink-faint)] mt-1.5">
                      {ORG_TYPE_LABELS[organization.orgType]}{organization.size && ` · ${organization.size}`}
                    </div>
                  </div>
                  <div className="md:col-span-2 font-mono2 text-[9.5px] tracking-[0.08em] uppercase pt-1" style={{ color: CATEGORY_COLORS[organization.category] }}>
                    <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: CATEGORY_COLORS[organization.category] }} />
                    {organization.category}
                  </div>
                  <div className="md:col-span-2 text-[12px] text-[var(--ink-soft)] pt-0.5">
                    {organization.location}
                    <span className="block font-mono2 text-[9px] tracking-[0.06em] uppercase text-[var(--ink-faint)] mt-1">{organization.region}</span>
                  </div>
                  <div className="md:col-span-2 flex flex-wrap md:justify-end gap-2">
                    <a href={organization.sourceUrl} target="_blank" rel="noreferrer" className="stamp" title={`Source read ${organization.sourceDate}`}>
                      {organization.verified} ↗
                    </a>
                    {organization.lat !== undefined && (
                      <button type="button" onClick={() => locate(organization.id)} className="min-h-11 px-3 font-mono2 text-[9px] uppercase tracking-[0.08em] text-[var(--accent)] hover:text-[var(--ink)]" aria-label={`Locate ${organization.name} on map`}>
                        Map ↗
                      </button>
                    )}
                  </div>
                  <div className="md:col-span-2 md:text-right">
                    <button
                      type="button"
                      aria-pressed={saved}
                      aria-label={`${saved ? 'Remove' : 'Add'} ${organization.name} ${saved ? 'from' : 'to'} shortlist`}
                      onClick={() => onToggle(organization.id)}
                      className={`min-h-11 px-3.5 rounded-[var(--radius-sm)] border font-mono2 text-[9.5px] tracking-[0.06em] uppercase transition-colors ${saved ? 'border-[var(--brand)] bg-[var(--brand)] text-[var(--brand-ink)]' : 'border-[var(--line-strong)] text-[var(--ink-soft)] hover:border-[var(--brand)] hover:text-[var(--accent)]'}`}
                    >
                      {saved ? '✓ Saved' : '+ Compare'}
                    </button>
                  </div>
                </div>

                <details className="mt-3 md:ml-[33.333%] group">
                  <summary className="inline-flex min-h-11 items-center font-mono2 text-[10px] uppercase tracking-[0.08em] text-[var(--accent)] cursor-pointer select-none">
                    Evidence & description <span className="ml-2 group-open:rotate-45 transition-transform">＋</span>
                  </summary>
                  <div className="max-w-3xl pb-2 text-[13px] leading-relaxed text-[var(--ink-soft)]">
                    <p>{organization.description ?? 'No description was supported by the source.'}</p>
                    {organization.evidenceQuote ? (
                      <blockquote className="mt-3 border-l-2 border-[var(--brand)] pl-4 text-[12px]">“{organization.evidenceQuote}”</blockquote>
                    ) : (
                      <p className="mt-3 text-[12px] text-[var(--ink-faint)]">Quote pending — this record is sourced, but no verbatim quote has been captured.</p>
                    )}
                  </div>
                </details>
              </article>
            );
          })}
          {rows.length === 0 && (
            <div className="py-10">
              <p className="text-sm text-[var(--ink-soft)]">No verified record matches this slice. Clear a filter or contribute a source; an unchecked organization is not treated as nonexistent.</p>
              <button type="button" onClick={() => { setCat('All'); setQ(''); onRegionChange('All regions'); }} className="btn-ghost mt-5">Clear filters</button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
