import { describe, expect, it, vi } from 'vitest';
import { contributionSchema } from '../../contracts/contribution';
import { createContribution, createMemoryRateLimiter, handleContributionRequest } from '../../api/contributions/service';
import app from '../../api/boot';

const validSubmission = {
  kind: 'add-organization',
  name: 'Example Public Lab',
  website: 'https://example.org/',
  sourceUrl: 'https://example.org/ai-work',
  location: 'Victoria, BC',
  details: 'This public lab publishes useful open AI research and learning resources.',
  consent: true,
  formStartedAt: Date.now() - 5000,
  honeypot: '',
} as const;

describe('guided contribution contract', () => {
  it('requires public-source consent and rejects credential or unexpected personal fields', () => {
    expect(contributionSchema.safeParse(validSubmission).success).toBe(true);
    expect(contributionSchema.safeParse({ ...validSubmission, consent: false }).success).toBe(false);
    expect(contributionSchema.safeParse({ ...validSubmission, githubToken: 'do-not-accept' }).success).toBe(false);
    expect(contributionSchema.safeParse({ ...validSubmission, email: 'person@example.org' }).success).toBe(false);
  });

  it('creates a branch, submission file, and pull request without exposing the token', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ default_branch: 'main' }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ object: { sha: 'base-sha' } }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ref: 'refs/heads/contribution/test' }), { status: 201 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ content: { path: 'submissions/test.json' } }), { status: 201 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ html_url: 'https://github.com/MartinMontero/BCAICompass/pull/42', number: 42 }), { status: 201 }));
    const result = await createContribution(contributionSchema.parse(validSubmission), { token: 'server-only-test-token', owner: 'MartinMontero', repo: 'BCAICompass', fetchImpl: fetchMock, now: () => new Date('2026-11-01T12:00:00Z'), id: () => 'test-submission' });
    expect(result.pullRequestUrl).toBe('https://github.com/MartinMontero/BCAICompass/pull/42');
    expect(fetchMock).toHaveBeenCalledTimes(5);
    const fileCall = fetchMock.mock.calls[3];
    expect(String(fileCall[0])).toContain('/contents/submissions/');
    const fileBody = JSON.parse(String(fileCall[1]?.body));
    const publicFile = Buffer.from(fileBody.content, 'base64').toString('utf8');
    expect(publicFile).toContain('Example Public Lab');
    expect(publicFile).not.toContain('server-only-test-token');
    expect(publicFile).not.toContain('formStartedAt');
    expect(publicFile).not.toContain('honeypot');
  });

  it('returns an honest configuration state instead of simulating a pull request', async () => {
    const fetchMock = vi.fn();
    const response = await handleContributionRequest(new Request('https://example.org/api/contributions', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(validSubmission) }), { fetchImpl: fetchMock });
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ configured: false, fallback: true });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('bounds automated retries and rejects oversized requests before GitHub is called', async () => {
    const allow = createMemoryRateLimiter(2, 1000);
    expect(allow('one-connection')).toBe(true);
    expect(allow('one-connection')).toBe(true);
    expect(allow('one-connection')).toBe(false);
    const limited = await handleContributionRequest(new Request('https://example.org/api/contributions', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(validSubmission) }), { token: 'not-reached', allowRequest: () => false });
    expect(limited.status).toBe(429);
    const oversized = await handleContributionRequest(new Request('https://example.org/api/contributions', { method: 'POST', headers: { 'content-type': 'application/json', 'content-length': '40000' }, body: '{}' }), { token: 'not-reached' });
    expect(oversized.status).toBe(413);
  });

  it('registers the REST route before the API 404 handler and keeps unknown routes unavailable', async () => {
    const response = await app.request('/api/contributions', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' });
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: 'Please review the highlighted submission fields.' });
    const missing = await app.request('/api/not-a-route');
    expect(missing.status).toBe(404);
  });
});
