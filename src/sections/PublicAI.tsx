import { useMemo, useState } from 'react';
import {
  PUBLIC_AI_PRINCIPLES,
  PUBLIC_AI_TYPES,
  type PublicAiPrinciple,
  type PublicAiType,
} from '../data/public-ai';
import { ORGANIZATIONS } from '../data/organizations';
import { PUBLIC_AI_RESOURCES, searchPublicAiResources } from '../lib/public-ai';

const FRAMEWORK_SOURCES = [
  { label: 'Public AI interview', url: 'https://www.cloudfest.com/blog/brewster-kahle-cloudfest-interview-internet-archive-public-ai' },
  { label: 'Library of Everything podcast', url: 'https://www.eff.org/deeplinks/2025/09/podcast-episode-building-and-preserving-library-everything' },
  { label: 'Preservation and accountability', url: 'https://www.theatlantic.com/technology/2026/10/blocking-internet-archive-will-not-stop-ai/689065/' },
  { label: 'Digital Libraries for Thinking Machines', url: 'https://www.youtube.com/watch?v=ZlsBUgvMFac' },
];

export default function PublicAI() {
  const [query, setQuery] = useState('');
  const [principle, setPrinciple] = useState<'All' | PublicAiPrinciple>('All');
  const [type, setType] = useState<'All' | PublicAiType>('All');
  const [showAll, setShowAll] = useState(false);
  const results = useMemo(
    () => searchPublicAiResources(PUBLIC_AI_RESOURCES, { query, principle, type }),
    [query, principle, type],
  );
  const visible = showAll ? results : results.slice(0, 6);
  const hasFilters = query.trim() !== '' || principle !== 'All' || type !== 'All';

  const clear = () => {
    setQuery('');
    setPrinciple('All');
    setType('All');
    setShowAll(false);
  };

  const openOrganization = (id: string, name: string) => {
    window.dispatchEvent(new CustomEvent<string>('bcac:directory', { detail: id }));
    document.getElementById('directory')?.scrollIntoView({ behavior: 'smooth' });
    // The accessible name describes the destination without adding another
    // directory classification to the Public AI resource itself.
    void name;
  };

  return (
    <section id="public-ai" className="relative bg-[var(--bg-sink)] py-16 md:py-24 border-t border-[var(--line)]">
      <div className="px-5 md:px-10 max-w-[1400px] mx-auto">
        <div className="grid md:grid-cols-12 gap-6 items-end reveal">
          <div className="md:col-span-7">
            <div className="eyebrow mb-3">PUBLIC AI · FIELD LIBRARY</div>
            <h2 className="font-display uppercase text-4xl md:text-6xl leading-[0.95]">AI as public infrastructure.</h2>
          </div>
          <p className="md:col-span-5 max-w-lg text-sm leading-relaxed text-[var(--ink-soft)]">
            Find tools and collections for public knowledge—not another company directory. Start with what you need to access, preserve, check, or build.
          </p>
        </div>

        <div className="mt-8 rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--bg-raise)] p-4 md:p-5 reveal">
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <label className="flex-1">
              <span className="sr-only">Search Public AI resources</span>
              <input
                type="search"
                value={query}
                maxLength={240}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Try “preserve public records” or “language data”…"
                className="w-full min-h-12 rounded-[var(--radius-sm)] bg-[var(--bg)] border border-[var(--line)] px-4 text-sm text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:border-[var(--brand)] outline-none"
              />
            </label>
            <label className="flex items-center gap-2 font-mono2 text-[10px] uppercase tracking-[0.08em] text-[var(--ink-soft)]">
              <span className="sr-only">Resource type</span>
              <select
                aria-label="Resource type"
                value={type}
                onChange={(event) => setType(event.target.value as 'All' | PublicAiType)}
                className="min-h-12 w-full md:w-auto rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--bg)] px-3 text-[11px] text-[var(--ink)]"
              >
                <option value="All">All resource types</option>
                {PUBLIC_AI_TYPES.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <div className="font-mono2 text-[10px] text-[var(--ink-faint)] md:text-right" aria-live="polite">
              <strong className="text-[var(--ink)]">{results.length}</strong> of {PUBLIC_AI_RESOURCES.length} curated resources
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2" aria-label="Filter by Public AI principle">
            {PUBLIC_AI_PRINCIPLES.map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={principle === item}
                onClick={() => setPrinciple(principle === item ? 'All' : item)}
                className={`min-h-11 rounded-full border px-3.5 font-mono2 text-[9.5px] uppercase tracking-[0.05em] transition-colors ${principle === item ? 'bg-[var(--ink)] text-[var(--bg)] border-[var(--ink)]' : 'border-[var(--line)] text-[var(--ink-soft)] hover:border-[var(--brand)]'}`}
              >
                {item}
              </button>
            ))}
          </div>
          {hasFilters && (
            <button type="button" onClick={clear} className="mt-3 min-h-11 px-1 font-mono2 text-[10px] uppercase tracking-[0.08em] text-[var(--accent)]">Clear filters</button>
          )}
        </div>

        <div className="mt-6 grid md:grid-cols-2 border-t border-l border-[var(--line)] reveal">
          {visible.map((resource, index) => {
            const related = resource.relatedOrgIds
              .map((id) => ORGANIZATIONS.find((organization) => organization.id === id))
              .filter((organization) => organization !== undefined);
            return (
              <article
                key={resource.id}
                data-public-ai-resource={resource.id}
                className="flex flex-col border-b border-r border-[var(--line)] bg-[var(--bg)] p-5 md:p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="font-mono2 text-[10px] text-[var(--accent)]">{String(index + 1).padStart(2, '0')} · {resource.type}</span>
                  <span className="font-mono2 text-[9px] uppercase tracking-[0.05em] text-[var(--ink-faint)]">Checked {resource.checked}</span>
                </div>
                <h3 className="mt-4 font-display uppercase text-2xl md:text-3xl leading-tight">
                  <a href={resource.url} target="_blank" rel="noreferrer" className="hover:text-[var(--accent)]">{resource.name} ↗</a>
                </h3>
                <p className="mt-3 text-[13px] leading-relaxed text-[var(--ink-soft)]">{resource.description}</p>
                <div className="mt-4 border-l-2 border-[var(--brand)] pl-3 text-[12px] leading-relaxed">
                  <span className="font-mono2 text-[9px] uppercase tracking-[0.08em] text-[var(--accent)] block">Use it to</span>
                  {resource.practicalUse}
                </div>
                <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1">
                  {resource.principles.map((item) => <span key={item} className="font-mono2 text-[8.5px] uppercase tracking-[0.06em] text-[var(--ink-faint)]">● {item}</span>)}
                </div>
                {related.length > 0 && (
                  <details className="mt-5 pt-3 border-t border-[var(--line)] group">
                    <summary className="min-h-11 inline-flex items-center font-mono2 text-[9.5px] uppercase tracking-[0.06em] text-[var(--accent)] cursor-pointer">
                      Related verified organizations <span className="ml-2 group-open:rotate-45 transition-transform">＋</span>
                    </summary>
                    <p className="text-[11px] leading-relaxed text-[var(--ink-faint)]">Directory links for further exploration, not Public AI certification.</p>
                    <div className="mt-2 flex flex-col items-start">
                      {related.map((organization) => (
                        <button
                          key={organization.id}
                          type="button"
                          onClick={() => openOrganization(organization.id, organization.name)}
                          aria-label={`View ${organization.name} in the directory`}
                          className="min-h-11 py-2 text-left text-[12px] text-[var(--ink-soft)] hover:text-[var(--accent)]"
                        >
                          {organization.name} <span className="text-[var(--accent)]">→</span>
                        </button>
                      ))}
                    </div>
                  </details>
                )}
              </article>
            );
          })}
        </div>

        {results.length === 0 && (
          <div className="border-b border-r border-[var(--line)] bg-[var(--bg)] p-8">
            <h3 className="font-display uppercase text-2xl">No resource matches yet.</h3>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">Try a broader need, or suggest a public resource below.</p>
            <div className="mt-5 flex flex-wrap gap-3"><button type="button" onClick={clear} className="btn-ghost">Clear filters</button><a href="#contribute" className="btn-primary">Suggest a resource</a></div>
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
          {results.length > 6 && (
            <button type="button" onClick={() => setShowAll(!showAll)} className="btn-ghost">
              {showAll ? 'Show fewer resources' : `Show all ${results.length} resources`}
            </button>
          )}
          <details className="w-full md:w-auto md:ml-auto group">
            <summary className="min-h-11 inline-flex items-center font-mono2 text-[9.5px] uppercase tracking-[0.06em] text-[var(--accent)] cursor-pointer">Framework & source talks ＋</summary>
            <div className="mt-2 flex flex-col items-start gap-1 md:items-end">
              {FRAMEWORK_SOURCES.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className="min-h-11 inline-flex items-center text-[11px] text-[var(--ink-soft)] hover:text-[var(--accent)]">{source.label} ↗</a>)}
            </div>
          </details>
        </div>
      </div>
    </section>
  );
}
