import { expect, test, type Locator, type Page, type TestInfo } from '@playwright/test';
import { readFile } from 'node:fs/promises';

function monitorRuntime(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(`Page error: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() !== 'error') return;
    const source = message.location().url;
    // Page errors are captured separately. Resource-console errors are relevant
    // here only when the failing resource is first-party; external map tiles and
    // fonts have their own availability and must not make this gate flaky.
    if (!source || new URL(source).origin === 'http://127.0.0.1:4173') {
      errors.push(`Console error: ${message.text()} (${source || 'no URL'})`);
    }
  });
  page.on('response', (response) => {
    const url = new URL(response.url());
    if (url.origin === 'http://127.0.0.1:4173' && response.status() >= 400) {
      errors.push(`First-party HTTP ${response.status()}: ${url.href}`);
    }
  });
  page.on('requestfailed', (request) => {
    const url = new URL(request.url());
    if (url.origin === 'http://127.0.0.1:4173') {
      errors.push(`First-party request failed: ${url.href} (${request.failure()?.errorText || 'unknown'})`);
    }
  });
  return errors;
}

async function downloadContents(page: Page, trigger: () => Promise<void>): Promise<string> {
  const pending = page.waitForEvent('download');
  await trigger();
  const download = await pending;
  const path = await download.path();
  if (!path) throw new Error(`No local path for ${download.suggestedFilename()}`);
  return readFile(path, 'utf8');
}

async function capture(page: Page, testInfo: TestInfo, name: string, target?: Locator): Promise<void> {
  const path = testInfo.outputPath(name);
  if (target) await target.screenshot({ path });
  else await page.screenshot({ path });
  await testInfo.attach(name, { path, contentType: 'image/png' });
}

test('search, regional planning, pathway tracing, shortlist exports, and persistence work end to end', async ({ page }, testInfo) => {
  const errors = monitorRuntime(page);
  await page.goto('/?flat=1');
  await expect(page.getByRole('heading', { name: 'Start with the need.' })).toBeVisible();
  await capture(page, testInfo, 'desktop-top.png');

  const ask = page.locator('#ask');
  await ask.getByLabel('What are you trying to do?').fill('Who can help me fund an AI prototype?');
  await ask.getByRole('button', { name: 'FIND VERIFIED MATCHES' }).click();
  await expect(ask.getByText('6 matches')).toBeVisible();
  await expect(ask.locator('article')).toHaveCount(6);
  await expect(ask.locator('article').first()).toContainText('Matched');
  await ask.locator('article').first().getByRole('button', { name: '+ Shortlist' }).click();
  await expect(ask.locator('article').first().getByRole('button', { name: 'Saved ✓' })).toHaveAttribute('aria-pressed', 'true');
  await capture(page, testInfo, 'desktop-search.png', ask);

  await ask.getByLabel('What are you trying to do?').fill('zzzzqqqqxxyyzz');
  await ask.getByRole('button', { name: 'FIND VERIFIED MATCHES' }).click();
  await expect(ask.getByRole('heading', { name: 'No verified match.' })).toBeVisible();
  await expect(ask.getByRole('link', { name: 'Contribute a source' })).toBeVisible();
  await ask.getByRole('button', { name: 'Clear' }).click();
  await expect(ask.locator('article')).toHaveCount(0);

  const planner = page.locator('#planner');
  await planner.getByRole('button', { name: 'Build an AI product' }).click();
  await expect(planner.getByRole('heading', { name: 'Find the room, the backing, and the technical evidence.' })).toBeVisible();
  await planner.getByLabel('Region').selectOption('Metro Vancouver');
  await expect(planner.locator('ol li')).toHaveCount(4);
  await planner.locator('article').first().getByRole('button', { name: '+ Shortlist' }).click();

  const planMarkdown = await downloadContents(page, () => planner.getByRole('button', { name: 'Download .md' }).click());
  expect(planMarkdown).toContain('BC AI Compass action plan — Build an AI product');
  expect(planMarkdown).toContain('Region: Metro Vancouver');
  expect(planMarkdown).toContain('Source checked');
  await planner.getByRole('button', { name: 'Copy action plan' }).click();
  await expect(planner.getByText('Plan copied.')).toBeVisible();

  await planner.getByRole('button', { name: /Trace:.*Founder/ }).click();
  await expect(page.locator('#map')).toContainText(/Tracing: .*Founder/i);

  const shortlist = page.locator('#shortlist');
  await expect(shortlist.locator('article')).toHaveCount(2);
  const csv = await downloadContents(page, () => shortlist.getByRole('button', { name: 'Download CSV' }).click());
  expect(csv).toContain('Name,Category,Type,Location,Region,Website,Source,Verified');
  expect(csv.trim().split('\r\n')).toHaveLength(3);
  const markdown = await downloadContents(page, () => shortlist.getByRole('button', { name: 'Download .md' }).click());
  expect(markdown).toContain('# BC AI Compass shortlist');
  expect(markdown).toContain('Source checked');
  await shortlist.getByRole('button', { name: 'Copy Markdown' }).click();
  await expect(shortlist.getByText('Shortlist copied.')).toBeVisible();

  await page.reload();
  await expect(page.locator('#shortlist').locator('article')).toHaveCount(2);
  await expect(page.getByRole('link', { name: 'Open shortlist, 2 saved' })).toBeVisible();
  await page.locator('#shortlist').getByRole('button', { name: 'Clear shortlist' }).click();
  await page.locator('#shortlist').getByRole('button', { name: 'Yes, clear' }).click();
  await expect(page.locator('#shortlist')).toContainText('No organizations saved yet.');
  expect(errors).toEqual([]);
});

test('directory saving, independent playbook drafts, reset, downloads, and theme switching work', async ({ page }) => {
  const errors = monitorRuntime(page);
  await page.goto('/?flat=1');

  const directory = page.locator('#directory');
  await directory.getByLabel('Search organizations').fill('Vancouver AI');
  const addButton = directory.getByRole('button', { name: /Add Vancouver AI.*to shortlist/i }).first();
  await expect(addButton).toBeVisible();
  await addButton.click();
  await expect(directory.getByRole('button', { name: /Remove Vancouver AI.*from shortlist/i }).first()).toHaveAttribute('aria-pressed', 'true');
  await directory.getByRole('button', { name: /Remove Vancouver AI.*from shortlist/i }).first().click();
  await directory.getByLabel('Search organizations').fill('');
  await expect(directory.locator('.org-row')).toHaveCount(136);

  const playbooks = page.locator('#playbooks');
  const editor = playbooks.getByLabel(/Editable Markdown/);
  const original = await editor.inputValue();
  await editor.fill('# Practical test draft\n\nRetained draft marker.');
  await playbooks.getByRole('button', { name: /Pilot evaluation scorecard/ }).click();
  await expect(editor).not.toHaveValue('# Practical test draft\n\nRetained draft marker.');
  await playbooks.getByRole('button', { name: /AI use-case brief/ }).click();
  await expect(editor).toHaveValue('# Practical test draft\n\nRetained draft marker.');
  const draft = await downloadContents(page, () => playbooks.getByRole('button', { name: 'Download .md' }).click());
  expect(draft).toContain('Retained draft marker.');
  await playbooks.getByRole('button', { name: 'Reset original' }).click();
  await expect(editor).toHaveValue(original);
  await expect(playbooks.getByText('Original template restored.')).toBeVisible();

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  const darkToggle = page.getByRole('button', { name: 'Switch to dark theme' });
  await expect(darkToggle).toBeVisible();
  await darkToggle.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'Switch to light theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  expect(errors).toEqual([]);
});

test('clipboard denial produces a useful fallback instead of a false success', async ({ page }) => {
  const errors = monitorRuntime(page);
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: () => Promise.reject(new Error('Clipboard denied for test')) },
    });
  });
  await page.goto('/?flat=1#playbooks');
  await page.locator('#playbooks').getByRole('button', { name: 'Copy template' }).click();
  await expect(page.locator('#playbooks').getByText('Copy failed. Select the text or download the file.')).toBeVisible();
  expect(errors).toEqual([]);
});

test('375px mobile navigation and primary workflows have no horizontal page overflow', async ({ page }, testInfo) => {
  const errors = monitorRuntime(page);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/?flat=1');
  await capture(page, testInfo, 'mobile-top.png');

  await page.getByRole('button', { name: 'Open menu' }).click();
  await expect(page.locator('#mobile-navigation')).toHaveAttribute('aria-hidden', 'false');
  await page.locator('#mobile-navigation').getByRole('link', { name: /PLAYBOOKS/ }).click();
  await expect(page.locator('#mobile-navigation')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('#playbooks').getByLabel(/Editable Markdown/)).toBeVisible();
  await capture(page, testInfo, 'mobile-playbooks.png', page.locator('#playbooks'));

  await page.locator('#ask').getByRole('button', { name: 'Where can I learn AI outside Vancouver?' }).click();
  await expect(page.locator('#ask article').first()).toBeVisible();
  for (const article of await page.locator('#ask article').all()) {
    await expect(article).not.toContainText('Metro Vancouver');
  }
  await capture(page, testInfo, 'mobile-search.png');

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  expect(errors).toEqual([]);
});
