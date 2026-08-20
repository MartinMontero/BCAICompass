import { useMemo } from 'react';
import { CATEGORY_COLORS, ORGANIZATIONS, type Organization } from '../data/organizations';
import { PATHWAYS } from '../data/pathways';
import type { Preset } from '../data/preset';

export default function Pathways({ onPreset }: { onPreset: (p: Preset) => void }) {
  const byId = useMemo(() => {
    const m = new Map<string, Organization>();
    for (const o of ORGANIZATIONS) m.set(o.id, o);
    return m;
  }, []);

  const trace = (id: string, name: string, stops: string[]) => {
    onPreset({ kind: 'pathway', id, name, stops });
    document.getElementById('map')?.scrollIntoView({ behavior: 'smooth' });
  };

  /**
   * Selecting a stop reuses the map's own selected/FlyTo mechanism rather than
   * introducing a second one: the map already listens for bcac:region from the
   * Regions section, so bcac:select is the same channel carrying a different
   * command. Ownership of `selected` stays inside EcosystemMap, where the row
   * hover handler also writes it — lifting it would re-render this section on
   * every hover for no benefit.
   */
  const goToStop = (o: Organization) => {
    window.dispatchEvent(new CustomEvent<string>('bcac:select', { detail: o.id }));
    document.getElementById('map')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="pathways"
      className="relative bg-[var(--bg)] py-20 md:py-28 border-t border-[var(--line)]"
    >
      <div className="px-5 md:px-10 max-w-[1400px] mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-12 reveal">
          <div>
            <div className="eyebrow mb-4">PATHWAYS</div>
            <h2 className="font-display uppercase text-5xl md:text-7xl leading-[0.95]">
              Routes through
              <br />
              the room.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-[var(--ink-soft)]">
            Four ways to move through the ecosystem, in order. Every stop is a verified record —
            click one and the map takes you there.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {PATHWAYS.map((p, pi) => (
            <div
              key={p.id}
              className="reveal border border-[var(--line)] bg-[var(--bg-raise)] flex flex-col hover:border-[var(--line-strong)] transition-colors duration-300"
            >
              <div className="flex items-center justify-between px-6 md:px-8 pt-6 pb-4 border-b border-dashed border-[var(--line)]">
                <span className="font-mono2 text-[10px] tracking-[0.2em] text-[var(--ink-faint)] uppercase">
                  P{pi + 1} · {p.stops.length} stops
                </span>
              </div>

              <div className="p-6 md:p-8 flex flex-col flex-1">
                <h3 className="font-display uppercase text-2xl md:text-3xl tracking-wide leading-tight">
                  {p.name}
                </h3>
                <p className="mt-3 text-[13.5px] leading-relaxed text-[var(--ink-soft)]">{p.blurb}</p>

                {p.note && (
                  <p className="mt-3 font-mono2 text-[10px] tracking-[0.08em] text-[var(--accent)] leading-relaxed uppercase">
                    {p.note}
                  </p>
                )}

                <ol className="mt-6 flex-1 relative">
                  <span
                    aria-hidden
                    className="absolute left-[9px] top-2 bottom-2 w-px bg-[var(--line-strong)]"
                  />
                  {p.stops.map((sid, si) => {
                    const o = byId.get(sid);
                    if (!o) return null;
                    return (
                      <li key={sid} className="flex items-baseline gap-4 py-1.5 relative">
                        <span
                          className="relative z-10 block w-[19px] h-[19px] rounded-full border-2 bg-[var(--bg-raise)] shrink-0 text-center font-mono2 text-[9px] leading-[15px] text-[var(--ink-soft)]"
                          style={{ borderColor: CATEGORY_COLORS[o.category] }}
                        >
                          {si + 1}
                        </span>
                        <button
                          onClick={() => goToStop(o)}
                          className="text-left text-sm text-[var(--ink)] hover:text-[var(--accent)] transition-colors"
                        >
                          {o.name}
                        </button>
                        <span className="hidden md:inline font-mono2 text-[9.5px] tracking-[0.06em] text-[var(--ink-faint)] uppercase truncate">
                          {o.region}
                        </span>
                      </li>
                    );
                  })}
                </ol>

                <button
                  onClick={() => trace(p.id, p.name, p.stops)}
                  className="mt-7 self-start font-mono2 text-[10.5px] tracking-[0.18em] border border-[var(--accent)] text-[var(--accent)] px-5 py-2.5 hover:bg-[var(--brand)] hover:text-[var(--brand-ink)] transition-colors"
                >
                  Trace it on the map ↑
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
