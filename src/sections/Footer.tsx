import { ORGANIZATIONS } from '../data/organizations';

const REPO = 'https://github.com/MartinMontero/bcaicompass';

export default function Footer() {
  const newest = ORGANIZATIONS.map((o) => o.verified).sort().slice(-1)[0];

  return (
    <footer className="bg-[var(--bg-sink)] border-t border-[var(--line)] py-14">
      <div className="px-5 md:px-10 max-w-[1400px] mx-auto">
        <div className="grid md:grid-cols-12 gap-x-10 gap-y-8">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3">
              <span className="block w-2.5 h-2.5 bg-[var(--brand)]" />
              <span className="font-display uppercase text-lg tracking-wide">BC AI Compass</span>
            </div>
            <p className="mt-4 text-[13px] leading-relaxed text-[var(--ink-soft)] max-w-sm">
              A verified, province-wide map and directory of British Columbia's AI ecosystem. Every
              record carries the page it was checked against and the date it was checked.
            </p>
            <p className="mt-4 font-mono2 text-[10px] tracking-[0.1em] text-[var(--ink-faint)]">
              {ORGANIZATIONS.length} verified organizations · newest stamp {newest}
            </p>
          </div>

          <div className="md:col-span-3">
            <div className="font-mono2 text-[9.5px] tracking-[0.2em] uppercase text-[var(--ink-faint)] mb-3">
              Open data
            </div>
            <ul className="space-y-2 text-[13px]">
              <li>
                <a href="./ecosystem.json" className="text-[var(--ink-soft)] hover:text-[var(--accent)]">
                  ecosystem.json
                </a>
              </li>
              <li>
                <a href="./ecosystem.geojson" className="text-[var(--ink-soft)] hover:text-[var(--accent)]">
                  ecosystem.geojson
                </a>
              </li>
              <li>
                <a href={REPO} target="_blank" rel="noreferrer" className="text-[var(--ink-soft)] hover:text-[var(--accent)]">
                  Source & audit ↗
                </a>
              </li>
            </ul>
            <p className="mt-4 text-[11.5px] leading-relaxed text-[var(--ink-faint)]">
              Data licensed <strong className="text-[var(--ink-soft)]">CC BY 4.0</strong> — credit
              bcaicompass.ca. Code licensed MIT.
            </p>
          </div>

          <div className="md:col-span-4">
            <div className="font-mono2 text-[9.5px] tracking-[0.2em] uppercase text-[var(--ink-faint)] mb-3">
              Who makes this
            </div>
            <p className="text-[12.5px] leading-relaxed text-[var(--ink-soft)]">
              A <strong className="text-[var(--ink)]">BC + AI Ecosystem Association</strong> project,
              built by Martin Montero. BC + AI is listed in this directory. No other organization
              listed here is a partner, funder or endorser of it, and no listing is paid for or
              sponsored.
            </p>
            <p className="mt-4 text-[12.5px] leading-relaxed text-[var(--ink-faint)]">
              Map tiles ©{' '}
              <a
                href="https://www.openstreetmap.org/copyright"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[var(--accent)]"
              >
                OpenStreetMap
              </a>{' '}
              contributors.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[var(--line)] flex flex-wrap items-center justify-between gap-4">
          <p className="text-[11.5px] leading-relaxed text-[var(--ink-faint)] max-w-xl">
            Built on the unceded territories of the many Indigenous nations whose lands make up
            British Columbia, including the xʷməθkʷəy̓əm (Musqueam), Sḵwx̱wú7mesh (Squamish) and
            səlilwətaɬ (Tsleil-Waututh) Nations, on whose territories most of this dataset's records
            sit.
          </p>
          <p className="font-mono2 text-[10px] tracking-[0.14em] text-[var(--ink-faint)] uppercase">
            bcaicompass.ca
          </p>
        </div>
      </div>
    </footer>
  );
}
