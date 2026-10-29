import { useMemo, useState } from 'react';
import { ORGANIZATIONS } from '../data/organizations';
import { copyText, downloadText } from '../lib/download';
import { shortlistToCsv, shortlistToMarkdown } from '../lib/shortlist';
import type { ShortlistController } from '../hooks/useShortlist';

export default function Shortlist({ shortlist }: { shortlist: ShortlistController }) {
  const [confirmClear, setConfirmClear] = useState(false);
  const [feedback, setFeedback] = useState('');
  const organizations = useMemo(
    () => shortlist.ids.map((id) => ORGANIZATIONS.find((organization) => organization.id === id)).filter((organization) => organization !== undefined),
    [shortlist.ids],
  );

  const copy = async () => {
    const copied = await copyText(shortlistToMarkdown(organizations));
    setFeedback(copied ? 'Shortlist copied.' : 'Copy failed. Download the Markdown instead.');
  };

  return (
    <section id="shortlist" className="relative bg-[var(--bg-raise)] py-20 md:py-24 border-t border-[var(--line)]">
      <div className="px-5 md:px-10 max-w-[1400px] mx-auto">
        <div className="grid md:grid-cols-12 gap-8 items-end">
          <div className="md:col-span-7 reveal">
            <div className="eyebrow mb-4">YOUR SHORTLIST · {shortlist.count} SAVED</div>
            <h2 className="font-display uppercase text-5xl md:text-7xl leading-[0.95]">Take the useful part with you.</h2>
          </div>
          <div className="md:col-span-4 md:col-start-9 text-sm leading-relaxed text-[var(--ink-soft)] reveal">
            <p>Saved only in this browser. It does not sync across devices, and clearing browser data removes it.</p>
            {!shortlist.storageAvailable && <p className="mt-2 text-[var(--accent)]">Browser storage is unavailable; changes will last only for this open page.</p>}
          </div>
        </div>

        {organizations.length === 0 ? (
          <div className="mt-10 border-y border-[var(--line)] py-10 grid md:grid-cols-12 gap-6">
            <p className="md:col-span-6 text-base leading-relaxed text-[var(--ink-soft)]">
              No organizations saved yet. Add them from search results, the action planner, or any directory row. Your shortlist can then become a CSV for a spreadsheet or a sourced Markdown brief.
            </p>
            <div className="md:col-span-3 md:col-start-10 md:text-right">
              <a href="#directory" className="btn-primary">Browse the directory</a>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-10 flex flex-wrap gap-3 border-b border-[var(--line-strong)] pb-6">
              <button type="button" onClick={copy} className="btn-primary">Copy Markdown</button>
              <button
                type="button"
                onClick={() => {
                  downloadText('bc-ai-compass-shortlist.csv', shortlistToCsv(organizations), 'text/csv;charset=utf-8');
                  setFeedback('CSV downloaded.');
                }}
                className="btn-ghost"
              >
                Download CSV
              </button>
              <button
                type="button"
                onClick={() => {
                  downloadText('bc-ai-compass-shortlist.md', shortlistToMarkdown(organizations));
                  setFeedback('Markdown downloaded.');
                }}
                className="btn-ghost"
              >
                Download .md
              </button>
              <span className="min-h-11 inline-flex items-center font-mono2 text-[11px] text-[var(--ink-soft)]" aria-live="polite">{feedback}</span>
            </div>

            <div className="divide-y divide-[var(--line)] border-b border-[var(--line)]">
              {organizations.map((organization, index) => (
                <article key={organization.id} className="py-5 grid md:grid-cols-12 gap-3 md:gap-5 items-start">
                  <span className="md:col-span-1 font-mono2 text-[10px] text-[var(--ink-faint)] pt-1">{String(index + 1).padStart(2, '0')}</span>
                  <div className="md:col-span-4">
                    <a href={organization.url} target="_blank" rel="noreferrer" className="font-display uppercase text-2xl leading-tight hover:text-[var(--accent)]">{organization.name} ↗</a>
                    <p className="mt-1 font-mono2 text-[9.5px] uppercase tracking-[0.08em] text-[var(--ink-faint)]">{organization.category}</p>
                  </div>
                  <p className="md:col-span-3 font-mono2 text-[10px] leading-relaxed uppercase tracking-[0.06em] text-[var(--ink-soft)]">{organization.location}<br />{organization.region}</p>
                  <div className="md:col-span-2"><a href={organization.sourceUrl} target="_blank" rel="noreferrer" className="stamp">Source · {organization.verified} ↗</a></div>
                  <div className="md:col-span-2 md:text-right">
                    <button type="button" onClick={() => shortlist.remove(organization.id)} className="min-h-11 px-3 font-mono2 text-[10px] uppercase tracking-[0.1em] text-[var(--accent)] hover:text-[var(--ink)]" aria-label={`Remove ${organization.name} from shortlist`}>
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              {!confirmClear ? (
                <button type="button" onClick={() => setConfirmClear(true)} className="min-h-11 px-3 font-mono2 text-[10px] uppercase tracking-[0.1em] text-[var(--ink-faint)] hover:text-[var(--accent)]">Clear shortlist</button>
              ) : (
                <div className="flex flex-wrap items-center gap-3" role="group" aria-label="Confirm clearing shortlist">
                  <span className="text-sm text-[var(--ink-soft)]">Remove all {organizations.length} saved records?</span>
                  <button
                    type="button"
                    onClick={() => {
                      shortlist.clear();
                      setConfirmClear(false);
                      setFeedback('Shortlist cleared.');
                    }}
                    className="min-h-11 px-4 border border-[var(--accent)] text-[var(--accent)] font-mono2 text-[10px] uppercase tracking-[0.1em]"
                  >
                    Yes, clear
                  </button>
                  <button type="button" onClick={() => setConfirmClear(false)} className="min-h-11 px-4 font-mono2 text-[10px] uppercase tracking-[0.1em] text-[var(--ink)]">Cancel</button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
