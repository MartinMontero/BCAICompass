import { useMemo, useState } from 'react';
import {
  CATEGORIES,
  CATEGORY_COLORS,
  ORGANIZATIONS,
  ORG_TYPE_LABELS,
  REGIONS,
  type Category,
  type Region,
} from '../data/organizations';
import type { Preset } from '../data/preset';

type CatFilter = 'All' | Category;
type RegFilter = 'All' | Region;

export default function Directory({
  preset,
  onClearPreset,
}: {
  preset: Preset;
  onClearPreset: () => void;
}) {
  const [cat, setCat] = useState<CatFilter>('All');
  const [reg, setReg] = useState<RegFilter>('All');
  const [q, setQ] = useState('');

  // The same preset the map is showing, so picking an onramp moves both together
  // instead of leaving the directory contradicting the map above it.
  const presetCats = useMemo(
    () => (preset?.kind === 'onramp' ? new Set<Category>(preset.categories) : null),
    [preset]
  );
  const presetStops = useMemo(
    () => (preset?.kind === 'pathway' ? new Set<string>(preset.stops) : null),
    [preset]
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
        (reg === 'All' || o.region === reg) &&
        (needle === '' ||
          o.name.toLowerCase().includes(needle) ||
          o.location.toLowerCase().includes(needle) ||
          (o.description ?? '').toLowerCase().includes(needle))
    );
  }, [cat, reg, q, presetCats, presetStops]);

  const catCounts = useMemo(() => {
    const c: Record<string, number> = { All: ORGANIZATIONS.length };
    for (const k of CATEGORIES) c[k] = ORGANIZATIONS.filter((o) => o.category === k).length;
    return c;
  }, []);

  const regCounts = useMemo(() => {
    const c: Record<string, number> = { All: ORGANIZATIONS.length };
    for (const k of REGIONS) c[k] = ORGANIZATIONS.filter((o) => o.region === k).length;
    return c;
  }, []);

  return (
    <section
      id="directory"
      className="relative bg-[var(--bg)] py-20 md:py-28 border-t border-[var(--line)]"
    >
      <div className="px-5 md:px-10 max-w-[1400px] mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-10 reveal">
          <div>
            <div className="eyebrow mb-4">THE DIRECTORY</div>
            <h2 className="font-display uppercase text-5xl md:text-7xl leading-[0.95]">
              {ORGANIZATIONS.length} records.
              <br />
              {ORGANIZATIONS.length} sources.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-[var(--ink-soft)]">
            Every row links the page it was checked against and the month it was checked. Click the
            stamp, not just the name — if a record is wrong, the source is where you can prove it.
            Blank fields are blank on purpose: a null is a real answer.
          </p>
        </div>

        {/* controls */}
        <div className="mb-6 reveal">
          <label className="block mb-3">
            <span className="sr-only">Search organizations</span>
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, place or description…"
              className="w-full md:max-w-md bg-[var(--bg-raise)] border border-[var(--line)] px-4 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:border-[var(--brand)] outline-none transition-colors"
            />
          </label>

          <div className="flex flex-wrap gap-2 mb-2">
            {(['All', ...CATEGORIES] as CatFilter[]).map((c) => {
              const active = cat === c;
              const n = catCounts[c] ?? 0;
              const empty = c !== 'All' && n === 0;
              const color = c === 'All' ? 'var(--ink)' : CATEGORY_COLORS[c as Category];
              return (
                <button
                  key={c}
                  onClick={() => {
                    if (empty) return;
                    onClearPreset();
                    setCat(c);
                  }}
                  disabled={empty}
                  title={empty ? 'Not yet surveyed — nobody has searched this category to a conclusion' : undefined}
                  className={`font-mono2 text-[10px] tracking-[0.12em] uppercase px-3 py-1.5 border transition-all duration-300 ${
                    empty
                      ? 'border-dashed border-[var(--line)] text-[var(--ink-faint)] cursor-not-allowed'
                      : active
                        ? 'bg-[var(--ink)] text-[var(--bg)] border-[var(--ink)]'
                        : 'border-[var(--line)] text-[var(--ink-soft)] hover:border-[var(--line-strong)] hover:text-[var(--ink)]'
                  }`}
                >
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full mr-2 align-middle"
                    style={{ background: active && !empty ? 'var(--bg)' : color, opacity: empty ? 0.4 : 1 }}
                  />
                  {c} <span className="opacity-60">{empty ? '(not yet surveyed)' : `(${n})`}</span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-2">
            {(['All', ...REGIONS] as RegFilter[])
              .filter((r) => (regCounts[r] ?? 0) > 0)
              .map((r) => {
                const active = reg === r;
                return (
                  <button
                    key={r}
                    onClick={() => {
                      onClearPreset();
                      setReg(r);
                    }}
                    className={`font-mono2 text-[9.5px] tracking-[0.1em] uppercase px-3 py-1.5 border transition-all duration-300 ${
                      active
                        ? 'bg-[var(--brand)] text-[var(--brand-ink)] border-[var(--brand)]'
                        : 'border-[var(--line)] text-[var(--ink-faint)] hover:border-[var(--brand)] hover:text-[var(--accent)]'
                    }`}
                  >
                    {r} <span className="opacity-60">({regCounts[r] ?? 0})</span>
                  </button>
                );
              })}
          </div>
        </div>

        <div className="font-mono2 text-[10px] tracking-[0.1em] text-[var(--ink-faint)] mb-4 px-1">
          {rows.length} of {ORGANIZATIONS.length} shown
        </div>

        <div className="divide-y divide-[var(--line)] border-t border-b border-[var(--line)]">
          {rows.map((o, i) => (
            <div key={o.id} className="org-row grid md:grid-cols-12 gap-2 md:gap-5 py-4 px-1 reveal">
              <div className="md:col-span-1 font-mono2 text-[10px] text-[var(--ink-faint)] pt-1">
                {String(i + 1).padStart(3, '0')}
              </div>

              <div className="md:col-span-3">
                <a
                  href={o.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-display uppercase text-xl md:text-2xl tracking-wide leading-tight hover:text-[var(--accent)] transition-colors"
                >
                  {o.name} <span className="text-[var(--ink-faint)] text-sm align-super">↗</span>
                </a>
                <div className="font-mono2 text-[9.5px] tracking-[0.1em] uppercase text-[var(--ink-faint)] mt-1">
                  {ORG_TYPE_LABELS[o.orgType]}
                  {o.size && <span> · {o.size}</span>}
                </div>
              </div>

              <div
                className="md:col-span-2 font-mono2 text-[9.5px] tracking-[0.12em] uppercase pt-1"
                style={{ color: CATEGORY_COLORS[o.category] }}
              >
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full mr-2 align-middle"
                  style={{ background: CATEGORY_COLORS[o.category] }}
                />
                {o.category}
              </div>

              <div className="md:col-span-2 font-mono2 text-[10.5px] tracking-[0.06em] text-[var(--ink-faint)] pt-1">
                {o.location}
                <span className="block text-[9.5px] tracking-[0.1em] uppercase mt-0.5">{o.region}</span>
                {o.lat === undefined && (
                  <span className="block normal-case tracking-normal mt-0.5 text-[10px]">
                    no fixed location on file
                  </span>
                )}
              </div>

              <div className="md:col-span-3 text-[13px] leading-relaxed text-[var(--ink-soft)]">
                {o.description ?? (
                  <span className="text-[var(--ink-faint)] italic">
                    No description — the source did not support one.
                  </span>
                )}
                {o.orgStatus && o.orgStatus !== 'active' && (
                  <span className="block mt-1.5 font-mono2 text-[9.5px] tracking-[0.12em] uppercase text-[var(--cat-company)]">
                    {o.orgStatus.replace('-', ' ')}
                  </span>
                )}
                {/*
                  The quote is the whole point: it makes the record checkable in ten
                  seconds. Shown inline rather than hidden behind a tooltip.
                */}
                {o.evidenceQuote ? (
                  <span className="block mt-2 font-mono2 text-[10.5px] leading-relaxed text-[var(--ink-faint)]">
                    Evidence on source page:{' '}
                    <span className="text-[var(--ink-soft)]">“{o.evidenceQuote}”</span>
                  </span>
                ) : (
                  <span className="block mt-2 font-mono2 text-[10px] leading-relaxed text-[var(--ink-faint)] italic">
                    Quote pending — sourced, but not yet spot-checkable.
                  </span>
                )}
              </div>

              <div className="md:col-span-1 md:text-right pt-1">
                <a
                  href={o.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={`stamp hover:bg-[var(--accent)] hover:text-[var(--bg)] transition-colors ${
                    o.evidenceQuote ? '' : 'opacity-70 border-dashed'
                  }`}
                  title={
                    o.evidenceQuote
                      ? `Verified against ${o.sourceUrl}, read ${o.sourceDate}. Search that page for: ${o.evidenceQuote}`
                      : `Sourced to ${o.sourceUrl}, read ${o.sourceDate}. No verbatim quote captured yet.`
                  }
                >
                  {o.verified} ↗
                </a>
              </div>
            </div>
          ))}

          {rows.length === 0 && (
            <div className="py-10 px-1">
              <p className="text-sm text-[var(--ink-soft)] leading-relaxed max-w-lg">
                No verified record matches that. That may mean the organization exists and we have not
                checked it yet — not that it does not exist. Unchecked candidates live in the
                repository, unpublished, until someone sources them.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
