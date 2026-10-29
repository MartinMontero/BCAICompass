import { useMemo, useState } from 'react';
import type { Preset } from '../data/preset';
import { copyText, downloadText } from '../lib/download';
import {
  GOALS,
  PLAN_REGIONS,
  buildActionPlan,
  planToMarkdown,
  type GoalId,
  type PlanRegion,
} from '../lib/plan';

export default function ActionPlanner({
  savedIds,
  onToggle,
  onPreset,
}: {
  savedIds: Set<string>;
  onToggle: (id: string) => void;
  onPreset: (preset: Preset) => void;
}) {
  const [goalId, setGoalId] = useState<GoalId>('adopt');
  const [region, setRegion] = useState<PlanRegion>('All regions');
  const [feedback, setFeedback] = useState('');
  const plan = useMemo(() => buildActionPlan(goalId, region), [goalId, region]);

  const copyPlan = async () => {
    const copied = await copyText(planToMarkdown(plan));
    setFeedback(copied ? 'Plan copied.' : 'Copy failed. Download the Markdown instead.');
  };

  return (
    <section id="planner" className="relative bg-[var(--bg)] py-20 md:py-28 border-t border-[var(--line)]">
      <div className="px-5 md:px-10 max-w-[1400px] mx-auto">
        <div className="grid md:grid-cols-12 gap-8 items-end reveal">
          <div className="md:col-span-7">
            <div className="eyebrow mb-4">ACTION PLANNER</div>
            <h2 className="font-display uppercase text-5xl md:text-7xl leading-[0.95]">Leave with next steps.</h2>
          </div>
          <p className="md:col-span-4 md:col-start-9 text-base leading-relaxed text-[var(--ink-soft)]">
            Choose a goal. Get a working checklist, verified organizations to investigate, and a plan you can copy or download.
          </p>
        </div>

        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--line)] border border-[var(--line)] reveal" role="group" aria-label="Choose an action-plan goal">
          {GOALS.map((goal) => (
            <button
              key={goal.id}
              type="button"
              onClick={() => {
                setGoalId(goal.id);
                setFeedback('');
              }}
              aria-pressed={goalId === goal.id}
              className={`min-h-20 text-left p-4 font-mono2 text-[11px] leading-relaxed tracking-[0.06em] uppercase transition-colors ${goalId === goal.id ? 'bg-[var(--ink)] text-[var(--bg)]' : 'bg-[var(--bg)] text-[var(--ink-soft)] hover:bg-[var(--bg-raise)] hover:text-[var(--ink)]'}`}
            >
              {goal.label} →
            </button>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-end justify-between gap-5 border-b border-[var(--line-strong)] pb-6">
          <div className="max-w-2xl">
            <h3 className="font-display uppercase text-3xl md:text-4xl leading-tight">{plan.goal.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-[var(--ink-soft)]">{plan.goal.summary}</p>
          </div>
          <label className="block min-w-64">
            <span className="font-mono2 text-[10px] tracking-[0.12em] uppercase text-[var(--ink-faint)] block mb-2">Region</span>
            <select
              value={region}
              onChange={(event) => setRegion(event.target.value as PlanRegion)}
              className="min-h-11 w-full bg-[var(--bg-raise)] border border-[var(--line-strong)] px-3 py-2 text-sm text-[var(--ink)] focus:border-[var(--brand)] outline-none"
            >
              {PLAN_REGIONS.map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>
        </div>

        <div className="grid lg:grid-cols-12 gap-10 mt-8">
          <div className="lg:col-span-5">
            <div className="eyebrow mb-5">01 · DO THE WORK</div>
            <ol className="space-y-0 border-t border-[var(--line)]">
              {plan.goal.steps.map((step, index) => (
                <li key={step.title} className="grid grid-cols-[2rem_1fr] gap-3 py-5 border-b border-[var(--line)]">
                  <span className="font-mono2 text-[11px] text-[var(--accent)] pt-1">{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <h4 className="font-display uppercase text-xl tracking-wide">{step.title}</h4>
                    <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--ink-soft)]">{step.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-[12px] leading-relaxed text-[var(--ink-faint)]">
              Checklist items are general planning guidance, not legal advice or claims about a listed organization.
            </p>
          </div>

          <div className="lg:col-span-7">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div className="eyebrow">02 · INVESTIGATE THESE VERIFIED RECORDS</div>
              <span className="font-mono2 text-[9.5px] uppercase tracking-[0.08em] text-[var(--ink-faint)]">Goal + region order, not a quality ranking</span>
            </div>
            {plan.organizations.length > 0 ? (
              <div className="border-t border-[var(--line)]">
                {plan.organizations.map((organization) => {
                  const saved = savedIds.has(organization.id);
                  return (
                    <article key={organization.id} className="py-5 border-b border-[var(--line)] grid sm:grid-cols-[1fr_auto] gap-4">
                      <div>
                        <a href={organization.url} target="_blank" rel="noreferrer" className="font-display uppercase text-2xl leading-tight hover:text-[var(--accent)] transition-colors">
                          {organization.name} ↗
                        </a>
                        <p className="mt-1.5 font-mono2 text-[10px] uppercase tracking-[0.08em] text-[var(--ink-faint)]">{organization.location} · {organization.region}</p>
                        <p className="mt-3 text-[13px] leading-relaxed text-[var(--ink-soft)]">{organization.description ?? 'No description was supported by the source.'}</p>
                        <a href={organization.sourceUrl} target="_blank" rel="noreferrer" className="stamp mt-3">Verify source · {organization.verified} ↗</a>
                      </div>
                      <button
                        type="button"
                        onClick={() => onToggle(organization.id)}
                        aria-pressed={saved}
                        className={`min-h-11 self-start px-4 py-2 border font-mono2 text-[10px] uppercase tracking-[0.08em] transition-colors ${saved ? 'border-[var(--brand)] bg-[var(--brand)] text-[var(--brand-ink)]' : 'border-[var(--line-strong)] hover:border-[var(--brand)]'}`}
                      >
                        {saved ? 'Saved ✓' : '+ Shortlist'}
                      </button>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="border-y border-[var(--line)] py-8">
                <p className="text-sm leading-relaxed text-[var(--ink-soft)]">No verified record currently matches this goal and region. Try all regions, or contribute a source so the gap can be reviewed.</p>
                <a href="#contribute" className="btn-ghost mt-5">Contribute a source</a>
              </div>
            )}

            {plan.pathways.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-3">
                {plan.pathways.map((pathway) => (
                  <button
                    key={pathway.id}
                    type="button"
                    onClick={() => {
                      onPreset({ kind: 'pathway', id: pathway.id, name: pathway.name, stops: pathway.stops });
                      document.getElementById('map')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="min-h-11 px-4 py-2 border border-[var(--accent)] text-[var(--accent)] font-mono2 text-[10px] uppercase tracking-[0.08em] hover:bg-[var(--brand)] hover:text-[var(--brand-ink)] transition-colors"
                  >
                    Trace: {pathway.name} →
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-[var(--line-strong)] pt-6">
          <button type="button" onClick={copyPlan} className="btn-primary">Copy action plan</button>
          <button
            type="button"
            onClick={() => {
              downloadText(`bc-ai-${plan.goal.id}-action-plan.md`, planToMarkdown(plan));
              setFeedback('Markdown downloaded.');
            }}
            className="btn-ghost"
          >
            Download .md
          </button>
          <a href="#playbooks" className="min-h-11 inline-flex items-center px-3 font-mono2 text-[10px] uppercase tracking-[0.1em] text-[var(--accent)] hover:text-[var(--ink)]">Open the working templates ↓</a>
          <span className="font-mono2 text-[11px] text-[var(--ink-soft)]" aria-live="polite">{feedback}</span>
        </div>
      </div>
    </section>
  );
}
