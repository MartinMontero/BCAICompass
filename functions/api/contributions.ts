import {
  createMemoryRateLimiter,
  handleContributionRequest,
} from '../../api/contributions/service';

type PagesEnvironment = {
  GITHUB_TOKEN?: string;
  GITHUB_OWNER?: string;
  GITHUB_REPO?: string;
};

type PagesContext = {
  request: Request;
  env: PagesEnvironment;
};

const allowRequest = createMemoryRateLimiter();

// Cloudflare Pages file-based route: /api/contributions. The GitHub credential
// is read only from Pages Settings → Variables and Secrets, never VITE_ env.
export async function onRequestPost(context: PagesContext): Promise<Response> {
  const clientKey = context.request.headers.get('cf-connecting-ip') ?? 'unknown';
  return handleContributionRequest(context.request, {
    token: context.env.GITHUB_TOKEN,
    owner: context.env.GITHUB_OWNER,
    repo: context.env.GITHUB_REPO,
    allowRequest,
  }, clientKey);
}
