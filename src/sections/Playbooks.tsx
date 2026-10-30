import { useState } from 'react';
import { GOVERNANCE_REFERENCES, PLAYBOOKS } from '../data/playbooks';
import { copyText, downloadText } from '../lib/download';

export default function Playbooks() {
  const [activeId, setActiveId] = useState(PLAYBOOKS[0].id);
  const [drafts, setDrafts] = useState<Record<string, string>>(() => Object.fromEntries(PLAYBOOKS.map((playbook) => [playbook.id, playbook.content])));
  const [feedback, setFeedback] = useState('');
  const active = PLAYBOOKS.find((playbook) => playbook.id === activeId) ?? PLAYBOOKS[0];
  const draft = drafts[active.id] ?? active.content;

  const copy = async () => {
    const copied = await copyText(draft);
    setFeedback(copied ? 'Template copied.' : 'Copy failed. Select the text or download the file.');
  };

  return (
    <section id="playbooks" className="relative bg-[var(--bg)] py-20 md:py-28 border-t border-[var(--line)]">
      <div className="px-5 md:px-10 max-w-[1400px] mx-auto">
        <div className="grid md:grid-cols-12 gap-8 items-end reveal">
          <div className="md:col-span-7">
            <div className="eyebrow mb-4">07 · WORKING TEMPLATES</div>
            <h2 className="font-display uppercase text-5xl md:text-7xl leading-[0.95]">Do the work, not just the reading.</h2>
          </div>
          <p className="md:col-span-4 md:col-start-9 text-base leading-relaxed text-[var(--ink-soft)]">
            Edit a practical Markdown template here, then copy or download it. Your edits stay on this open page; the original is always one reset away.
          </p>
        </div>

        <div className="mt-10 grid sm:grid-cols-3 gap-px bg-[var(--line)] border border-[var(--line)] reveal" role="group" aria-label="Choose a working template">
          {PLAYBOOKS.map((playbook) => (
            <button
              key={playbook.id}
              type="button"
              onClick={() => {
                setActiveId(playbook.id);
                setFeedback('');
              }}
              aria-pressed={active.id === playbook.id}
              className={`min-h-24 text-left p-5 transition-colors ${active.id === playbook.id ? 'bg-[var(--ink)] text-[var(--bg)]' : 'bg-[var(--bg)] text-[var(--ink)] hover:bg-[var(--bg-raise)]'}`}
            >
              <span className="font-display uppercase text-2xl leading-tight block">{playbook.title}</span>
              <span className={`mt-2 block text-[12px] leading-relaxed ${active.id === playbook.id ? 'text-[var(--bg)] opacity-75' : 'text-[var(--ink-soft)]'}`}>{playbook.useWhen}</span>
            </button>
          ))}
        </div>

        <div className="mt-10 grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4">
            <h3 className="font-display uppercase text-3xl leading-tight">{active.title}</h3>
            <p className="mt-4 text-base leading-relaxed text-[var(--ink-soft)]">{active.summary}</p>
            <div className="mt-6 border-t border-[var(--line)] pt-5">
              <div className="eyebrow mb-4">Official governance starting points</div>
              <div className="space-y-5">
                {GOVERNANCE_REFERENCES.map((reference) => (
                  <div key={reference.url}>
                    <a href={reference.url} target="_blank" rel="noreferrer" className="text-sm font-semibold leading-relaxed text-[var(--ink)] hover:text-[var(--accent)] underline decoration-[var(--line-strong)] underline-offset-4">
                      {reference.title} ↗
                    </a>
                    <p className="mt-1 text-[12px] leading-relaxed text-[var(--ink-soft)]">{reference.note}</p>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-[12px] leading-relaxed text-[var(--ink-faint)]">Templates support internal planning. They do not replace advice for your organization’s legal and regulatory context.</p>
            </div>
          </div>

          <div className="lg:col-span-8">
            <label htmlFor="playbook-editor" className="font-mono2 text-[10px] uppercase tracking-[0.12em] text-[var(--ink-faint)] block mb-3">Editable Markdown · {active.title}</label>
            <textarea
              id="playbook-editor"
              value={draft}
              maxLength={50000}
              spellCheck={false}
              onChange={(event) => setDrafts((current) => ({ ...current, [active.id]: event.target.value }))}
              className="w-full min-h-[620px] resize-y bg-[var(--bg-raise)] border border-[var(--line-strong)] p-5 font-mono2 text-[13px] leading-[1.7] text-[var(--ink)] focus:border-[var(--brand)] outline-none"
            />
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button type="button" onClick={copy} className="btn-primary">Copy template</button>
              <button
                type="button"
                onClick={() => {
                  downloadText(active.filename, draft);
                  setFeedback('Markdown downloaded.');
                }}
                className="btn-ghost"
              >
                Download .md
              </button>
              <button
                type="button"
                onClick={() => {
                  setDrafts((current) => ({ ...current, [active.id]: active.content }));
                  setFeedback('Original template restored.');
                }}
                className="min-h-11 px-4 font-mono2 text-[10px] uppercase tracking-[0.1em] text-[var(--accent)] hover:text-[var(--ink)]"
              >
                Reset original
              </button>
              <span className="font-mono2 text-[11px] text-[var(--ink-soft)]" aria-live="polite">{feedback}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
