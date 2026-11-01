import { contributionSchema, type Contribution } from '../../contracts/contribution';

const GITHUB_API = 'https://api.github.com';
const MAX_BODY_BYTES = 32 * 1024;

type Fetch = typeof fetch;

export type ContributionServiceOptions = {
  token?: string;
  owner?: string;
  repo?: string;
  fetchImpl?: Fetch;
  now?: () => Date;
  id?: () => string;
};

export type ContributionRequestOptions = ContributionServiceOptions & {
  allowRequest?: (key: string) => boolean;
};

function json(body: unknown, status: number): Response {
  return Response.json(body, { status, headers: { 'cache-control': 'no-store' } });
}

function utf8Base64(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function safePart(value: string, fallback: string): string {
  return /^[A-Za-z0-9_.-]+$/.test(value) ? value : fallback;
}

export async function createContribution(
  submission: Contribution,
  options: ContributionServiceOptions & { token: string },
): Promise<{ pullRequestUrl: string; number: number }> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const owner = safePart(options.owner ?? 'MartinMontero', 'MartinMontero');
  const repo = safePart(options.repo ?? 'BCAICompass', 'BCAICompass');
  const now = (options.now ?? (() => new Date()))();
  const id = safePart(options.id?.() ?? crypto.randomUUID(), crypto.randomUUID());
  const date = now.toISOString().slice(0, 10);
  const branch = `contribution/${date}-${id}`;
  const filePath = `submissions/${date}-${id}.json`;
  const repoPath = `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;

  const request = async (path: string, init: RequestInit = {}): Promise<Response> => {
    const response = await fetchImpl(`${GITHUB_API}${path}`, {
      ...init,
      headers: {
        accept: 'application/vnd.github+json',
        authorization: `Bearer ${options.token}`,
        'content-type': 'application/json',
        'user-agent': 'bc-ai-compass-contributions',
        'x-github-api-version': '2022-11-28',
        ...init.headers,
      },
    });
    if (!response.ok) throw new Error(`GitHub request failed with status ${response.status}`);
    return response;
  };

  const repository = await (await request(repoPath)).json() as { default_branch?: string };
  const base = safePart(repository.default_branch ?? 'main', 'main');
  const baseRef = await (await request(`${repoPath}/git/ref/heads/${encodeURIComponent(base)}`)).json() as { object?: { sha?: string } };
  if (!baseRef.object?.sha) throw new Error('GitHub did not return a base commit');

  await request(`${repoPath}/git/refs`, {
    method: 'POST',
    body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: baseRef.object.sha }),
  });

  const publicSubmission = {
    kind: submission.kind,
    name: submission.name,
    website: submission.website,
    sourceUrl: submission.sourceUrl,
    location: submission.location,
    details: submission.details,
    submittedAt: now.toISOString(),
  };
  await request(`${repoPath}/contents/${filePath.split('/').map(encodeURIComponent).join('/')}`, {
    method: 'PUT',
    body: JSON.stringify({
      message: `Contribution: ${submission.name}`,
      content: utf8Base64(`${JSON.stringify(publicSubmission, null, 2)}\n`),
      branch,
    }),
  });

  const pullRequest = await (await request(`${repoPath}/pulls`, {
    method: 'POST',
    body: JSON.stringify({
      title: `Community contribution: ${submission.name}`,
      head: branch,
      base,
      body: [
        '## Community submission',
        '',
        `Type: ${submission.kind}`,
        `Public website: ${submission.website}`,
        `Supporting source: ${submission.sourceUrl}`,
        '',
        'The contributor confirmed that these are public sources and that no personal contact details were included. Review the submission JSON and sources before merging.',
      ].join('\n'),
    }),
  })).json() as { html_url?: string; number?: number };

  if (!pullRequest.html_url || !pullRequest.number) throw new Error('GitHub did not return a pull request URL');
  return { pullRequestUrl: pullRequest.html_url, number: pullRequest.number };
}

export function createMemoryRateLimiter(limit = 5, windowMs = 60 * 60 * 1000) {
  const attempts = new Map<string, number[]>();
  return (key: string): boolean => {
    const now = Date.now();
    const recent = (attempts.get(key) ?? []).filter((time) => now - time < windowMs);
    if (recent.length >= limit) return false;
    recent.push(now);
    attempts.set(key, recent);
    return true;
  };
}

export async function handleContributionRequest(
  request: Request,
  options: ContributionRequestOptions,
  clientKey = 'local',
): Promise<Response> {
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
    return json({ error: 'Send the submission as JSON.' }, 415);
  }

  const declaredLength = Number(request.headers.get('content-length') ?? 0);
  if (declaredLength > MAX_BODY_BYTES) return json({ error: 'Submission is too large.', fallback: true }, 413);

  let input: unknown;
  try {
    const text = await request.text();
    if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) {
      return json({ error: 'Submission is too large.', fallback: true }, 413);
    }
    input = JSON.parse(text);
  } catch {
    return json({ error: 'The submission could not be read.' }, 400);
  }

  const parsed = contributionSchema.safeParse(input);
  if (!parsed.success) {
    return json({
      error: 'Please review the highlighted submission fields.',
      fields: [...new Set(parsed.error.issues.map((issue) => String(issue.path[0] ?? 'form')))],
    }, 400);
  }
  if (parsed.data.honeypot !== '') return json({ error: 'The submission could not be accepted.' }, 400);
  const elapsed = Date.now() - parsed.data.formStartedAt;
  if (elapsed < 1200 || elapsed > 24 * 60 * 60 * 1000) {
    return json({ error: 'Please review the form and try submitting again.' }, 400);
  }
  if (options.allowRequest && !options.allowRequest(clientKey)) {
    return json({ error: 'Too many submissions from this connection. Please try again later.', fallback: true }, 429);
  }
  if (!options.token) {
    return json({
      error: 'Pull-request submission is not configured on this server yet. Download your submission and send it to the maintainers instead.',
      configured: false,
      fallback: true,
    }, 503);
  }

  try {
    const result = await createContribution(parsed.data, { ...options, token: options.token });
    return json({ ...result, configured: true, fallback: false }, 201);
  } catch {
    return json({
      error: 'GitHub could not create the pull request. Your submission has not been submitted; download a copy and try again later.',
      configured: true,
      fallback: true,
    }, 502);
  }
}
