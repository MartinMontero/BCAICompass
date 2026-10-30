import { useMemo, useState } from 'react';
import { CATEGORY_COLORS, ORGANIZATIONS } from '../data/organizations';
import { MAX_SEARCH_LENGTH, searchOrganizations } from '../lib/search';

const STARTERS = [
  'Who can help me fund an AI prototype?',
  'Where can I learn AI outside Vancouver?',
  'I need a health research collaborator',
  'Which communities meet about responsible AI?',
];

export default function AskTheMap({
  savedIds,
  onToggle,
}: {
  savedIds: Set<string>;
  onToggle: (id: string) => void;
}) {
  const [question, setQuestion] = useState('');
  const [submitted, setSubmitted] = useState('');
  const results = useMemo(() => searchOrganizations(ORGANIZATIONS, submitted, 6), [submitted]);

  const ask = (value: string) => {
    const trimmed = value.trim().slice(0, MAX_SEARCH_LENGTH);
    setQuestion(trimmed);
    setSubmitted(trimmed);
  };

  const locate = (id: string) => {
    window.dispatchEvent(new CustomEvent<string>('bcac:select', { detail: id }));
    document.getElementById('map')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="ask" className="relative bg-[var(--bg-raise)] py-16 md:py-24 border-t border-[var(--line)]">
      <div className="px-5 md:px-10 max-w-[1400px] mx-auto">
        <div className="grid md:grid-cols-12 gap-6 items-end">
          <div className="md:col-span-7 reveal">
            <div className="eyebrow mb-3">01 · ASK THE MAP</div>
            <h2 className="font-display uppercase text-4xl md:text-6xl leading-[0.95]">Start with the need.</h2>
          </div>
          <p className="md:col-span-4 md:col-start-9 text-sm leading-relaxed text-[var(--ink-soft)] reveal">
            Search verified records in plain language. Matches explain which published words caused the result; no account, remote AI, or inferred services.
          </p>
        </div>

        <form role="search" className="mt-8 reveal" onSubmit={(event) => { event.preventDefault(); ask(question); }}>
          <label htmlFor="map-question" className="font-mono2 text-[10px] tracking-[0.1em] uppercase text-[var(--ink-soft)] block mb-2">What are you trying to do?</label>
          <div className="flex flex-col sm:flex-row rounded-[var(--radius-md)] overflow-hidden border border-[var(--line-strong)] bg-[var(--bg)] focus-within:border-[var(--brand)] transition-colors">
            <input
              id="map-question"
              type="search"
              value={question}
              maxLength={MAX_SEARCH_LENGTH}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="For example: I need a lab for a health AI project"
              className="min-h-14 flex-1 min-w-0 bg-transparent px-4 py-3 text-base text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:outline-none"
            />
            <button type="submit" disabled={!question.trim()} className="min-h-14 font-mono2 text-[10px] tracking-[0.14em] px-7 bg-[var(--brand)] text-[var(--brand-ink)] hover:bg-[var(--ink)] hover:text-[var(--bg)] disabled:opacity-45 disabled:cursor-not-allowed transition-colors">
              FIND VERIFIED MATCHES →
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2" aria-label="Starter questions">
            {STARTERS.map((starter) => (
              <button key={starter} type="button" onClick={() => ask(starter)} className="min-h-11 rounded-full text-left font-mono2 text-[9px] leading-relaxed tracking-[0.04em] px-3.5 py-2 border border-[var(--line)] text-[var(--ink-soft)] hover:border-[var(--brand)] hover:text-[var(--ink)] transition-colors">
                {starter}
              </button>
            ))}
          </div>
        </form>

        {submitted && (
          <div className="mt-8" aria-live="polite">
            <div className="flex flex-wrap items-center gap-3 border-y border-[var(--line)] py-3">
              <span className="eyebrow">You asked</span>
              <span className="text-sm text-[var(--ink)] flex-1 min-w-52">“{submitted}”</span>
              <span className="font-mono2 text-[10px] uppercase tracking-[0.08em] text-[var(--ink-faint)]">{results.length} {results.length === 1 ? 'match' : 'matches'}</span>
              <button type="button" onClick={() => { setQuestion(''); setSubmitted(''); }} className="min-h-11 px-3 font-mono2 text-[10px] uppercase tracking-[0.1em] text-[var(--accent)] hover:text-[var(--ink)]">Clear</button>
            </div>

            {results.length > 0 ? (
              <div className="mt-5 grid md:grid-cols-2 xl:grid-cols-3 gap-3">
                {results.map(({ organization, reason }) => {
                  const saved = savedIds.has(organization.id);
                  return (
                    <article key={organization.id} className="rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--bg)] p-5 flex flex-col">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-mono2 text-[9px] uppercase tracking-[0.07em]" style={{ color: CATEGORY_COLORS[organization.category] }}>
                          <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: CATEGORY_COLORS[organization.category] }} />{organization.category}
                        </span>
                        <span className="font-mono2 text-[9px] text-[var(--ink-faint)]">{organization.verified}</span>
                      </div>
                      <a href={organization.url} target="_blank" rel="noreferrer" className="mt-4 font-display uppercase text-2xl leading-tight hover:text-[var(--accent)] transition-colors">{organization.name} ↗</a>
                      <p className="mt-2 font-mono2 text-[9px] uppercase tracking-[0.06em] text-[var(--ink-faint)]">{organization.location} · {organization.region}</p>
                      <p className="mt-4 rounded-[var(--radius-sm)] bg-[var(--bg-raise)] p-3 text-[12px] leading-relaxed text-[var(--ink-soft)]"><strong className="text-[var(--accent)]">Why it matched:</strong> {reason}</p>
                      <div className="mt-auto pt-5 flex flex-wrap items-center gap-2">
                        <button type="button" onClick={() => onToggle(organization.id)} aria-pressed={saved} className={`min-h-11 px-3.5 rounded-[var(--radius-sm)] border font-mono2 text-[9px] uppercase tracking-[0.06em] transition-colors ${saved ? 'border-[var(--brand)] bg-[var(--brand)] text-[var(--brand-ink)]' : 'border-[var(--line-strong)] text-[var(--ink)] hover:border-[var(--brand)]'}`}>
                          {saved ? 'Saved ✓' : '+ Shortlist'}
                        </button>
                        {organization.lat !== undefined && <button type="button" onClick={() => locate(organization.id)} aria-label={`Locate ${organization.name} on map`} className="min-h-11 px-3 font-mono2 text-[9px] uppercase tracking-[0.06em] text-[var(--accent)] hover:text-[var(--ink)]">Map ↗</button>}
                        <a href={organization.sourceUrl} target="_blank" rel="noreferrer" className="min-h-11 inline-flex items-center px-2 font-mono2 text-[9px] uppercase tracking-[0.06em] text-[var(--ink-soft)] underline decoration-[var(--line-strong)] underline-offset-4" title={`Source read ${organization.sourceDate}`}>Source ↗</a>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="py-10 grid md:grid-cols-12 gap-6 border-b border-[var(--line)]">
                <h3 className="md:col-span-4 font-display uppercase text-3xl">No verified match.</h3>
                <div className="md:col-span-7 md:col-start-6">
                  <p className="text-sm leading-relaxed text-[var(--ink-soft)]">That is a coverage finding, not proof that nobody can help. Try fewer words, browse the directory, or send a source we have not checked.</p>
                  <div className="mt-5 flex flex-wrap gap-3"><a href="#directory" className="btn-ghost">Browse all records</a><a href="#contribute" className="btn-primary">Contribute a source</a></div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
