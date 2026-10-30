import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
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
check('Connected workflow mounts atlas and comparison', app.includes('<Regions') && app.includes('<Shortlist'));
check('Redundant standalone goal/pathway sections unmounted', !app.includes('<Onramps') && !app.includes('<Pathways'));
check('Shared region passed to planner, map, directory, and atlas', ['region={sharedRegion}', 'onRegionChange={changeRegion}'].every((token) => app.includes(token)) && (app.match(/region={sharedRegion}/g) ?? []).length >= 3);

const regions = read('src/sections/Regions.tsx');
check('Interactive data-derived regional atlas', regions.includes('<button') && regions.includes('mapped') && regions.includes('aria-pressed'));
const shortlist = read('src/components/Shortlist.tsx');
check('Comparison shortlist includes sorting and coverage', shortlist.includes('Sort by') && shortlist.includes('coverage') && shortlist.includes('<table'));
const directory = read('src/sections/Directory.tsx');
check('Directory progressively discloses evidence', directory.includes('<details') && directory.includes('evidenceQuote'));
const ask = read('src/sections/AskTheMap.tsx');
check('Search results retain explanations and map action', ask.includes('reason') && ask.includes('bcac:select'));
const css = read('src/index.css');
check('Accessible token, focus, and reduced-motion foundations', css.includes(':focus-visible') && css.includes('prefers-reduced-motion') && css.includes('--radius'));

for (const [label, command, args] of [
  ['data export', 'npm', ['run', 'verify:data']],
  ['unit tests', 'npm', ['test']],
  ['lint', 'npm', ['run', 'lint']],
  ['production build', 'npm', ['run', 'build']],
  ['browser workflows', 'npm', ['run', 'test:e2e']],
]) {
  const started = new Date().toISOString();
  const result = spawnSync(command, args, { cwd: rootPath, encoding: 'utf8', env: { ...process.env, CHROMIUM_PATH: process.env.CHROMIUM_PATH || '/usr/bin/chromium' } });
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`.trim();
  const exitCode = result.status ?? 1;
  commands.push({ label, command: `${command} ${args.join(' ')}`, startedAt: started, exitCode, outputTail: output.split('\n').slice(-12).join('\n') });
  check(`Command passes: ${label}`, exitCode === 0, `exit ${exitCode}`);
}

const passed = checks.filter((item) => item.pass).length;
const exitCode = checks.every((item) => item.pass) ? 0 : 1;
const timestamp = new Date().toISOString();
const result = {
  version: 'v2',
  timestamp,
  command: 'node verifier/v2/verify.mjs',
  exitCode,
  passed,
  failed: checks.length - passed,
  total: checks.length,
  checks,
  commands,
};
const runsDir = new URL('verifier/runs/', root);
mkdirSync(runsDir, { recursive: true });
const runPath = new URL(`${timestamp.replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')}-v2-acceptance.json`, runsDir);
writeFileSync(runPath, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ ...result, runRecord: new URL(runPath).pathname }, null, 2));
process.exit(exitCode);
