import { useMemo } from 'react';
import { ORGANIZATIONS, type Category, type Region } from '../data/organizations';
import { ONRAMPS, type Onramp } from '../data/onramps';
import type { Preset } from '../data/preset';

/**
 * Counts and the densest region are DERIVED, every render, from ORGANIZATIONS.
 * Nothing on this card is stored. A count typed in by hand would be correct today
 * and quietly wrong the next time a record lands — which is exactly the failure
 * mode this project was built to refuse, only running slower.
 */
function useOnrampStats() {
  return useMemo(() => {
    const stats = new Map<string, { n: number; topRegion: Region | null }>();
    for (const r of ONRAMPS) {
      const cats = new Set<Category>(r.categories);
      const members = ORGANIZATIONS.filter((o) => cats.has(o.category));
      const byRegion = new Map<Region, number>();
      for (const o of members) byRegion.set(o.region, (byRegion.get(o.region) ?? 0) + 1);
      const top = [...byRegion.entries()].sort((a, b) => b[1] - a[1])[0];
      stats.set(r.id, { n: members.length, topRegion: top ? top[0] : null });
    }
    return stats;
  }, []);
}

export default function Onramps({ onPreset }: { onPreset: (p: Preset) => void }) {
  const stats = useOnrampStats();

  const choose = (r: Onramp) => {
    onPreset({ kind: 'onramp', id: r.id, label: r.label, categories: r.categories });
    document.getElementById('map')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="start"
      className="relative bg-[var(--bg)] py-20 md:py-28 border-t border-[var(--line)]"
    >
      <div className="px-5 md:px-10 max-w-[1400px] mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-12 reveal">
          <div>
            <div className="eyebrow mb-4">START HERE</div>
            <h2 className="font-display uppercase text-5xl md:text-7xl leading-[0.95]">
              What do you
              <br />
              want to do?
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-[var(--ink-soft)]">
            Same map, different doors. Pick the one that sounds like you.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ONRAMPS.map((r) => {
            const s = stats.get(r.id) ?? { n: 0, topRegion: null };

            // The thin card is a link out to #contribute rather than a filter: a
            // slice this small is not an answer, and offering it as one would be
            // the filing cabinet pretending to be a guide.
            if (r.thin) {
              return (
                <a
                  key={r.id}
                  href="#contribute"
                  className="reveal border border-dashed border-[var(--line-strong)] flex flex-col opacity-90 hover:border-[var(--accent)] transition-colors duration-300 group"
                >
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-display uppercase text-2xl tracking-wide leading-tight text-[var(--ink-soft)]">
                      {r.label}
                    </h3>
                    <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--ink)] italic">
                      “{r.question}”
                    </p>
                    <p className="mt-3 text-[13px] leading-relaxed text-[var(--ink-soft)] flex-1">
                      {r.blurb}
                    </p>
                    <div className="mt-4 pt-3 border-t border-[var(--line)] font-mono2 text-[10px] tracking-[0.12em] uppercase text-[var(--ink-faint)]">
                      {s.n} records so far
                    </div>
                  </div>
                </a>
              );
            }

            return (
              <button
                key={r.id}
                onClick={() => choose(r)}
                className="reveal text-left border border-[var(--line)] hover:border-[var(--brand)] transition-colors duration-300 flex flex-col group"
              >
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-display uppercase text-2xl tracking-wide leading-tight group-hover:text-[var(--accent)] transition-colors">
                    {r.label}
                  </h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--ink)] italic">
                    “{r.question}”
                  </p>
                  <p className="mt-3 text-[13px] leading-relaxed text-[var(--ink-soft)] flex-1">
                    {r.blurb}
                  </p>
                  <div className="mt-4 pt-3 border-t border-[var(--line)] font-mono2 text-[10px] tracking-[0.12em] uppercase text-[var(--ink-faint)]">
                    {s.n} verified records
                    {s.n >= 3 && s.topRegion ? ` · densest in ${s.topRegion}` : ''}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
