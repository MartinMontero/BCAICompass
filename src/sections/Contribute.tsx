const EMAIL = 'hello@bcaicompass.ca';
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
              Send a source,
              <br />
              not a name.
            </h2>
            <p className="mt-6 text-base leading-relaxed text-[var(--ink-soft)]">
              Missing organizations are the expected state of this dataset, not a failure of it. What
              it cannot absorb is an unsourced name — that is exactly how the dataset this replaced
              ended up with 1,399 rows and no way to tell which were real.
            </p>
            <p className="mt-4 text-base leading-relaxed text-[var(--ink-soft)]">
              So: one link that proves the thing you are telling us. That is the whole bar.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={`mailto:${EMAIL}?subject=${encodeURIComponent('BC AI Compass — add or correct an organization')}`}
                className="btn-primary"
              >
                Email a correction
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
                    b: 'A live page on a domain it controls. Not a LinkedIn company page, not a Meetup group, not an aggregator listing — those are hints, and we will follow them, but they are not the answer.',
                  },
                  {
                    n: '02',
                    h: 'A page proving BC presence',
                    b: 'An address, a locations page, a contact page, or a primary source stating BC operation. A BC-sounding name is not evidence. Neither is a .ca domain.',
                  },
                  {
                    n: '03',
                    h: 'A page showing the AI is real',
                    b: 'Where the organization itself says what AI or machine-learning work it does, funds, teaches, convenes or hosts. Being written about in an AI article is not the same as doing AI.',
                  },
                  {
                    n: '04',
                    h: 'A correction? Point at the page.',
                    b: 'If a record is wrong, closed, acquired, or moved, send the page that shows it. We would much rather remove a record than carry a wrong one.',
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
                We do not list individuals, and we do not publish anyone's email or phone number. If
                you would rather your organization were not listed, say so and it comes off — no
                argument.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
