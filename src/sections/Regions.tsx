import { useMemo } from 'react';
import {
  CATEGORY_COLORS,
  ORGANIZATIONS,
  REGIONS,
  type Category,
  type Region,
} from '../data/organizations';

/**
 * Editorial notes on the regions.
 *
 * These are the only sentences on this site that are not a sourced claim about a
 * specific organization, so the rule for them is strict: each note describes only
 * what the verified records in that region show, and nothing beyond. A statement
 * about the dataset is checkable against the dataset. A statement about the world
 * ("Kamloops is emerging as BC's AI hub") is not, and does not appear.
 *
 * A region with no verified records gets no card at all — rendering an empty card
 * would assert that a region has nothing, which is a claim this project cannot
 * source.
 */
const NOTES: Partial<Record<Region, string>> = {
  'Metro Vancouver':
    'The densest cluster. University research, two of the three TELUS AI factory sites, and most of the companies.',
  'Thompson-Okanagan':
    'Where the compute is. Every AI data-centre record outside Vancouver sits in Kamloops or Merritt, alongside TRU and UBC Okanagan.',
  'Vancouver Island & Coast':
    'UVic research and Victoria companies, a Comox Valley community, and a regional district that adopted AI governance policy in 2026.',
  'Fraser Valley':
    'A new regional AI community covering Langley to Chilliwack. Early days — more to find here.',
  'Province-wide':
    'Organizations whose mandate covers all of BC. Region here is mandate, not mailing address.',
  Cariboo: 'Records verified in the Cariboo region.',
  'North Coast & Nechako': 'Records verified in the North Coast and Nechako region.',
  Northeast: 'Records verified in the Northeast region.',
  Kootenay: 'Records verified in the Kootenay region.',
};

export default function Regions() {
  const byRegion = useMemo(
    () =>
      REGIONS.map((r) => {
        const items = ORGANIZATIONS.filter((o) => o.region === r);
        const cats = new Map<Category, number>();
        for (const o of items) cats.set(o.category, (cats.get(o.category) ?? 0) + 1);
        return {
          region: r,
          items,
          mix: [...cats.entries()].sort((a, b) => b[1] - a[1]),
        };
      }).filter((g) => g.items.length > 0),
    []
  );

  const covered = byRegion.length;
  const uncovered = REGIONS.filter((r) => !byRegion.some((g) => g.region === r));

  const focus = (r: Region) => {
    window.dispatchEvent(new CustomEvent<Region>('bcac:region', { detail: r }));
    document.getElementById('map')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="regions"
      className="relative bg-[var(--bg-raise)] py-20 md:py-28 border-t border-[var(--line)]"
    >
      <div className="px-5 md:px-10 max-w-[1400px] mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-12 reveal">
          <div>
            <div className="eyebrow mb-4">THE REGIONS</div>
            <h2 className="font-display uppercase text-5xl md:text-7xl leading-[0.95]">
              The whole
              <br />
              province.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-[var(--ink-soft)]">
            BC's AI work reaches further than Vancouver. {covered} of {REGIONS.length} regions
            have at least one sourced record. Click a region to filter the map to it.{' '}
            {uncovered.length > 0 && (
              <>
                The {uncovered.length === 1 ? 'other one is' : `other ${uncovered.length} are`} marked{' '}
                <strong className="text-[var(--ink)]">not yet surveyed</strong> — which means we
                haven't looked yet, not that nothing's happening.
              </>
            )}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {byRegion.map((g) => (
            <button
              key={g.region}
              onClick={() => focus(g.region)}
              className="reveal text-left border border-[var(--line)] hover:border-[var(--brand)] transition-colors duration-300 flex flex-col group"
            >
              <div className="flex items-baseline justify-between px-5 pt-4 pb-3 border-b border-dashed border-[var(--line)]">
                <span className="font-mono2 text-[10px] tracking-[0.18em] text-[var(--ink-faint)] uppercase">
                  {g.items.length} verified
                </span>
                <span className="font-mono2 text-[10px] tracking-[0.18em] text-[var(--accent)] group-hover:text-[var(--ink)] transition-colors">
                  Filter map ↑
                </span>
              </div>

              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-display uppercase text-2xl tracking-wide leading-tight">
                  {g.region}
                </h3>

                <p className="mt-2.5 text-[13px] leading-relaxed text-[var(--ink-soft)] flex-1">
                  {NOTES[g.region]}
                </p>

                <div className="mt-4 pt-3 border-t border-[var(--line)] flex flex-wrap gap-x-3 gap-y-1.5">
                  {g.mix.map(([c, n]) => (
                    <span
                      key={c}
                      className="font-mono2 text-[9px] tracking-[0.08em] uppercase"
                      style={{ color: CATEGORY_COLORS[c] }}
                    >
                      <span
                        className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle"
                        style={{ background: CATEGORY_COLORS[c] }}
                      />
                      {c} {n}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/*
          A region with no records is rendered as an explicit NOT YET SURVEYED card,
          sitting in the same grid as the others. Leaving it out — or drawing it with
          a zero — would let a reader conclude the region has no AI activity, which is
          a claim nobody has checked. The absence of a search is not a finding.
        */}
        {uncovered.length > 0 && (
          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {uncovered.map((r) => (
              <div
                key={r}
                className="reveal border border-dashed border-[var(--line-strong)] flex flex-col opacity-90"
              >
                <div className="flex items-baseline justify-between px-5 pt-4 pb-3 border-b border-dashed border-[var(--line)]">
                  <span className="font-mono2 text-[10px] tracking-[0.18em] text-[var(--accent)] uppercase">
                    Not yet surveyed
                  </span>
                  <span className="font-mono2 text-[10px] tracking-[0.18em] text-[var(--ink-faint)]">
                    —
                  </span>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-display uppercase text-2xl tracking-wide leading-tight text-[var(--ink-soft)]">
                    {r}
                  </h3>
                  <p className="mt-2.5 text-[13px] leading-relaxed text-[var(--ink-soft)] flex-1">
                    We haven't reached this region yet. Zero records here means zero
                    searching, not zero AI.
                  </p>
                  <a
                    href="#contribute"
                    className="mt-4 pt-3 border-t border-[var(--line)] font-mono2 text-[10px] tracking-[0.14em] uppercase text-[var(--accent)] hover:text-[var(--ink)] transition-colors"
                  >
                    Know something here? Tell us ↓
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
