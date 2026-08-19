import { MAPPED, ORGANIZATIONS, REGIONS } from '../data/organizations';

export default function Hero() {
  const regionsCovered = REGIONS.filter((r) => ORGANIZATIONS.some((o) => o.region === r)).length;
  const stamp = ORGANIZATIONS.map((o) => o.verified).sort().slice(-1)[0];

  return (
    <section id="top" className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 22% 12%, var(--hero-glow), transparent 70%)',
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
        }}
      />

      <div className="relative px-5 md:px-10 max-w-[1400px] mx-auto">
        <div className="eyebrow mb-6 reveal">BRITISH COLUMBIA · INDEPENDENT · SOURCE-STAMPED</div>

        <h1 className="font-display uppercase leading-[0.9] text-[13vw] md:text-[8.5vw] lg:text-[7.5vw] max-w-[15ch] reveal">
          Who is actually
          <br />
          doing AI
          <br />
          in <span className="text-[var(--accent)]">B.C.</span>
        </h1>

        <div className="mt-10 grid md:grid-cols-12 gap-8 items-start">
          <p className="md:col-span-5 text-base md:text-lg leading-relaxed text-[var(--ink-soft)] reveal">
            A map and directory of British Columbia's AI ecosystem where{' '}
            <strong className="text-[var(--ink)]">every record names the page it was checked
            against and the day it was checked.</strong>{' '}
            Companies, university labs, public programs, community groups, and the data centres now
            being built in Kamloops, Merritt and Vancouver.
          </p>

          <div className="md:col-span-4 md:col-start-8 reveal">
            <dl className="grid grid-cols-3 gap-4 border-t border-[var(--line)] pt-5">
              <div>
                <dt className="font-mono2 text-[9.5px] tracking-[0.16em] uppercase text-[var(--ink-faint)]">
                  Verified
                </dt>
                <dd className="font-display text-4xl md:text-5xl mt-1">{ORGANIZATIONS.length}</dd>
              </div>
              <div>
                <dt className="font-mono2 text-[9.5px] tracking-[0.16em] uppercase text-[var(--ink-faint)]">
                  On the map
                </dt>
                <dd className="font-display text-4xl md:text-5xl mt-1">{MAPPED.length}</dd>
              </div>
              <div>
                <dt className="font-mono2 text-[9.5px] tracking-[0.16em] uppercase text-[var(--ink-faint)]">
                  Regions
                </dt>
                <dd className="font-display text-4xl md:text-5xl mt-1">{regionsCovered}</dd>
              </div>
            </dl>
            <p className="font-mono2 text-[10px] tracking-[0.1em] text-[var(--ink-faint)] mt-4 leading-relaxed">
              Newest verification stamp: {stamp}. Unverified candidates are not published.
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-3 reveal">
          <a href="#map" className="btn-primary">
            Open the map
          </a>
          <a href="#method" className="btn-ghost">
            What "verified" means here
          </a>
          <a
            href="./ecosystem.json"
            className="font-mono2 text-[11px] tracking-[0.14em] text-[var(--accent)] hover:text-[var(--ink)] transition-colors ml-1"
          >
            ecosystem.json ↓
          </a>
        </div>
      </div>
    </section>
  );
}
