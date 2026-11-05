// Reproducible public-source review for the 136 organization records.
// Fetches only public HTML pages; never collects email addresses, phone numbers,
// credentials, or non-public contact details. Resume-safe within a research run.
import { build } from 'esbuild';
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const CONCURRENCY = 10;
const TIMEOUT_MS = 12_000;
const MAX_LINKS_PER_ORG = 3;
const OUTPUT = 'research/people-source-review.json';
const CACHE = '/tmp/bcac-source-cache.json';

const result = await build({ entryPoints: ['src/data/organizations.ts'], bundle: true, format: 'esm', platform: 'node', write: false });
const { ORGANIZATIONS } = await import('data:text/javascript;base64,' + Buffer.from(result.outputFiles[0].text).toString('base64'));
let cache = {};
try { cache = JSON.parse(await readFile(CACHE, 'utf8')); } catch { /* first run */ }

const LINK_PATTERN = /(?:^|[\s/_-])(team|people|staff|leadership|about|faculty|researchers?|investigators?|management|board|who-we-are|our-story|projects?|programs?|lab)(?:$|[\s/_-])/i;
const EXCLUDE_PATTERN = /mailto:|tel:|javascript:|login|signin|privacy|terms|\.pdf(?:$|\?)|\.jpg(?:$|\?)|\.png(?:$|\?)|\.zip(?:$|\?)/i;

function cleanText(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'").replace(/&mdash;/gi, '—').replace(/&ndash;/gi, '–')
    .replace(/\s+/g, ' ')
    .trim();
}

function linksFor(html, pageUrl, org) {
  const allowedHosts = new Set([org.url, org.sourceUrl].filter(Boolean).map((url) => new URL(url).hostname));
  const found = new Map();
  for (const match of html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    try {
      const url = new URL(match[1], pageUrl);
      url.hash = '';
      if (!/^https?:$/.test(url.protocol) || !allowedHosts.has(url.hostname) || EXCLUDE_PATTERN.test(url.href)) continue;
      const text = cleanText(match[2]).slice(0, 180);
      const haystack = `${text} ${url.pathname}`;
      if (!LINK_PATTERN.test(haystack)) continue;
      const score = (/team|people|staff|leadership|faculty|researchers?|investigators?|management|board/i.test(haystack) ? 4 : 0)
        + (/about|who-we-are|our-story/i.test(haystack) ? 2 : 0)
        + (/projects?|programs?|lab/i.test(haystack) ? 1 : 0);
      if (!found.has(url.href) || found.get(url.href).score < score) found.set(url.href, { url: url.href, linkText: text, score });
    } catch { /* malformed link */ }
  }
  return [...found.values()].sort((a, b) => b.score - a.score).slice(0, MAX_LINKS_PER_ORG);
}

async function fetchPage(url) {
  if (cache[url]?.status === 200 && cache[url]?.html) return cache[url];
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'user-agent': 'Mozilla/5.0 (compatible; BCAICompassResearch/1.0; +https://bc-aicompass.ca)', accept: 'text/html,application/xhtml+xml' },
    });
    const contentType = response.headers.get('content-type') ?? '';
    const html = contentType.includes('html') ? await response.text() : '';
    cache[url] = { status: response.status, finalUrl: response.url, contentType, html };
  } catch (error) {
    cache[url] = { status: 0, error: error?.name === 'AbortError' ? 'timeout' : String(error?.message ?? error), html: '' };
  } finally {
    clearTimeout(timer);
  }
  return cache[url];
}

async function review(org) {
  const seeds = [...new Set([org.url, org.sourceUrl].filter(Boolean))];
  const pages = [];
  const candidateMap = new Map();
  for (const url of seeds) {
    const result = await fetchPage(url);
    const text = cleanText(result.html ?? '');
    pages.push({ url, status: result.status, finalUrl: result.finalUrl, error: result.error, textLength: text.length });
    if (result.status === 200 && text.length > 80) {
      for (const link of linksFor(result.html, result.finalUrl ?? url, org)) candidateMap.set(link.url, link);
    }
  }
  for (const candidate of [...candidateMap.values()].sort((a, b) => b.score - a.score).slice(0, MAX_LINKS_PER_ORG)) {
    const result = await fetchPage(candidate.url);
    const text = cleanText(result.html ?? '');
    pages.push({ url: candidate.url, linkText: candidate.linkText, status: result.status, finalUrl: result.finalUrl, error: result.error, textLength: text.length });
  }
  return {
    organizationId: org.id,
    organizationName: org.name,
    organizationUrl: org.url,
    organizationSourceUrl: org.sourceUrl,
    reviewStatus: pages.some((page) => page.status === 200 && page.textLength > 80) ? 'pages-reviewed' : 'no-readable-public-page',
    pages,
  };
}

let index = 0;
const reviews = new Array(ORGANIZATIONS.length);
async function worker() {
  while (index < ORGANIZATIONS.length) {
    const current = index++;
    const org = ORGANIZATIONS[current];
    reviews[current] = await review(org);
    const done = reviews.filter(Boolean).length;
    console.log(`[${done}/${ORGANIZATIONS.length}] ${org.name}: ${reviews[current].reviewStatus}, ${reviews[current].pages.length} pages`);
    await mkdir('research', { recursive: true });
    await writeFile(OUTPUT, JSON.stringify({ generatedAt: new Date().toISOString(), organizationCount: ORGANIZATIONS.length, reviewedCount: done, organizations: reviews.filter(Boolean) }, null, 2) + '\n');
    await writeFile(CACHE, JSON.stringify(cache));
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
const completed = reviews.filter((review) => review.reviewStatus === 'pages-reviewed').length;
console.log(`Review complete: ${completed}/${ORGANIZATIONS.length} organizations have readable public pages.`);
