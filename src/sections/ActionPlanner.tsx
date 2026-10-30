import { useMemo, useState } from 'react';
import { CATEGORY_COLORS } from '../data/organizations';
import type { Preset } from '../data/preset';
import { copyText, downloadText } from '../lib/download';
import {
  buildActionPlan,
  GOALS,
  PLAN_REGIONS,
  planToMarkdown,
  type GoalId,
  type PlanRegion,
} from '../lib/plan';

export default function ActionPlanner({
  savedIds,
  onToggle,
  onPreset,
  region,
  onRegionChange,
}: {
  savedIds: Set<string>;
  onToggle: (id: string) => void;
  onPreset: (preset: Preset) => void;
  region: PlanRegion;
  onRegionChange: (region: PlanRegion) => void;
}) {
  const [goalId, setGoalId] = useState<GoalId>('adopt');
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [feedback, setFeedback] = useState('');
  const plan = useMemo(() => buildActionPlan(goalId, region), [goalId, region]);
  const markdown = useMemo(() => planToMarkdown(plan), [plan]);

  const chooseGoal = (id: GoalId) => {
    setGoalId(id);
    setChecked(new Set());
    setFeedback('');
  };

  const toggleStep = (index: number) => {
    setChecked((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const showGoalOnMap = () => {
    onPreset({ kind: 'onramp', id: `goal-${plan.goal.id}`, label: plan.goal.label, categories: plan.goal.categories });
    document.getElementById('map')?.scrollIntoView({ behavior: 'smooth' });
  };

  const trace = (id: string, name: string, stops: string[]) => {
    onRegionChange('All regions');
    onPreset({ kind: 'pathway', id, name, stops });
    document.getElementById('map')?.scrollIntoView({ behavior: 'smooth' });
  };

  const copy = async () => {
    const copied = await copyText(markdown);
    setFeedback(copied ? 'Plan copied.' : 'Copy failed. Download the Markdown file instead.');
  };

  return (
    <section id="planner" className="relative bg-[var(--bg)] py-16 md:py-24 border-t border-[var(--line)]">
      <div className="px-5 md:px-10 max-w-[1400px] mx-auto">
        <div className="grid lg:grid-cols-12 gap-6 items-end reveal">
          <div className="lg:col-span-7">
            <div className="eyebrow mb-3">02 · ACTION PLANNER</div>
            <h2 className="font-display uppercase text-4xl md:text-6xl leading-[0.95]">Turn a goal into a route.</h2>
          </div>
          <p className="lg:col-span-4 lg:col-start-9 text-sm leading-relaxed text-[var(--ink-soft)]">
            Choose an outcome and a place. Get a four-step checklist, relevant verified organizations, and a route you can export.
          </p>
        </div>

        <div className="mt-8 grid lg:grid-cols-12 gap-5">
          <div className="lg:col-span-4 rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--bg-raise)] p-4 md:p-5 reveal">
            <div className="font-mono2 text-[10px] uppercase tracking-[0.12em] text-[var(--ink-faint)] mb-3">1 · Choose your goal</div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-2" role="group" aria-label="Action plan goal">
              {GOALS.map((goal, index) => (
                <button
                  key={goal.id}
                  type="button"
                  onClick={() => chooseGoal(goal.id)}
                  aria-pressed={goal.id === goalId}
                  className={`min-h-12 rounded-[var(--radius-sm)] border px-3.5 py-2.5 text-left text-[13px] font-medium transition-colors ${goal.id === goalId ? 'border-[var(--brand)] bg-[var(--brand)] text-[var(--brand-ink)]' : 'border-[var(--line)] text-[var(--ink-soft)] hover:border-[var(--brand)] hover:text-[var(--ink)]'}`}
                >
                  <span className={`font-mono2 text-[9px] mr-2.5 ${goal.id === goalId ? 'opacity-75' : 'text-[var(--accent)]'}`}>{String(index + 1).padStart(2, '0')}</span>
                  {goal.label}
                </button>
              ))}
            </div>
            <label htmlFor="planner-region" className="font-mono2 text-[10px] uppercase tracking-[0.12em] text-[var(--ink-faint)] block mt-6 mb-2">2 · Shared region</label>
            <select
              id="planner-region"
              aria-label="Region"
              value={region}
              onChange={(event) => onRegionChange(event.target.value as PlanRegion)}
              className="w-full min-h-12 rounded-[var(--radius-sm)] border border-[var(--line-strong)] bg-[var(--bg)] px-3 text-sm text-[var(--ink)]"
            >
              {PLAN_REGIONS.map((item) => <option key={item}>{item}</option>)}
            </select>
            <p className="mt-2 text-[11px] leading-relaxed text-[var(--ink-faint)]">Also filters the atlas, map, and directory.</p>
          </div>

          <div className="lg:col-span-8 rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--bg-raise)] p-5 md:p-7 reveal">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-2xl">
                <div className="eyebrow mb-2">Your checklist · {region}</div>
                <h3 className="font-display uppercase text-3xl md:text-4xl leading-tight">{plan.goal.title}</h3>
                <p className="mt-2 text-sm text-[var(--ink-soft)]">{plan.goal.summary}</p>
              </div>
              <div className="text-right shrink-0" aria-label={`${checked.size} of 4 planning steps complete`}>
                <div className="font-display text-4xl">{checked.size}<span className="text-[var(--ink-faint)] text-2xl">/4</span></div>
                <div className="font-mono2 text-[9px] uppercase tracking-[0.1em] text-[var(--ink-faint)]">steps marked</div>
              </div>
            </div>
            <div className="mt-5 h-1.5 rounded-full bg-[var(--bg-sink)] overflow-hidden" aria-hidden>
              <div className="h-full bg-[var(--brand)] transition-[width] duration-300" style={{ width: `${checked.size * 25}%` }} />
            </div>

            <ol className="mt-5 grid md:grid-cols-2 gap-3">
              {plan.goal.steps.map((step, index) => (
                <li key={step.title} className={`rounded-[var(--radius-md)] border p-4 transition-colors ${checked.has(index) ? 'border-[var(--brand)] bg-[var(--bg-sink)]' : 'border-[var(--line)] bg-[var(--bg)]'}`}>
                  <label className="flex items-start gap-3 cursor-pointer min-h-11">
                    <input type="checkbox" checked={checked.has(index)} onChange={() => toggleStep(index)} className="mt-1 h-4 w-4 accent-[var(--brand)] shrink-0" />
                    <span>
                      <span className={`block text-sm font-semibold ${checked.has(index) ? 'line-through opacity-65' : ''}`}>{index + 1}. {step.title}</span>
                      <span className="block mt-1.5 text-[12px] leading-relaxed text-[var(--ink-soft)]">{step.detail}</span>
                    </span>
                  </label>
                </li>
              ))}
            </ol>

            <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-[var(--line)] pt-5">
              <button type="button" onClick={showGoalOnMap} className="btn-primary">Show goal on map</button>
              <button type="button" onClick={copy} className="btn-ghost">Copy action plan</button>
              <button type="button" onClick={() => { downloadText(`bc-ai-plan-${plan.goal.id}.md`, markdown); setFeedback('Markdown downloaded.'); }} className="btn-ghost">Download .md</button>
              <span className="font-mono2 text-[10px] text-[var(--ink-soft)]" aria-live="polite">{feedback}</span>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-[var(--radius-lg)] border border-[var(--line)] p-5 md:p-6 reveal">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <div>
              <div className="eyebrow">Verified starting points</div>
              <p className="mt-1 text-[12px] text-[var(--ink-soft)]">Compare candidates, check the source, then confirm current program details before acting.</p>
            </div>
            {plan.pathways.length > 0 && (
              <div className="flex flex-wrap gap-2" aria-label="Related pathways">
                {plan.pathways.map((pathway) => (
                  <button key={pathway.id} type="button" onClick={() => trace(pathway.id, pathway.name, pathway.stops)} className="min-h-11 rounded-full border border-[var(--accent)] px-3.5 font-mono2 text-[9.5px] uppercase tracking-[0.06em] text-[var(--accent)] hover:bg-[var(--brand)] hover:text-[var(--brand-ink)] transition-colors">
                    Trace: {pathway.name} →
                  </button>
                ))}
              </div>
            )}
          </div>

          {plan.organizations.length > 0 ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {plan.organizations.map((organization) => {
                const saved = savedIds.has(organization.id);
                return (
                  <article key={organization.id} className="rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--bg)] p-4 flex flex-col min-h-44">
                    <div className="flex items-center gap-2 font-mono2 text-[9px] uppercase tracking-[0.07em]" style={{ color: CATEGORY_COLORS[organization.category] }}>
                      <span className="w-2 h-2 rounded-full" style={{ background: CATEGORY_COLORS[organization.category] }} />
                      {organization.category}
                    </div>
                    <a href={organization.url} target="_blank" rel="noreferrer" className="mt-3 font-display uppercase text-xl leading-tight hover:text-[var(--accent)]">{organization.name} ↗</a>
                    <p className="mt-2 text-[11px] text-[var(--ink-faint)]">{organization.location} · {organization.region}</p>
                    <div className="mt-auto pt-4 flex items-center justify-between gap-2">
                      <a href={organization.sourceUrl} target="_blank" rel="noreferrer" className="stamp" title={`Source read ${organization.sourceDate}`}>Source · {organization.verified} ↗</a>
                      <button type="button" onClick={() => onToggle(organization.id)} aria-pressed={saved} className={`min-h-11 px-3 rounded-[var(--radius-sm)] border font-mono2 text-[9px] uppercase ${saved ? 'border-[var(--brand)] bg-[var(--brand)] text-[var(--brand-ink)]' : 'border-[var(--line-strong)] hover:border-[var(--brand)]'}`}>
                        {saved ? 'Saved ✓' : '+ Shortlist'}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="py-6 text-sm text-[var(--ink-soft)]">No verified record matches this goal and region yet. <a href="#contribute" className="text-[var(--accent)] underline underline-offset-4">Contribute a source</a> rather than filling the gap with a guess.</div>
          )}
        </div>
      </div>
    </section>
  );
}
