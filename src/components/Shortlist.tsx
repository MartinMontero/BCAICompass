import { useMemo, useState } from 'react';
import {
  CATEGORY_COLORS,
  ORGANIZATIONS,
  ORG_TYPE_LABELS,
  type Organization,
} from '../data/organizations';
import { copyText, downloadText } from '../lib/download';
import { shortlistToCsv, shortlistToMarkdown } from '../lib/shortlist';
import type { ShortlistController } from '../hooks/useShortlist';

type SortMode = 'saved' | 'name' | 'region' | 'category';

export default function Shortlist({ shortlist }: { shortlist: ShortlistController }) {
  const [confirmClear, setConfirmClear] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [sort, setSort] = useState<SortMode>('saved');
  const organizations = useMemo(
    () => shortlist.ids
      .map((id) => ORGANIZATIONS.find((organization) => organization.id === id))
      .filter((organization): organization is Organization => organization !== undefined),
    [shortlist.ids],
  );
  const sorted = useMemo(() => {
    if (sort === 'saved') return organizations;
    return [...organizations].sort((a, b) => {
      if (sort === 'region') return a.region.localeCompare(b.region) || a.name.localeCompare(b.name);
      if (sort === 'category') return a.category.localeCompare(b.category) || a.name.localeCompare(b.name);
      return a.name.localeCompare(b.name);
    });
  }, [organizations, sort]);
  const csv = useMemo(() => shortlistToCsv(organizations), [organizations]);
  const markdown = useMemo(() => shortlistToMarkdown(organizations), [organizations]);
  const regions = useMemo(() => new Set(organizations.map((organization) => organization.region)), [organizations]);
  const categories = useMemo(() => new Set(organizations.map((organization) => organization.category)), [organizations]);
  const mapped = organizations.filter((organization) => organization.lat !== undefined).length;
  const quoted = organizations.filter((organization) => organization.evidenceQuote !== null).length;

  const copy = async () => {
    const copied = await copyText(markdown);
    setFeedback(copied ? 'Shortlist copied.' : 'Copy failed. Download the Markdown file instead.');
  };

  return (
    <section id="shortlist" className="relative bg-[var(--bg-raise)] py-16 md:py-24 border-t border-[var(--line)]">
      <div className="px-5 md:px-10 max-w-[1400px] mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-6 reveal">
          <div>
            <div className="eyebrow mb-3">06 · COMPARISON WORKSPACE</div>
            <h2 className="font-display uppercase text-4xl md:text-6xl leading-[0.95]">Compare before you contact.</h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-[var(--ink-soft)]">
            Saved organizations become a side-by-side decision table—not another directory. Sort by place or capability, inspect evidence, then export.
          </p>
        </div>

        {organizations.length === 0 ? (
          <div className="mt-8 rounded-[var(--radius-lg)] border border-dashed border-[var(--line-strong)] p-6 md:p-10 reveal">
            <div className="grid md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-7">
                <h3 className="font-display uppercase text-3xl">No organizations saved yet.</h3>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--ink-soft)]">Add candidates from search, your plan, or the directory. Your comparison stays in this browser only; it does not sync across devices, and clearing browser data removes it.</p>
              </div>
              <div className="md:col-span-4 md:col-start-9 flex flex-wrap gap-3">
                <a href="#ask" className="btn-primary">Find organizations</a>
                <a href="#directory" className="btn-ghost">Browse directory</a>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-8 reveal">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3" aria-label="Shortlist coverage summary">
              {[
                { label: 'organizations', value: organizations.length, note: `${regions.size} ${regions.size === 1 ? 'region' : 'regions'} · ${categories.size} ${categories.size === 1 ? 'category' : 'categories'}` },
                { label: 'mapped', value: mapped, note: `${organizations.length - mapped} without a fixed pin` },
                { label: 'quote coverage', value: quoted, note: `${organizations.length - quoted} quote pending` },
                { label: 'export', value: '2', note: 'CSV + Markdown' },
              ].map((item) => (
                <div key={item.label} className="rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--bg)] p-4">
                  <div className="font-display text-3xl">{item.value}</div>
                  <div className="font-mono2 text-[9px] uppercase tracking-[0.08em] text-[var(--accent)]">{item.label}</div>
                  <div className="mt-1 text-[10px] leading-relaxed text-[var(--ink-faint)]">{item.note}</div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <label className="flex items-center gap-2 font-mono2 text-[10px] uppercase tracking-[0.08em] text-[var(--ink-soft)]">
                Sort by
                <select value={sort} onChange={(event) => setSort(event.target.value as SortMode)} className="min-h-11 rounded-[var(--radius-sm)] border border-[var(--line-strong)] bg-[var(--bg)] px-3 text-[11px] text-[var(--ink)]">
                  <option value="saved">Saved order</option>
                  <option value="name">Organization name</option>
                  <option value="region">Region</option>
                  <option value="category">Category</option>
                </select>
              </label>
              <div className="font-mono2 text-[9px] uppercase tracking-[0.06em] text-[var(--ink-faint)]">Scroll the table sideways on small screens</div>
            </div>

            <div className="mt-3 overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--bg)]" tabIndex={0} role="region" aria-label="Scrollable shortlist comparison table">
              <table className="w-full min-w-[980px] border-collapse text-left">
                <caption className="sr-only">Comparison of saved verified organizations</caption>
                <thead>
                  <tr className="border-b border-[var(--line-strong)] bg-[var(--bg-sink)] font-mono2 text-[9px] uppercase tracking-[0.08em] text-[var(--ink-faint)]">
                    <th scope="col" className="px-4 py-3 font-medium">Organization</th>
                    <th scope="col" className="px-4 py-3 font-medium">Category</th>
                    <th scope="col" className="px-4 py-3 font-medium">Type</th>
                    <th scope="col" className="px-4 py-3 font-medium">Place</th>
                    <th scope="col" className="px-4 py-3 font-medium">Evidence</th>
                    <th scope="col" className="px-4 py-3 font-medium">Source</th>
                    <th scope="col" className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]">
                  {sorted.map((organization) => (
                    <tr key={organization.id} data-organization={organization.id} className="align-top hover:bg-[var(--bg-raise)]">
                      <th scope="row" className="px-4 py-4 min-w-56">
                        <a href={organization.url} target="_blank" rel="noreferrer" className="font-display uppercase text-lg leading-tight hover:text-[var(--accent)]">{organization.name} ↗</a>
                        <div className="mt-1 font-mono2 text-[8px] uppercase tracking-[0.06em] text-[var(--ink-faint)]">{organization.lat !== undefined ? '● mapped location' : '○ no fixed pin'}</div>
                      </th>
                      <td className="px-4 py-4 text-[11px] min-w-44" style={{ color: CATEGORY_COLORS[organization.category] }}>
                        <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: CATEGORY_COLORS[organization.category] }} />{organization.category}
                      </td>
                      <td className="px-4 py-4 text-[11px] text-[var(--ink-soft)]">{ORG_TYPE_LABELS[organization.orgType]}</td>
                      <td className="px-4 py-4 text-[11px] text-[var(--ink-soft)]">{organization.location}<span className="block mt-1 text-[10px] text-[var(--ink-faint)]">{organization.region}</span></td>
                      <td className="px-4 py-4 text-[11px]">{organization.evidenceQuote ? <span className="text-[var(--accent)]">✓ Quote available</span> : <span className="text-[var(--ink-faint)]">Quote pending</span>}</td>
                      <td className="px-4 py-4"><a href={organization.sourceUrl} target="_blank" rel="noreferrer" className="stamp" title={`Source read ${organization.sourceDate}`}>{organization.verified} ↗</a></td>
                      <td className="px-4 py-4 text-right"><button type="button" onClick={() => shortlist.remove(organization.id)} className="min-h-11 px-3 font-mono2 text-[9px] uppercase tracking-[0.06em] text-[var(--accent)] hover:text-[var(--ink)]" aria-label={`Remove ${organization.name} from comparison`}>Remove</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button type="button" onClick={copy} className="btn-primary">Copy Markdown</button>
              <button type="button" onClick={() => { downloadText('bc-ai-shortlist.csv', csv, 'text/csv;charset=utf-8'); setFeedback('CSV downloaded.'); }} className="btn-ghost">Download CSV</button>
              <button type="button" onClick={() => { downloadText('bc-ai-shortlist.md', markdown); setFeedback('Markdown downloaded.'); }} className="btn-ghost">Download .md</button>
              {!confirmClear ? (
                <button type="button" onClick={() => setConfirmClear(true)} className="min-h-11 px-3 font-mono2 text-[10px] uppercase tracking-[0.08em] text-[var(--accent)]">Clear shortlist</button>
              ) : (
                <span className="inline-flex flex-wrap items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--line-strong)] px-3 py-1.5">
                  <span className="text-[11px]">Remove all saved organizations?</span>
                  <button type="button" onClick={() => { shortlist.clear(); setConfirmClear(false); setFeedback('Shortlist cleared.'); }} className="min-h-11 px-2 font-mono2 text-[10px] uppercase text-[var(--accent)]">Yes, clear</button>
                  <button type="button" onClick={() => setConfirmClear(false)} className="min-h-11 px-2 font-mono2 text-[10px] uppercase">Cancel</button>
                </span>
              )}
              <span className="font-mono2 text-[10px] text-[var(--ink-soft)]" aria-live="polite">{feedback}</span>
            </div>
            <p className="mt-4 text-[11px] leading-relaxed text-[var(--ink-faint)]">Browser-only shortlist{shortlist.storageAvailable ? '' : ' · storage is unavailable, so changes last only while this page stays open'}. Exports preserve the saved order, not the current table sort. Confirm current details on each source before acting.</p>
          </div>
        )}
      </div>
    </section>
  );
}
