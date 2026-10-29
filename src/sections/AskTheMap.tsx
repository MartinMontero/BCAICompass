import { useMemo, useState } from 'react';
import { ORGANIZATIONS } from '../data/organizations';
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

  return (
    <section id="ask" className="relative bg-[var(--bg-raise)] py-20 md:py-24 border-t border-[var(--line)]">
      <div className="px-5 md:px-10 max-w-[1400px] mx-auto">
        <div className="grid md:grid-cols-12 gap-8 items-end">
          <div className="md:col-span-7 reveal">
            <div className="eyebrow mb-4">ASK THE MAP · NO ACCOUNT · NO API</div>
            <h2 className="font-display uppercase text-5xl md:text-7xl leading-[0.95]">Start with the need.</h2>
          </div>
          <p className="md:col-span-4 md:col-start-9 text-base leading-relaxed text-[var(--ink-soft)] reveal">
            Search the verified records in plain language. Every match tells you which published text caused it—nothing is inferred about services a source did not name.
          </p>
        </div>

        <form
          role="search"
          className="mt-10 reveal"
          onSubmit={(event) => {
            event.preventDefault();
            ask(question);
          }}
        >
          <label htmlFor="map-question" className="font-mono2 text-[11px] tracking-[0.1em] uppercase text-[var(--ink-soft)] block mb-3">
            What are you trying to do?
          </label>
          <div className="flex flex-col sm:flex-row border border-[var(--line-strong)] bg-[var(--bg)] focus-within:border-[var(--brand)] transition-colors">
            <input
              id="map-question"
              type="search"
              value={question}
              maxLength={MAX_SEARCH_LENGTH}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="For example: I need a lab for a health AI project"
              className="min-h-14 flex-1 min-w-0 bg-transparent px-4 py-3 text-base text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:outline-none"
            />
            <button
              type="submit"
              disabled={!question.trim()}
              className="min-h-14 font-mono2 text-[11px] tracking-[0.18em] px-7 bg-[var(--brand)] text-[var(--brand-ink)] hover:bg-[var(--ink)] hover:text-[var(--bg)] disabled:opacity-45 disabled:cursor-not-allowed transition-colors"
            >
              FIND VERIFIED MATCHES →
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2" aria-label="Starter questions">
            {STARTERS.map((starter) => (
              <button
                key={starter}
                type="button"
                onClick={() => ask(starter)}
                className="min-h-11 text-left font-mono2 text-[10px] leading-relaxed tracking-[0.05em] px-3 py-2 border border-[var(--line)] text-[var(--ink-soft)] hover:border-[var(--brand)] hover:text-[var(--ink)] transition-colors"
              >
                {starter}
              </button>
            ))}
          </div>
        </form>

        {submitted && (
          <div className="mt-10" aria-live="polite">
            <div className="flex flex-wrap items-center gap-3 border-y border-[var(--line)] py-4">
              <span className="eyebrow">You asked</span>
              <span className="text-sm text-[var(--ink)] flex-1 min-w-60">“{submitted}”</span>
              <span className="font-mono2 text-[10px] uppercase tracking-[0.1em] text-[var(--ink-faint)]">
                {results.length} {results.length === 1 ? 'match' : 'matches'}
              </span>
              <button
                type="button"
                onClick={() => {
                  setQuestion('');
                  setSubmitted('');
                }}
                className="min-h-11 px-3 font-mono2 text-[10px] uppercase tracking-[0.12em] text-[var(--accent)] hover:text-[var(--ink)]"
              >
                Clear
              </button>
            </div>

            {results.length > 0 ? (
              <div className="divide-y divide-[var(--line)] border-b border-[var(--line)]">
                {results.map(({ organization, reason }) => {
                  const saved = savedIds.has(organization.id);
                  return (
                    <article key={organization.id} className="py-6 grid md:grid-cols-12 gap-4 md:gap-6">
                      <div className="md:col-span-4">
                        <a href={organization.url} target="_blank" rel="noreferrer" className="font-display uppercase text-2xl md:text-3xl leading-tight hover:text-[var(--accent)] transition-colors">
                          {organization.name} ↗
                        </a>
                        <p className="mt-2 font-mono2 text-[10px] uppercase tracking-[0.08em] text-[var(--ink-faint)]">
                          {organization.location} · {organization.region}
                        </p>
                      </div>
                      <div className="md:col-span-6">
                        <p className="text-sm leading-relaxed text-[var(--ink-soft)]">{organization.description ?? 'No description was supported by the source.'}</p>
                        <p className="mt-3 text-[12px] leading-relaxed text-[var(--accent)]">{reason}</p>
                        <a href={organization.sourceUrl} target="_blank" rel="noreferrer" className="stamp mt-3" title={`Source read ${organization.sourceDate}`}>
                          Source · {organization.verified} ↗
                        </a>
                      </div>
                      <div className="md:col-span-2 md:text-right">
                        <button
                          type="button"
                          onClick={() => onToggle(organization.id)}
                          aria-pressed={saved}
                          className={`min-h-11 px-4 py-2 border font-mono2 text-[10px] uppercase tracking-[0.1em] transition-colors ${saved ? 'border-[var(--brand)] bg-[var(--brand)] text-[var(--brand-ink)]' : 'border-[var(--line-strong)] text-[var(--ink)] hover:border-[var(--brand)]'}`}
                        >
                          {saved ? 'Saved ✓' : '+ Shortlist'}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="py-10 md:py-12 grid md:grid-cols-12 gap-6 border-b border-[var(--line)]">
                <h3 className="md:col-span-4 font-display uppercase text-3xl">No verified match.</h3>
                <div className="md:col-span-7 md:col-start-6">
                  <p className="text-base leading-relaxed text-[var(--ink-soft)]">
                    That is a coverage finding, not proof that nobody can help. Try fewer words, browse the directory, or send the source for an organization we have not checked yet.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <a href="#directory" className="btn-ghost">Browse all records</a>
                    <a href="#contribute" className="btn-primary">Contribute a source</a>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
