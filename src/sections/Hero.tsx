import { CATEGORIES, CATEGORY_COLORS, MAPPED, ORGANIZATIONS, REGIONS } from '../data/organizations';

export default function Hero() {
  const regionsCovered = REGIONS.filter((region) => ORGANIZATIONS.some((organization) => organization.region === region)).length;
  const stamp = ORGANIZATIONS.map((organization) => organization.verified).sort().slice(-1)[0];
  const regionRanking = REGIONS.map((region) => ({ region, count: ORGANIZATIONS.filter((organization) => organization.region === region).length }))
    .filter((entry) => entry.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  const maxRegion = regionRanking[0]?.count ?? 1;
  const quoted = ORGANIZATIONS.filter((organization) => organization.evidenceQuote !== null).length;

  return (
    <section id="top" className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-20">
      <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 55% at 22% 12%, var(--hero-glow), transparent 70%)' }} />
      <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)', backgroundSize: '64px 64px' }} />

      <div className="relative px-5 md:px-10 max-w-[1400px] mx-auto grid lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7">
          <div className="eyebrow mb-5 reveal">BC + AI ECOSYSTEM · VERIFIED OPEN DATA</div>
          <h1 className="font-display uppercase leading-[0.92] text-[12vw] sm:text-7xl md:text-8xl lg:text-[6.4vw] max-w-[12ch] reveal">
            Find your next move in B.C. AI.
          </h1>
          <p className="mt-7 max-w-xl text-base md:text-lg leading-relaxed text-[var(--ink-soft)] reveal">
            Find verified organizations, build a regional action plan, compare candidates, and leave with a working checklist—not just another directory.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3 reveal">
            <a href="#ask" className="btn-primary">Find organizations</a>
            <a href="#planner" className="btn-ghost">Build an action plan</a>
          </div>
          <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-[var(--line)] pt-5 max-w-xl reveal">
            <div><dt className="font-mono2 text-[9px] tracking-[0.12em] uppercase text-[var(--ink-faint)]">Verified</dt><dd className="font-display text-4xl mt-1">{ORGANIZATIONS.length}</dd></div>
            <div><dt className="font-mono2 text-[9px] tracking-[0.12em] uppercase text-[var(--ink-faint)]">Mapped</dt><dd className="font-display text-4xl mt-1">{MAPPED.length}</dd></div>
            <div><dt className="font-mono2 text-[9px] tracking-[0.12em] uppercase text-[var(--ink-faint)]">Regions</dt><dd className="font-display text-4xl mt-1">{regionsCovered}</dd></div>
          </dl>
        </div>

        <div className="lg:col-span-5 reveal">
          <div className="rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--bg-raise)] shadow-[var(--shadow-md)] p-5 md:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="eyebrow">Live dataset snapshot</div>
                <p className="mt-1 font-mono2 text-[9px] uppercase tracking-[0.06em] text-[var(--ink-faint)]">Sources last checked through {stamp}</p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] px-3 py-1.5 font-mono2 text-[8px] uppercase tracking-[0.08em] text-[var(--ink-soft)]"><span className="w-1.5 h-1.5 rounded-full bg-[var(--brand)]" />Sourced</span>
            </div>

            <div className="mt-7">
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="font-mono2 text-[9px] uppercase tracking-[0.1em] text-[var(--ink-faint)]">Category coverage</span>
                <span className="font-mono2 text-[9px] text-[var(--ink-soft)]">{quoted} evidence quotes</span>
              </div>
              <div className="flex h-3 overflow-hidden rounded-full bg-[var(--bg-sink)]" aria-label="Verified organizations by category">
                {CATEGORIES.map((category) => {
                  const count = ORGANIZATIONS.filter((organization) => organization.category === category).length;
                  return <span key={category} title={`${category}: ${count}`} style={{ width: `${(count / ORGANIZATIONS.length) * 100}%`, background: CATEGORY_COLORS[category] }} />;
                })}
              </div>
              <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
                {CATEGORIES.map((category) => <span key={category} className="font-mono2 text-[8px] uppercase text-[var(--ink-faint)]"><span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5" style={{ background: CATEGORY_COLORS[category] }} />{category}</span>)}
              </div>
            </div>

            <div className="mt-7 border-t border-[var(--line)] pt-5">
              <div className="font-mono2 text-[9px] uppercase tracking-[0.1em] text-[var(--ink-faint)] mb-4">Largest regional record sets</div>
              <div className="space-y-3">
                {regionRanking.map(({ region, count }) => (
                  <div key={region} className="grid grid-cols-[minmax(0,1fr)_2rem] gap-3 items-center">
                    <div>
                      <div className="flex justify-between gap-2 text-[11px] mb-1"><span className="truncate">{region}</span></div>
                      <div className="h-1.5 rounded-full bg-[var(--bg-sink)] overflow-hidden"><div className="h-full rounded-full bg-[var(--brand)]" style={{ width: `${(count / maxRegion) * 100}%` }} /></div>
                    </div>
                    <span className="font-mono2 text-[10px] text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <a href="#regions" className="mt-6 min-h-11 flex items-center justify-between border-t border-[var(--line)] pt-4 font-mono2 text-[9px] uppercase tracking-[0.08em] text-[var(--accent)] hover:text-[var(--ink)]">Explore the regional atlas <span>→</span></a>
          </div>
        </div>
      </div>
    </section>
  );
}
