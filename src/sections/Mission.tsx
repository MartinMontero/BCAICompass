import { ORGANIZATIONS } from '../data/organizations';

export default function Mission() {
  const dates = ORGANIZATIONS.map((organization) => organization.sourceDate).sort();
  const oldest = dates[0];
  const newest = dates[dates.length - 1];
  const withCoords = ORGANIZATIONS.filter((organization) => organization.lat !== undefined).length;
  const withQuote = ORGANIZATIONS.filter((organization) => organization.evidenceQuote !== null).length;
  const quotePercent = Math.round((withQuote / ORGANIZATIONS.length) * 100);

  return (
    <section id="method" className="relative bg-[var(--bg)] py-16 md:py-24 border-t border-[var(--line)]">
      <div className="px-5 md:px-10 max-w-[1400px] mx-auto">
        <div className="grid lg:grid-cols-12 gap-6 items-end reveal">
          <div className="lg:col-span-7">
            <div className="eyebrow mb-3">THE METHOD</div>
            <h2 className="font-display uppercase text-4xl md:text-6xl leading-[0.95]">Trust is a visible process.</h2>
          </div>
          <p className="lg:col-span-4 lg:col-start-9 text-sm leading-relaxed text-[var(--ink-soft)]">Every record links the page read and when it was read. Open the source, check the claim, and use the evidence quote for a faster spot-check.</p>
        </div>

        <ol className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 reveal">
          {[
            ['01', 'Live source', 'The organization’s website or a primary source is available.'],
            ['02', 'B.C. presence', 'A British Columbia connection is explicitly supported.'],
            ['03', 'Observed category', 'Classification follows what the source says, not the name.'],
            ['04', 'Dated evidence', 'The exact page and reading date stay attached to the record.'],
          ].map(([number, title, detail]) => (
            <li key={number} className="rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--bg-raise)] p-5">
              <span className="font-mono2 text-[10px] text-[var(--accent)]">{number}</span>
              <h3 className="mt-4 font-display uppercase text-2xl">{title}</h3>
              <p className="mt-2 text-[12px] leading-relaxed text-[var(--ink-soft)]">{detail}</p>
            </li>
          ))}
        </ol>

        <div className="mt-5 grid lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7 rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--bg-raise)] p-5 md:p-7 reveal">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div><div className="eyebrow">Dataset coverage</div><h3 className="mt-2 font-display uppercase text-3xl">{ORGANIZATIONS.length} records. Zero unverified candidates.</h3></div>
              <div className="font-mono2 text-[10px] text-[var(--ink-faint)]">Read {oldest} → {newest}</div>
            </div>
            <dl className="mt-7 grid sm:grid-cols-3 gap-5">
              <div><dt className="font-mono2 text-[9px] uppercase tracking-[0.08em] text-[var(--ink-faint)]">Source URLs</dt><dd className="font-display text-4xl mt-1">{ORGANIZATIONS.length}<span className="text-xl text-[var(--ink-faint)]">/{ORGANIZATIONS.length}</span></dd></div>
              <div><dt className="font-mono2 text-[9px] uppercase tracking-[0.08em] text-[var(--ink-faint)]">Evidence quotes</dt><dd className="font-display text-4xl mt-1">{withQuote}<span className="text-xl text-[var(--ink-faint)]">/{ORGANIZATIONS.length}</span></dd></div>
              <div><dt className="font-mono2 text-[9px] uppercase tracking-[0.08em] text-[var(--ink-faint)]">Sourced coordinates</dt><dd className="font-display text-4xl mt-1">{withCoords}<span className="text-xl text-[var(--ink-faint)]">/{ORGANIZATIONS.length}</span></dd></div>
            </dl>
            <div className="mt-6">
              <div className="flex justify-between gap-3 font-mono2 text-[9px] uppercase tracking-[0.08em] text-[var(--ink-faint)] mb-2"><span>Spot-checkable by quote</span><span>{quotePercent}%</span></div>
              <div className="h-2 rounded-full bg-[var(--bg-sink)] overflow-hidden"><div className="h-full bg-[var(--brand)]" style={{ width: `${quotePercent}%` }} /></div>
              <p className="mt-2 text-[11px] text-[var(--ink-faint)]">The remaining {ORGANIZATIONS.length - withQuote} records are marked quote pending rather than quietly mixed in.</p>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-3 reveal">
            <details className="rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--bg-raise)] p-5 group">
              <summary className="min-h-11 flex items-center justify-between gap-4 cursor-pointer font-display uppercase text-xl">What stays out <span className="group-open:rotate-45 transition-transform text-[var(--accent)]">＋</span></summary>
              <ul className="mt-3 space-y-2 text-[12px] leading-relaxed text-[var(--ink-soft)]">
                <li><strong className="text-[var(--ink)]">Funding figures</strong> that cannot be confirmed reliably in one reading.</li>
                <li><strong className="text-[var(--ink)]">Personal contact details;</strong> this is a directory of organizations.</li>
                <li><strong className="text-[var(--ink)]">Generated descriptions</strong> or values inherited without fresh sourcing.</li>
                <li><strong className="text-[var(--ink)]">Guessed locations.</strong> Filled pins use stated addresses; rings mark municipal centroids, not sites.</li>
              </ul>
            </details>
            <details className="rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--bg-raise)] p-5 group">
              <summary className="min-h-11 flex items-center justify-between gap-4 cursor-pointer font-display uppercase text-xl">Provenance & rechecks <span className="group-open:rotate-45 transition-transform text-[var(--accent)]">＋</span></summary>
              <div className="mt-3 space-y-3 text-[12px] leading-relaxed text-[var(--ink-soft)]">
                <p>Candidate names began in a community ecosystem database. Every published value was then sourced fresh; the full audit remains in the repository.</p>
                <p>Oldest stamps are rechecked first. Companies and community groups are reviewed quarterly; infrastructure, research, and public bodies annually.</p>
              </div>
            </details>
            <div className="rounded-[var(--radius-md)] border border-[var(--line)] p-5">
              <div className="eyebrow">Who makes this</div>
              <p className="mt-3 text-[12px] leading-relaxed text-[var(--ink-soft)]">A <strong className="text-[var(--ink)]">BC + AI Ecosystem Association</strong> project, built by <a href="https://www.linkedin.com/in/martinmontero/" target="_blank" rel="noreferrer" className="text-[var(--accent)] underline underline-offset-4">Martin Montero</a>. BC + AI is listed here. No listing is paid for, and no other listed organization is presented as a partner or funder.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
