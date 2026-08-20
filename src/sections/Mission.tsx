import { ORGANIZATIONS } from '../data/organizations';

/**
 * The method statement. This is the load-bearing section of the site: it is the
 * only reason a reader should believe anything else on the page.
 */
export default function Mission() {
  const dates = ORGANIZATIONS.map((o) => o.sourceDate).sort();
  const oldest = dates[0];
  const newest = dates[dates.length - 1];
  const withCoords = ORGANIZATIONS.filter((o) => o.lat !== undefined).length;
  const withDescription = ORGANIZATIONS.filter((o) => o.description !== null).length;
  const withQuote = ORGANIZATIONS.filter((o) => o.evidenceQuote !== null).length;

  return (
    <section
      id="method"
      className="relative bg-[var(--bg)] py-20 md:py-28 border-t border-[var(--line)]"
    >
      <div className="px-5 md:px-10 max-w-[1400px] mx-auto">
        <div className="eyebrow mb-4 reveal">HOW WE CHECK</div>
        <h2 className="font-display uppercase text-5xl md:text-7xl leading-[0.95] max-w-[18ch] reveal">
          Every record has a source. Here's why.
        </h2>

        <div className="mt-12 grid md:grid-cols-12 gap-x-10 gap-y-12">
          <div className="md:col-span-7 reveal">
            <p className="text-base md:text-lg leading-relaxed text-[var(--ink-soft)]">
              We publish a record when four things are true. The organization's website is live.
              Its British Columbia presence is confirmed from its own site or a primary source. Its
              category comes from what the page actually says, not what the name sounds like. And
              the specific page we read, plus the date we read it, are on the record itself.
            </p>

            <p className="mt-5 text-base md:text-lg leading-relaxed text-[var(--ink-soft)]">
              That last part is the whole point. If you can see where we looked, you can check
              whether we got it right. Every stamp on this site is a link. Follow it.
            </p>

            <h3 className="font-display uppercase text-2xl md:text-3xl mt-12 mb-4">
              Evidence quotes — and the ones still pending
            </h3>
            <p className="text-base leading-relaxed text-[var(--ink-soft)]">
              Most records carry an <strong className="text-[var(--ink)]">evidence quote</strong> — a
              short string copied straight off the source page, printed under the record. Open the
              source, search for the string. If it's there, the record checks out in about ten
              seconds.
            </p>
            <p className="mt-4 text-base leading-relaxed text-[var(--ink-soft)]">
              The rest are marked{' '}
              <strong className="text-[var(--ink)]">quote pending</strong>: sourced and checked, but
              we didn't capture a verbatim string, so they take longer to verify. They're marked
              rather than quietly mixed in.
            </p>

            <h3 className="font-display uppercase text-2xl md:text-3xl mt-12 mb-4">
              What you won't find here
            </h3>
            <ul className="space-y-3 text-[15px] leading-relaxed text-[var(--ink-soft)]">
              <li className="flex gap-3">
                <span className="text-[var(--accent)] font-mono2 text-xs pt-1 shrink-0">01</span>
                <span>
                  <strong className="text-[var(--ink)]">Funding figures.</strong> They change fast,
                  they're hard to confirm in one reading, and a wrong number gets quoted forever. We
                  leave them out.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-[var(--accent)] font-mono2 text-xs pt-1 shrink-0">02</span>
                <span>
                  <strong className="text-[var(--ink)]">Personal contact details.</strong> This is a
                  directory of organizations, not people.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-[var(--accent)] font-mono2 text-xs pt-1 shrink-0">03</span>
                <span>
                  <strong className="text-[var(--ink)]">Generated descriptions.</strong> If a source
                  didn't support a description, the field is blank. No blurb is made up from a name.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-[var(--accent)] font-mono2 text-xs pt-1 shrink-0">04</span>
                <span>
                  <strong className="text-[var(--ink)]">Guessed locations.</strong> Pins come from a
                  named gazetteer, not from memory. No confirmed location means no pin. On the map a
                  filled dot is a pin geocoded from an address the source states; a hollow ring is a
                  municipal centroid, marking the city rather than the site.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-[var(--accent)] font-mono2 text-xs pt-1 shrink-0">05</span>
                <span>
                  <strong className="text-[var(--ink)]">Inherited values.</strong> Candidate names
                  came from an older dataset. Every published field was sourced fresh.
                </span>
              </li>
            </ul>
          </div>

          <div className="md:col-span-5 reveal">
            <div className="border border-[var(--line)] p-6 bg-[var(--bg-raise)]">
              <div className="font-mono2 text-[10px] tracking-[0.18em] uppercase text-[var(--ink-faint)] mb-5">
                This dataset, in numbers
              </div>
              <dl className="space-y-4">
                {[
                  ['Verified organizations', String(ORGANIZATIONS.length)],
                  ['Records with a source URL', `${ORGANIZATIONS.length} of ${ORGANIZATIONS.length}`],
                  ['Spot-checkable by quote', `${withQuote} of ${ORGANIZATIONS.length}`],
                  ['Marked quote pending', String(ORGANIZATIONS.length - withQuote)],
                  ['Records with sourced coordinates', `${withCoords} of ${ORGANIZATIONS.length}`],
                  ['Records with a description', `${withDescription} of ${ORGANIZATIONS.length}`],
                  ['Sources read between', `${oldest} and ${newest}`],
                  ['Unverified candidates published', '0'],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-baseline justify-between gap-4 border-b border-[var(--line)] pb-3">
                    <dt className="text-[13px] text-[var(--ink-soft)]">{k}</dt>
                    <dd className="font-mono2 text-sm text-[var(--ink)] shrink-0">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="border border-[var(--line)] p-6 mt-4">
              <div className="font-mono2 text-[10px] tracking-[0.18em] uppercase text-[var(--accent)] mb-3">
                Who makes this
              </div>
              <p className="text-[13.5px] leading-relaxed text-[var(--ink-soft)]">
                A{' '}
                <strong className="text-[var(--ink)]">BC + AI Ecosystem Association</strong> project,
                built by Martin Montero. BC + AI is listed in this directory — we'd rather say that
                up front than leave you to spot it.
              </p>
              <p className="mt-3 text-[13.5px] leading-relaxed text-[var(--ink-soft)]">
                No other listed organization is a partner or funder. No listing is paid for, and
                none can be.
              </p>
            </div>

            <div className="border border-[var(--line)] p-6 mt-4">
              <div className="font-mono2 text-[10px] tracking-[0.18em] uppercase text-[var(--ink-faint)] mb-3">
                Where the data came from
              </div>
              <p className="text-[13.5px] leading-relaxed text-[var(--ink-soft)]">
                We started from a community ecosystem database — a list of names to go and check.
                Every published value was sourced fresh from the organization's own site. The full
                audit is in the repository.
              </p>
            </div>

            <div className="border border-[var(--line)] p-6 mt-4">
              <div className="font-mono2 text-[10px] tracking-[0.18em] uppercase text-[var(--ink-faint)] mb-3">
                How often we re-check
              </div>
              <p className="text-[13.5px] leading-relaxed text-[var(--ink-soft)]">
                Oldest stamps first, always. Companies and community groups quarterly.
                Infrastructure, research and public bodies annually. BC Hydro's AI data-centre
                power allocation lands in September 2026 — those records will move before most
                others.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
