// TODO: Martin — confirm with Kris whether hello@bc-ai.ca is the right contact
// address for Compass submissions, or whether a separate address is needed.
const EMAIL = 'hello@bc-ai.ca';
const REPO = 'https://github.com/MartinMontero/bcaicompass';

export default function Contribute() {
  return (
    <section
      id="contribute"
      className="relative bg-[var(--bg-raise)] py-20 md:py-28 border-t border-[var(--line)]"
    >
      <div className="px-5 md:px-10 max-w-[1400px] mx-auto">
        <div className="grid md:grid-cols-12 gap-x-10 gap-y-10">
          <div className="md:col-span-6 reveal">
            <div className="eyebrow mb-4">CONTRIBUTE</div>
            <h2 className="font-display uppercase text-5xl md:text-6xl leading-[0.95]">
              Help us fill
              <br />
              in the map.
            </h2>
            <p className="mt-6 text-base leading-relaxed text-[var(--ink-soft)]">
              There are BC AI organizations we haven't found yet. If you know one, point us at a
              page — that's the whole bar.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={`mailto:${EMAIL}?subject=${encodeURIComponent('BC AI Compass — add or correct an organization')}`}
                className="btn-primary"
              >
                Send us a link
              </a>
              <a href={REPO} target="_blank" rel="noreferrer" className="btn-ghost">
                Open a pull request ↗
              </a>
            </div>
          </div>

          <div className="md:col-span-6 reveal">
            <div className="border border-[var(--line)] p-6 md:p-8">
              <div className="font-mono2 text-[10px] tracking-[0.18em] uppercase text-[var(--ink-faint)] mb-5">
                What a submission needs
              </div>

              <ol className="space-y-5">
                {[
                  {
                    n: '01',
                    h: 'The organization\'s own website',
                    b: 'A live page on a domain it controls. LinkedIn and Meetup are useful hints — we\'ll follow them — but we need the org\'s own site.',
                  },
                  {
                    n: '02',
                    h: 'A page proving BC presence',
                    b: 'An address, a contact page, or a primary source confirming BC presence.',
                  },
                  {
                    n: '03',
                    h: 'A page showing the AI is real',
                    b: 'Where the organization says what AI work it does, funds, teaches or hosts.',
                  },
                  {
                    n: '04',
                    h: 'A correction? Point at the page.',
                    b: 'If a record is wrong, closed, acquired or moved, point us at the page. We\'d rather take a record down than carry a wrong one.',
                  },
                ].map((s) => (
                  <li key={s.n} className="flex gap-4">
                    <span className="font-mono2 text-[11px] text-[var(--accent)] pt-1 shrink-0">{s.n}</span>
                    <span>
                      <span className="font-display uppercase text-lg tracking-wide block leading-tight">
                        {s.h}
                      </span>
                      <span className="text-[13px] leading-relaxed text-[var(--ink-soft)] block mt-1.5">
                        {s.b}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>

              <p className="mt-7 pt-5 border-t border-[var(--line)] text-[12.5px] leading-relaxed text-[var(--ink-faint)]">
                We don't list individuals or publish contact details. If you'd rather your
                organization weren't listed, say so and it comes off.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
