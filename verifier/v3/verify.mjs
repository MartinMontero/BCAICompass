import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const root = new URL('../../', import.meta.url);
const rootPath = new URL(root).pathname;
const read = (path) => readFileSync(new URL(path, root), 'utf8');
const checks = [];
const commands = [];
const check = (name, pass, detail = '') => checks.push({ name, pass: Boolean(pass), detail });

const baselineHash = '07c001e1febed219bdb0bb1582f30aa35ef8f8e4931ce73ab2a074856a4aafd6';
const dataHash = createHash('sha256').update(read('src/data/organizations.ts')).digest('hex');
check('Trusted organization dataset unchanged', dataHash === baselineHash, dataHash);

const app = read('src/App.tsx');
const publicAi = read('src/sections/PublicAI.tsx');
const publicData = read('src/data/public-ai.ts');
check('Public AI is mounted as a separate curated resource workflow', app.includes('<PublicAI') && publicData.includes('PUBLIC_AI_RESOURCES') && !read('src/data/organizations.ts').includes('PUBLIC_AI_RESOURCES'));
check('Public AI provides deterministic search and both filters', publicAi.includes('searchPublicAiResources') && publicAi.includes('Resource type') && publicAi.includes('aria-pressed'));
check('Related organizations are explicitly not Public AI certifications', publicAi.includes('not Public AI certification') && publicAi.includes('bcac:directory'));

const nav = read('src/components/Nav.tsx');
const directory = read('src/sections/Directory.tsx');
const shortlist = read('src/components/Shortlist.tsx');
check('Mobile task navigation exposes five primary destinations', nav.includes('Mobile tasks') && nav.includes("label: 'Public AI'") && nav.includes("href: '#shortlist'"));
check('Phone directory filters use an accessible disclosure', directory.includes('filtersOpen') && directory.includes('aria-expanded={filtersOpen}') && directory.includes('directory-filter-options'));
check('Mobile comparison cards preserve full desktop table', shortlist.includes('data-mobile-comparison') && shortlist.includes('hidden md:block overflow-x-auto') && shortlist.includes('<table'));

const contribute = read('src/sections/Contribute.tsx');
const contract = read('contracts/contribution.ts');
check('Guided form replaces developer PR action and collects no email', !contribute.includes('Open a pull request') && contribute.includes('Review before sending.') && !contribute.toLowerCase().includes('type="email"'));
check('Shared strict contract enforces consent and bounded public fields', contract.includes('z.strictObject') && contract.includes('z.literal(true)') && contract.includes("z.enum(['add-organization'"));
check('Client exposes PR URL only after confirmed server success', contribute.includes("if (!response.ok || !result.pullRequestUrl") && contribute.includes("setStep('success')"));

const service = read('api/contributions/service.ts');
const boot = read('api/boot.ts');
const pages = read('functions/api/contributions.ts');
check('Server uses fixed GitHub origin and server-only credential', service.includes("const GITHUB_API = 'https://api.github.com'") && service.includes('options.token') && !service.includes('VITE_'));
check('Hono contribution route precedes API catch-all', boot.indexOf('app.route("/api/contributions"') > 0 && boot.indexOf('app.route("/api/contributions"') < boot.indexOf('app.all("/api/*"'));
check('Cloudflare Pages Function shares service and context.env', pages.includes('onRequestPost') && pages.includes('context.env.GITHUB_TOKEN') && pages.includes('handleContributionRequest'));
const srcFiles = readdirSync(new URL('src', root), { recursive: true }).filter((name) => /\.(ts|tsx)$/.test(String(name)));
check('Browser source contains no GitHub credential variable', !srcFiles.some((name) => read(`src/${name}`).includes('GITHUB_TOKEN')));

for (const [label, command, args] of [
  ['data export', 'npm', ['run', 'verify:data']],
  ['unit and integration tests', 'npm', ['test']],
  ['type check', 'npm', ['run', 'check']],
  ['lint', 'npm', ['run', 'lint']],
  ['production build', 'npm', ['run', 'build']],
  ['browser workflows', 'npm', ['run', 'test:e2e']],
  ['dependency audit', 'npm', ['audit', '--audit-level=low']],
]) {
  const started = new Date().toISOString();
  const result = spawnSync(command, args, { cwd: rootPath, encoding: 'utf8', env: { ...process.env, CHROMIUM_PATH: process.env.CHROMIUM_PATH || '/usr/bin/chromium' } });
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`.trim();
  const exitCode = result.status ?? 1;
  commands.push({ label, command: `${command} ${args.join(' ')}`, startedAt: started, exitCode, outputTail: output.split('\n').slice(-14).join('\n') });
  check(`Command passes: ${label}`, exitCode === 0, `exit ${exitCode}`);
}

const passed = checks.filter((item) => item.pass).length;
const exitCode = checks.every((item) => item.pass) ? 0 : 1;
const timestamp = new Date().toISOString();
const result = {
  version: 'v3',
  timestamp,
  command: 'node verifier/v3/verify.mjs',
  exitCode,
  passed,
  failed: checks.length - passed,
  total: checks.length,
  checks,
  commands,
};
const runsDir = new URL('verifier/runs/', root);
mkdirSync(runsDir, { recursive: true });
const runPath = new URL(`${timestamp.replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')}-v3-acceptance.json`, runsDir);
writeFileSync(runPath, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ ...result, runRecord: new URL(runPath).pathname }, null, 2));
process.exit(exitCode);
