import { useMemo, useState } from 'react';
import {
  ACTIVE_PEOPLE_COMMUNITIES,
  COMMUNITIES_WITHOUT_CONFIRMED_LEAD,
  CONNECTION_KINDS,
  PEOPLE,
  PEOPLE_COMMUNITIES,
  type ConnectionKind,
  type PersonCommunity,
} from '../data/people';
import { ORGANIZATIONS } from '../data/organizations';
import { searchPeople } from '../lib/people';

const CONNECTION_LABELS: Record<ConnectionKind, string> = {
  'get-help': 'Get help',
  'offer-help': 'Offer help',
  'join-project': 'Join a project',
};

export default function People() {
  const [query, setQuery] = useState('');
  const [community, setCommunity] = useState<'All' | PersonCommunity>('All');
  const [connection, setConnection] = useState<'All' | ConnectionKind>('All');
  const [selectedId, setSelectedId] = useState(PEOPLE[0]?.id ?? '');
  const [showAll, setShowAll] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const results = useMemo(() => searchPeople(PEOPLE, { query, community, connection }), [query, community, connection]);
  const visible = showAll ? results : results.slice(0, 6);
  const selected = results.find((result) => result.person.id === selectedId) ?? results[0];
  const hasFilters = query.trim() !== '' || community !== 'All' || connection !== 'All';
  const leadCommunityCount = useMemo(() => new Set(PEOPLE.filter((person) => person.communityLead).map((person) => person.community)).size, []);

  const clear = () => {
    setQuery('');
    setCommunity('All');
    setConnection('All');
    setShowAll(false);
  };

  const selectPerson = (id: string) => {
    setSelectedId(id);
    if (window.matchMedia('(max-width: 767px)').matches) {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.setTimeout(() => document.getElementById('person-profile')?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' }), 0);
    }
  };

  const openOrganization = (id: string) => {
    window.dispatchEvent(new CustomEvent<string>('bcac:directory', { detail: id }));
    document.getElementById('directory')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="people" className="relative bg-[var(--bg)] py-16 md:py-24 border-t border-[var(--line)]">
      <div className="px-5 md:px-10 max-w-[1400px] mx-auto">
        <div className="grid md:grid-cols-12 gap-6 items-end reveal">
          <div className="md:col-span-7">
            <div className="eyebrow mb-3">PEOPLE · PUBLIC PROFESSIONAL DIRECTORY</div>
            <h2 className="font-display uppercase text-4xl md:text-6xl leading-[0.95]">Find a person, not just a project.</h2>
          </div>
          <p className="md:col-span-5 max-w-lg text-base leading-relaxed text-[var(--ink-soft)]">
            Search people you can learn from, help, or build with. Every profile names its public source and a practical way into the work—never private contact details or a promise of availability.
          </p>
        </div>

        <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-12 gap-6 items-start">
          <aside className="md:col-span-2 lg:col-span-3 border-t border-[var(--line-strong)] pt-4 reveal" aria-label="People search and filters">
            <label className="block">
              <span className="font-mono2 text-[10px] uppercase tracking-[0.08em] text-[var(--accent)]">Name, skill, project, or place</span>
              <input
                type="search"
                value={query}
                maxLength={240}
                onChange={(event) => { setQuery(event.target.value); setShowAll(false); }}
                placeholder="Try “robotics” or “Jesi”…"
                aria-label="Search people"
                className="mt-2 w-full min-h-12 rounded-[var(--radius-sm)] bg-[var(--bg-raise)] border border-[var(--line)] px-4 text-base text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:border-[var(--brand)] outline-none"
              />
            </label>

            <button
              type="button"
              className="mt-3 min-h-11 w-full flex items-center justify-between border border-[var(--line)] px-3 font-mono2 text-[10px] uppercase tracking-[0.08em] text-[var(--ink-soft)] md:hidden"
              onClick={() => setFiltersOpen((open) => !open)}
              aria-expanded={filtersOpen}
              aria-controls="people-filter-options"
            >
              Filters {(community !== 'All' || connection !== 'All') && <span className="text-[var(--accent)]">active</span>}
              <span aria-hidden="true">{filtersOpen ? '−' : '+'}</span>
            </button>

            <div id="people-filter-options" className={`${filtersOpen ? 'block' : 'hidden'} md:block`}>
              <label className="mt-4 block">
                <span className="font-mono2 text-[10px] uppercase tracking-[0.08em] text-[var(--ink-soft)]">Community</span>
                <select
                  aria-label="People community"
                  value={community}
                  onChange={(event) => { setCommunity(event.target.value as 'All' | PersonCommunity); setShowAll(false); }}
                  className="mt-2 min-h-12 w-full rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--bg-raise)] px-3 text-sm text-[var(--ink)]"
                >
                  <option value="All">All communities and programs</option>
                  {PEOPLE_COMMUNITIES.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>

              <fieldset className="mt-5">
                <legend className="font-mono2 text-[10px] uppercase tracking-[0.08em] text-[var(--ink-soft)]">I want to</legend>
                <div className="mt-2 grid grid-cols-3 lg:grid-cols-1 gap-2">
                  {CONNECTION_KINDS.map((kind) => (
                    <button
                      key={kind}
                      type="button"
                      aria-pressed={connection === kind}
                      onClick={() => { setConnection(connection === kind ? 'All' : kind); setShowAll(false); }}
                      className={`min-h-11 border px-2 lg:px-3 text-left font-mono2 text-[9.5px] uppercase tracking-[0.05em] transition-colors ${connection === kind ? 'bg-[var(--ink)] text-[var(--bg)] border-[var(--ink)]' : 'border-[var(--line)] text-[var(--ink-soft)] hover:border-[var(--brand)]'}`}
                    >
                      {CONNECTION_LABELS[kind]}
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>

            <div className="mt-5 border-t border-[var(--line)] pt-4 font-mono2 text-[10px] leading-relaxed text-[var(--ink-faint)]" aria-live="polite">
              <strong className="text-[var(--ink)]">{results.length}</strong> of {PEOPLE.length} sourced people
            </div>
            {hasFilters && <button type="button" onClick={clear} className="mt-2 min-h-11 px-1 font-mono2 text-[10px] uppercase tracking-[0.08em] text-[var(--accent)]">Clear filters</button>}

            <details className="mt-4 border-t border-[var(--line)] pt-3 group">
              <summary className="min-h-11 inline-flex items-center font-mono2 text-[9.5px] uppercase tracking-[0.06em] text-[var(--accent)] cursor-pointer">Coverage and method ＋</summary>
              <p className="text-xs leading-relaxed text-[var(--ink-soft)]">
                {leadCommunityCount} of {ACTIVE_PEOPLE_COMMUNITIES.length} active communities have named public leads. {COMMUNITIES_WITHOUT_CONFIRMED_LEAD.join(' and ')} have no confirmed public lead listed; no one is guessed into those roles.
              </p>
              <a href="./people.json" className="mt-2 min-h-11 inline-flex items-center text-xs text-[var(--accent)]">Download people.json ↓</a>
            </details>
          </aside>

          <div className="md:col-span-1 lg:col-span-4 border-t border-[var(--line-strong)] reveal" aria-label="People results">
            {visible.map((result) => (
              <button
                key={result.person.id}
                type="button"
                data-person={result.person.id}
                aria-pressed={selected?.person.id === result.person.id}
                onClick={() => selectPerson(result.person.id)}
                className={`w-full min-h-16 border-b border-r border-l px-4 py-4 text-left transition-colors ${selected?.person.id === result.person.id ? 'border-[var(--brand)] bg-[var(--bg-raise)]' : 'border-[var(--line)] bg-[var(--bg)] hover:border-[var(--brand)]'}`}
              >
                <span className="flex items-start justify-between gap-3">
                  <span>
                    <span className="block font-display uppercase text-2xl leading-tight">{result.person.name}</span>
                    <span className="mt-1 block text-xs leading-relaxed text-[var(--ink-soft)]">{result.person.role}</span>
                  </span>
                  <span className="shrink-0 font-mono2 text-[9px] uppercase tracking-[0.05em] text-[var(--accent)]">{result.person.communityLead ? 'Lead' : 'Project'}</span>
                </span>
                <span className="mt-3 block text-xs leading-relaxed text-[var(--ink-soft)]">{result.person.community} · {result.person.location}</span>
                <span className="mt-2 block font-mono2 text-[9px] leading-relaxed text-[var(--ink-faint)]">{result.reason}</span>
              </button>
            ))}

            {results.length === 0 && (
              <div className="border-b border-r border-l border-[var(--line)] p-6">
                <h3 className="font-display uppercase text-2xl">No person matches yet.</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)]">Try a name, a broader skill, or clear the filters.</p>
                <button type="button" onClick={clear} className="btn-ghost mt-4">Clear filters</button>
              </div>
            )}
            {results.length > 6 && (
              <button type="button" onClick={() => setShowAll((current) => !current)} className="btn-ghost mt-4 w-full">
                {showAll ? 'Show fewer people' : `Show all ${results.length} people`}
              </button>
            )}
          </div>

          {selected && (
            <article id="person-profile" data-person-profile={selected.person.id} className="md:col-span-1 lg:col-span-5 lg:sticky lg:top-24 border-t border-[var(--brand)] pt-4 scroll-mt-24" aria-live="polite">
              <div className="font-mono2 text-[10px] uppercase tracking-[0.08em] text-[var(--accent)]">{selected.person.communityLead ? 'Community leadership' : 'Project contribution'}</div>
              <h3 className="mt-3 font-display uppercase text-4xl md:text-5xl leading-[0.95]">{selected.person.name}</h3>
              <p className="mt-3 text-base font-semibold leading-relaxed">{selected.person.role}</p>
              <p className="mt-1 text-sm text-[var(--ink-soft)]">{selected.person.community} · {selected.person.location}</p>
              <p className="mt-5 max-w-[65ch] text-base leading-relaxed text-[var(--ink-soft)]">{selected.person.summary}</p>

              <div className="mt-5 flex flex-wrap gap-x-3 gap-y-2" aria-label="Expertise">
                {selected.person.expertise.map((item) => <span key={item} className="font-mono2 text-[9px] uppercase tracking-[0.05em] text-[var(--ink-faint)]">● {item}</span>)}
              </div>

              <div className="mt-6 border-t border-[var(--line)] pt-4">
                <h4 className="font-mono2 text-[10px] uppercase tracking-[0.08em] text-[var(--accent)]">Public work</h4>
                <ul className="mt-2 space-y-1 text-sm leading-relaxed">
                  {selected.person.projects.map((project) => <li key={project}>→ {project}</li>)}
                </ul>
              </div>

              <div className="mt-6 border-t border-[var(--line)] pt-4">
                <h4 className="font-mono2 text-[10px] uppercase tracking-[0.08em] text-[var(--accent)]">Ways into their work</h4>
                <div className="mt-2 divide-y divide-[var(--line)]">
                  {selected.person.connections.map((item) => (
                    <a key={`${item.kind}:${item.label}`} href={item.url} target="_blank" rel="noreferrer" className="min-h-14 flex items-start gap-3 py-3 text-sm leading-relaxed hover:text-[var(--accent)]">
                      <span className="mt-0.5 shrink-0 font-mono2 text-[9px] uppercase tracking-[0.05em] text-[var(--accent)]">{CONNECTION_LABELS[item.kind]}</span>
                      <span>{item.label} ↗</span>
                    </a>
                  ))}
                </div>
                <p className="text-xs leading-relaxed text-[var(--ink-faint)]">Public routes into a community or project, not a claim of personal availability.</p>
              </div>

              {selected.person.relatedOrgIds.length > 0 && (
                <div className="mt-6 border-t border-[var(--line)] pt-4">
                  <h4 className="font-mono2 text-[10px] uppercase tracking-[0.08em] text-[var(--accent)]">Related verified organizations</h4>
                  <div className="mt-2 flex flex-col items-start">
                    {selected.person.relatedOrgIds.map((id) => {
                      const organization = ORGANIZATIONS.find((item) => item.id === id);
                      if (!organization) return null;
                      return (
                        <button key={id} type="button" onClick={() => openOrganization(id)} aria-label={`View ${organization.name} in the directory`} className="min-h-11 py-2 text-left text-sm text-[var(--ink-soft)] hover:text-[var(--accent)]">
                          {organization.name} <span className="text-[var(--accent)]">→</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[var(--line)] pt-4">
                <a href={selected.person.sourceUrl} target="_blank" rel="noreferrer" className="stamp" title={`${selected.person.sourceUrl} — read ${selected.person.sourceDate}`}>Checked {selected.person.sourceDate} · Source ↗</a>
                {selected.person.profileUrl && <a href={selected.person.profileUrl} target="_blank" rel="noreferrer" className="min-h-11 inline-flex items-center text-sm text-[var(--accent)]">Public profile ↗</a>}
              </div>
              <blockquote className="mt-3 border-l border-[var(--brand)] pl-3 text-xs leading-relaxed text-[var(--ink-faint)]">“{selected.person.evidenceQuote}”</blockquote>
            </article>
          )}
        </div>
      </div>
    </section>
  );
}
