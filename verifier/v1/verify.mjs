import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const root = new URL('../../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');
const checks = [];
const check = (name, pass, detail = '') => checks.push({ name, pass: Boolean(pass), detail });

const baselineHash = '07c001e1febed219bdb0bb1582f30aa35ef8f8e4931ce73ab2a074856a4aafd6';
const dataHash = createHash('sha256').update(read('src/data/organizations.ts')).digest('hex');
check('Trusted organization dataset unchanged', dataHash === baselineHash, dataHash);

const required = [
  'src/lib/search.ts',
  'src/lib/plan.ts',
  'src/lib/shortlist.ts',
  'src/data/playbooks.ts',
  'src/sections/ActionPlanner.tsx',
  'src/sections/Playbooks.tsx',
  'src/components/Shortlist.tsx',
  'src/tests/search.test.ts',
  'src/tests/plan.test.ts',
  'src/tests/shortlist.test.ts',
];
for (const path of required) check(`Required workflow file: ${path}`, existsSync(new URL(path, root)));

if (existsSync(new URL('src/App.tsx', root))) {
  const app = read('src/App.tsx');
  check('Action planner mounted', app.includes('ActionPlanner'));
  check('Playbooks mounted', app.includes('Playbooks'));
  check('Shortlist mounted', app.includes('Shortlist'));
}
const pkg = JSON.parse(read('package.json'));
check('Test script declared', typeof pkg.scripts?.test === 'string', pkg.scripts?.test ?? 'missing');

for (const command of [
  ['npm', ['run', 'verify:data']],
  ['npm', ['test']],
  ['npm', ['run', 'lint']],
  ['npm', ['run', 'build']],
]) {
  const label = command[1].join(' ');
  try {
    const output = execFileSync(command[0], command[1], {
      cwd: new URL(root).pathname,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    check(`Command passes: ${label}`, true, output.trim().split('\n').slice(-4).join(' | '));
  } catch (error) {
    const output = `${error.stdout ?? ''}${error.stderr ?? ''}`.trim();
    check(`Command passes: ${label}`, false, output.split('\n').slice(-8).join(' | '));
  }
}

const passed = checks.filter((c) => c.pass).length;
const result = { version: 'v1', passed, failed: checks.length - passed, total: checks.length, checks };
console.log(JSON.stringify(result, null, 2));
process.exit(checks.every((c) => c.pass) ? 0 : 1);
