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

  return (
    <section
      id="method"
      className="relative bg-[var(--bg)] py-20 md:py-28 border-t border-[var(--line)]"
    >
      <div className="px-5 md:px-10 max-w-[1400px] mx-auto">
        <div className="eyebrow mb-4 reveal">THE METHOD</div>
        <h2 className="font-display uppercase text-5xl md:text-7xl leading-[0.95] max-w-[18ch] reveal">
          What "verified" means here.
        </h2>

        <div className="mt-12 grid md:grid-cols-12 gap-x-10 gap-y-12">
          <div className="md:col-span-7 reveal">
            <p className="text-base md:text-lg leading-relaxed text-[var(--ink-soft)]">
              A record is published only when four things are true at once. Its website resolved and
              was live when someone loaded it. Its British Columbia presence was confirmed from the
              organization's own site or from a primary source. Its category was assigned from content
              actually read, not guessed from the name. And the specific page read, plus the date it
              was read, are recorded on the record itself.
            </p>

            <p className="mt-5 text-base md:text-lg leading-relaxed text-[var(--ink-soft)]">
              That last part is the whole idea. A directory that tells you <em>when</em> it was
              checked but not <em>against what</em> cannot be audited, corrected, or trusted — it can
              only be believed. Every stamp on this site is a link. Follow it and judge for yourself.
            </p>

            <h3 className="font-display uppercase text-2xl md:text-3xl mt-12 mb-4">
              What we refuse to publish
            </h3>
            <ul className="space-y-3 text-[15px] leading-relaxed text-[var(--ink-soft)]">
              <li className="flex gap-3">
                <span className="text-[var(--accent)] font-mono2 text-xs pt-1 shrink-0">01</span>
                <span>
                  <strong className="text-[var(--ink)]">Funding figures.</strong> Permanently out of
                  scope. Funding is the field most likely to be wrong, most likely to be quoted, and
                  hardest to confirm from a primary source in one reading.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-[var(--accent)] font-mono2 text-xs pt-1 shrink-0">02</span>
                <span>
                  <strong className="text-[var(--ink)]">Names and emails of individuals.</strong>{' '}
                  Republishing scraped contact details is a privacy problem before it is an accuracy
                  problem. This is a directory of organizations.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-[var(--accent)] font-mono2 text-xs pt-1 shrink-0">03</span>
                <span>
                  <strong className="text-[var(--ink)]">Generated descriptions.</strong> No blurb is
                  produced from a name, a domain, or a category. Where a source did not support a
                  description, the field is blank and the site says so.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-[var(--accent)] font-mono2 text-xs pt-1 shrink-0">04</span>
                <span>
                  <strong className="text-[var(--ink)]">Coordinates we invented.</strong> Pins are
                  municipal centroids from a named gazetteer, never a guessed street address. An
                  organization with no confirmed location has no pin, and that is a correct outcome.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-[var(--accent)] font-mono2 text-xs pt-1 shrink-0">05</span>
                <span>
                  <strong className="text-[var(--ink)]">Anything inherited.</strong> Candidate names
                  came from an older dataset. Not one published value did. Every field here was
                  sourced from scratch.
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
                Independence
              </div>
              <p className="text-[13.5px] leading-relaxed text-[var(--ink-soft)]">
                BC AI Compass is independent. It is{' '}
                <strong className="text-[var(--ink)]">not affiliated with, endorsed by, or produced
                for</strong>{' '}
                any organization listed in it, including the BC + AI Ecosystem Association, and
                including any company or public body named in the compute and infrastructure records.
                Nobody paid for a listing. Nobody can.
              </p>
            </div>

            <div className="border border-[var(--line)] p-6 mt-4">
              <div className="font-mono2 text-[10px] tracking-[0.18em] uppercase text-[var(--ink-faint)] mb-3">
                Where the data came from
              </div>
              <p className="text-[13.5px] leading-relaxed text-[var(--ink-soft)]">
                A year-old public dump of a community ecosystem database supplied a list of{' '}
                <em>names to go and check</em> — and nothing else. That dump held 1,399 rows, of which
                262 turned out not to be organizations at all but lines lifted from a report. The full
                audit, including the counts and the commands that reproduce them, is in the
                repository.
              </p>
            </div>

            <div className="border border-[var(--line)] p-6 mt-4">
              <div className="font-mono2 text-[10px] tracking-[0.18em] uppercase text-[var(--ink-faint)] mb-3">
                How often it is re-checked
              </div>
              <p className="text-[13.5px] leading-relaxed text-[var(--ink-soft)]">
                Oldest stamps first. Companies and community groups quarterly — they change fastest.
                Infrastructure, research and public bodies annually. British Columbia's power
                allocation for AI data centres is decided in September 2026, so the compute records
                will move before most others do.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
