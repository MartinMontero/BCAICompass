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
    'The densest part of the dataset, and the part most at risk of being mistaken for the whole province. Most of it is university research units and two of the three TELUS AI factory sites.',
  'Thompson-Okanagan':
    'Where the compute is. Every AI data-centre record in this dataset outside Vancouver sits here — Kamloops and Merritt — alongside Thompson Rivers University and UBC Okanagan.',
  'Vancouver Island & Coast':
    'Two distinct clusters: University of Victoria research and Victoria companies, plus a Comox Valley community group and a regional district that adopted an AI governance policy in May 2026.',
  'Fraser Valley':
    'One record: a regional AI community covering Langley to Chilliwack. Thin coverage here is a gap in this dataset, not a finding about the Fraser Valley.',
  'Province-wide':
    'Organizations whose mandate is the whole province. Region here records mandate, not address — some have a head office and keep its pin, while others publish no address at all and correctly have none.',
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
              Not just the
              <br />
              Lower Mainland.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-[var(--ink-soft)]">
            British Columbia's AI activity is distributed, and the usual maps flatten it into
            "Vancouver tech". These are the {covered} regions where something is verified. Click a
            region to filter the map to it.
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

        {uncovered.length > 0 && (
          <div className="mt-10 reveal border-l-2 border-[var(--line-strong)] pl-5 max-w-2xl">
            <div className="font-mono2 text-[10px] tracking-[0.18em] uppercase text-[var(--ink-faint)] mb-2">
              Not yet covered
            </div>
            <p className="text-sm leading-relaxed text-[var(--ink-soft)]">
              {uncovered.join(' · ')} — no organization in {uncovered.length === 1 ? 'this' : 'these'}{' '}
              {uncovered.length === 1 ? 'region' : 'regions'} has been verified yet.{' '}
              <strong className="text-[var(--ink)]">That is a gap in this dataset, not a statement
              about the region.</strong>{' '}
              If you work in AI there, the fastest way to fix it is to{' '}
              <a href="#contribute" className="text-[var(--accent)] hover:text-[var(--ink)] underline">
                send us a source
              </a>
              .
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
