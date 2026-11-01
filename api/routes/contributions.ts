import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import {
  createMemoryRateLimiter,
  handleContributionRequest,
} from '../contributions/service';

export const contributionsRoutes = new Hono();
const allowRequest = createMemoryRateLimiter();

contributionsRoutes.post(
  '/',
  bodyLimit({ maxSize: 32 * 1024, onError: (c) => c.json({ error: 'Submission is too large.', fallback: true }, 413) }),
  async (c) => {
    const clientKey = c.req.header('cf-connecting-ip')
      ?? c.req.header('x-forwarded-for')?.split(',')[0]?.trim()
      ?? 'local';
    return handleContributionRequest(c.req.raw, {
      token: process.env.GITHUB_TOKEN,
      owner: process.env.GITHUB_OWNER,
      repo: process.env.GITHUB_REPO,
      allowRequest,
    }, clientKey);
  },
);
