import { useRef, useState, type FormEvent } from 'react';
import {
  CONTRIBUTION_KIND_LABELS,
  contributionSchema,
  type ContributionInput,
} from '../../contracts/contribution';
import { downloadText } from '../lib/download';

type FormState = Omit<ContributionInput, 'consent'> & { consent: boolean };
type Step = 'edit' | 'review' | 'success';

const emptyForm = (): FormState => ({
  kind: 'add-organization',
  name: '',
  website: '',
  sourceUrl: '',
  location: '',
  details: '',
  consent: false,
  formStartedAt: Date.now(),
  honeypot: '',
});

const inputClass = 'mt-2 w-full min-h-12 rounded-[var(--radius-sm)] border border-[var(--line-strong)] bg-[var(--bg)] px-3.5 text-sm text-[var(--ink)] placeholder:text-[var(--ink-faint)] outline-none focus:border-[var(--brand)]';

export default function Contribute() {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [step, setStep] = useState<Step>('edit');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [pullRequest, setPullRequest] = useState<{ url: string; number: number } | null>(null);
  const startedAt = useRef(form.formStartedAt);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const review = (event: FormEvent) => {
    event.preventDefault();
    const parsed = contributionSchema.safeParse({ ...form, formStartedAt: startedAt.current });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = String(issue.path[0] ?? 'form');
        if (next[field]) continue;
        next[field] = field === 'details'
          ? 'Please add at least 20 characters so reviewers have enough context.'
          : field === 'consent'
            ? 'Please confirm that you used public sources and included no personal contact details.'
            : issue.message;
      }
      setErrors(next);
      return;
    }
    setForm((current) => ({ ...current, ...parsed.data }));
    setErrors({});
    setServerError('');
    setStep('review');
  };

  const publicCopy = () => ({
    kind: form.kind,
    name: form.name,
    website: form.website,
    sourceUrl: form.sourceUrl,
    location: form.location,
    details: form.details,
  });

  const download = () => {
    downloadText('bc-ai-compass-contribution.json', `${JSON.stringify(publicCopy(), null, 2)}\n`, 'application/json;charset=utf-8');
  };

  const submit = async () => {
    setSubmitting(true);
    setServerError('');
    try {
      const response = await fetch('/api/contributions', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...form, formStartedAt: startedAt.current }),
      });
      const result = await response.json() as { pullRequestUrl?: string; number?: number; error?: string };
      if (!response.ok || !result.pullRequestUrl || !result.number) {
        setServerError(result.error || 'The pull request could not be created. Download your submission and try again later.');
        return;
      }
      setPullRequest({ url: result.pullRequestUrl, number: result.number });
      setStep('success');
    } catch {
      setServerError('The submission service could not be reached. Your submission has not been sent; download a copy and try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    const fresh = emptyForm();
    startedAt.current = fresh.formStartedAt;
    setForm(fresh);
    setErrors({});
    setServerError('');
    setPullRequest(null);
    setStep('edit');
  };

  return (
    <section id="contribute" className="relative bg-[var(--bg-raise)] py-16 md:py-24 border-t border-[var(--line)]">
      <div className="px-5 md:px-10 max-w-[1400px] mx-auto">
        <div className="grid md:grid-cols-12 gap-x-10 gap-y-10">
          <div className="md:col-span-7 reveal">
            <div className="eyebrow mb-3">CONTRIBUTE · GUIDED REVIEW</div>
            <h2 className="font-display uppercase text-4xl md:text-6xl leading-[0.95]">Send a source.<br />No GitHub needed.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--ink-soft)]">Tell us what belongs, check your answers, then send. The server creates a pull request for maintainers to review; nothing is merged automatically.</p>
            {step === 'success' && pullRequest ? (
              <div className="mt-8 rounded-[var(--radius-lg)] border border-[var(--brand)] bg-[var(--bg)] p-6" aria-live="polite">
                <div className="font-mono2 text-[10px] uppercase tracking-[0.08em] text-[var(--accent)]">Submission received</div>
                <h3 className="mt-3 font-display uppercase text-3xl">Pull request created.</h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--ink-soft)]">A maintainer still needs to check the sources and merge it. You can keep the pull-request link to follow that review.</p>
                <div className="mt-6 flex flex-wrap gap-3"><a href={pullRequest.url} target="_blank" rel="noreferrer" className="btn-primary">View pull request #{pullRequest.number} ↗</a><button type="button" onClick={reset} className="btn-ghost">Make another contribution</button></div>
              </div>
            ) : step === 'review' ? (
              <div className="mt-8 rounded-[var(--radius-lg)] border border-[var(--line-strong)] bg-[var(--bg)] p-5 md:p-6">
                <div className="font-mono2 text-[10px] uppercase tracking-[0.08em] text-[var(--accent)]">Step 2 of 2</div>
                <h3 className="mt-3 font-display uppercase text-3xl">Review before sending.</h3>
                <dl className="mt-5 grid grid-cols-[110px_1fr] gap-y-3 text-[12px] leading-relaxed">
                  <dt className="text-[var(--ink-faint)]">Type</dt><dd>{CONTRIBUTION_KIND_LABELS[form.kind]}</dd>
                  <dt className="text-[var(--ink-faint)]">Name</dt><dd className="break-words">{form.name}</dd>
                  <dt className="text-[var(--ink-faint)]">Website</dt><dd className="break-all">{form.website}</dd>
                  <dt className="text-[var(--ink-faint)]">Source</dt><dd className="break-all">{form.sourceUrl}</dd>
                  {form.location && <><dt className="text-[var(--ink-faint)]">B.C. location</dt><dd>{form.location}</dd></>}
                  <dt className="text-[var(--ink-faint)]">For reviewers</dt><dd className="whitespace-pre-wrap break-words">{form.details}</dd>
                </dl>
                <p className="mt-5 border-t border-[var(--line)] pt-4 text-[11px] leading-relaxed text-[var(--ink-faint)]">Submitting creates a public pull request containing the information above. It does not publish or merge a directory change.</p>
                {serverError && <div role="alert" className="mt-4 border-l-2 border-[var(--accent)] pl-3 text-[12px] leading-relaxed text-[var(--ink)]">{serverError}</div>}
                <div className="mt-6 flex flex-wrap gap-3">
                  <button type="button" onClick={submit} disabled={submitting} className="btn-primary disabled:opacity-60">{submitting ? 'Creating pull request…' : 'Create pull request'}</button>
                  <button type="button" onClick={() => setStep('edit')} disabled={submitting} className="btn-ghost">Edit answers</button>
                  <button type="button" onClick={download} className="min-h-12 px-2 font-mono2 text-[10px] uppercase tracking-[0.06em] text-[var(--accent)]">Download submission</button>
                </div>
              </div>
            ) : (
              <form onSubmit={review} noValidate className="mt-8 rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--bg)] p-4 md:p-6">
                <div className="font-mono2 text-[10px] uppercase tracking-[0.08em] text-[var(--accent)]">Step 1 of 2 · Your answers</div>
                <fieldset className="mt-5">
                  <legend className="text-[12px] font-semibold">What would you like to do?</legend>
                  <div className="mt-3 grid sm:grid-cols-3 gap-2">
                    {(Object.keys(CONTRIBUTION_KIND_LABELS) as FormState['kind'][]).map((kind) => (
                      <label key={kind} className={`min-h-14 flex items-center gap-2 rounded-[var(--radius-sm)] border px-3 text-[11px] leading-snug ${form.kind === kind ? 'border-[var(--brand)] bg-[var(--bg-raise)]' : 'border-[var(--line)]'}`}>
                        <input type="radio" name="kind" value={kind} checked={form.kind === kind} onChange={() => update('kind', kind)} className="accent-[var(--brand)]" />
                        {CONTRIBUTION_KIND_LABELS[kind]}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <div className="mt-5 grid sm:grid-cols-2 gap-4">
                  <label className="text-[12px] font-semibold">Name<input value={form.name} onChange={(event) => update('name', event.target.value)} maxLength={160} autoComplete="off" className={inputClass} placeholder="Organization or resource" aria-invalid={Boolean(errors.name)} />{errors.name && <span className="mt-1 block text-[11px] text-[var(--accent)]">{errors.name}</span>}</label>
                  <label className="text-[12px] font-semibold">Website<input type="url" value={form.website} onChange={(event) => update('website', event.target.value)} maxLength={2048} autoComplete="off" className={inputClass} placeholder="https://…" aria-invalid={Boolean(errors.website)} />{errors.website && <span className="mt-1 block text-[11px] text-[var(--accent)]">{errors.website}</span>}</label>
                </div>
                <label className="mt-4 block text-[12px] font-semibold">Supporting source URL<input type="url" value={form.sourceUrl} onChange={(event) => update('sourceUrl', event.target.value)} maxLength={2048} className={inputClass} placeholder="A public page that supports the change" aria-invalid={Boolean(errors.sourceUrl)} />{errors.sourceUrl && <span className="mt-1 block text-[11px] text-[var(--accent)]">{errors.sourceUrl}</span>}</label>
                {form.kind !== 'suggest-public-ai' && <label className="mt-4 block text-[12px] font-semibold">B.C. location<input value={form.location} onChange={(event) => update('location', event.target.value)} maxLength={160} className={inputClass} placeholder="City, region, or province-wide" aria-invalid={Boolean(errors.location)} />{errors.location && <span className="mt-1 block text-[11px] text-[var(--accent)]">{errors.location}</span>}</label>}
                <label className="mt-4 block text-[12px] font-semibold">What should reviewers know?
                  <textarea value={form.details} onChange={(event) => update('details', event.target.value)} maxLength={3000} rows={5} className={`${inputClass} py-3 resize-y`} placeholder={form.kind === 'correct-record' ? 'What is wrong, and what does the source show instead?' : 'What is the AI or public-knowledge work, and why is it useful?'} aria-invalid={Boolean(errors.details)} />
                  <span className="mt-1 flex justify-between gap-3 text-[10px] font-normal text-[var(--ink-faint)]"><span>Do not include personal contact details.</span><span>{form.details.length}/3000</span></span>
                  {errors.details && <span className="mt-1 block text-[11px] text-[var(--accent)]">{errors.details}</span>}
                </label>
                <label className="mt-5 flex items-start gap-3 text-[12px] leading-relaxed text-[var(--ink-soft)]"><input type="checkbox" checked={form.consent} onChange={(event) => update('consent', event.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-[var(--brand)]" /><span>I confirm that these are public sources and that I have not included personal contact details. I understand the submission will be public.</span></label>
                {errors.consent && <div className="mt-2 text-[11px] text-[var(--accent)]">{errors.consent}</div>}
                <div aria-hidden="true" className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden"><label>Company<input tabIndex={-1} autoComplete="off" value={form.honeypot} onChange={(event) => update('honeypot', event.target.value)} /></label></div>
                <button type="submit" className="btn-primary mt-6 w-full sm:w-auto">Review submission →</button>
              </form>
            )}
          </div>
          <aside className="md:col-span-5 reveal">
            <div className="border-t-2 border-[var(--ink)] pt-5">
              <div className="font-mono2 text-[10px] tracking-[0.14em] uppercase text-[var(--ink-faint)]">A useful submission has</div>
              <ol className="mt-5 space-y-5">
                {[
                  ['01', 'A public source', 'Link to the organization, resource, or evidence itself—not a private document.'],
                  ['02', 'A B.C. connection', 'For organizations, identify a B.C. location or province-wide presence.'],
                  ['03', 'Enough context to check', 'Point to the real AI work, correction, preservation role, or public benefit.'],
                ].map(([n, heading, body]) => (
                  <li key={n} className="grid grid-cols-[32px_1fr] gap-3"><span className="font-mono2 text-[10px] text-[var(--accent)]">{n}</span><span><strong className="font-display uppercase text-xl">{heading}</strong><span className="mt-1 block text-[12px] leading-relaxed text-[var(--ink-soft)]">{body}</span></span></li>
                ))}
              </ol>
              <p className="mt-7 border-t border-[var(--line)] pt-5 text-[11px] leading-relaxed text-[var(--ink-faint)]">No account, email address, or GitHub knowledge is needed. Submissions are reviewed by people; an unchecked organization is not treated as nonexistent.</p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
