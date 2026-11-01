import { expect, test, type TestInfo } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';

async function capture(page: import('@playwright/test').Page, testInfo: TestInfo, name: string, target: import('@playwright/test').Locator) {
  const body = await target.screenshot();
  await writeFile(testInfo.outputPath(name), body);
  await testInfo.attach(name, { body, contentType: 'image/png' });
}

test('Public AI resources can be searched, filtered, and connected to verified directory records', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/?flat=1#public-ai');
  const publicAi = page.locator('#public-ai');
  await expect(publicAi.getByRole('heading', { name: 'AI as public infrastructure.' })).toBeVisible();
  await expect(publicAi.locator('[data-public-ai-resource]')).toHaveCount(6);
  await expect(publicAi).toContainText('11 curated resources');
  await capture(page, testInfo, 'mobile-public-ai.png', publicAi);
  await publicAi.getByLabel('Search Public AI resources').fill('preserve government records');
  await expect(publicAi.locator('[data-public-ai-resource]')).toHaveCount(1);
  await expect(publicAi.locator('[data-public-ai-resource="democracys-library"]')).toBeVisible();
  await publicAi.getByRole('button', { name: 'Clear filters' }).click();
  await publicAi.getByRole('button', { name: 'Privacy', exact: true }).click();
  await publicAi.getByLabel('Resource type').selectOption('Library');
  await expect(publicAi.locator('[data-public-ai-resource]')).toHaveCount(1);
  await expect(publicAi.locator('[data-public-ai-resource="internet-archive"]')).toBeVisible();
  await publicAi.locator('details').filter({ hasText: 'Related verified organizations' }).locator('summary').click();
  await publicAi.getByRole('button', { name: /View Digital Democracies Institute in the directory/ }).click();
  await expect(page.locator('#directory .org-row')).toHaveCount(1);
  await expect(page.locator('#directory .org-row')).toContainText('Digital Democracies Institute');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/?flat=1&desktop=1#public-ai');
  await capture(page, testInfo, 'desktop-public-ai.png', page.locator('#public-ai'));
});

test('375px task navigation, compact filters, and comparison cards keep primary work on screen', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.addInitScript(() => { window.localStorage.setItem('bcac-shortlist-v1', JSON.stringify(['bc-ai-ecosystem-association', 'new-ventures-bc'])); });
  await page.goto('/?flat=1');
  const tasks = page.getByRole('navigation', { name: 'Mobile tasks' });
  await expect(tasks).toBeVisible();
  await expect(tasks.getByRole('link', { name: 'Public AI', exact: true })).toBeVisible();
  await tasks.getByRole('link', { name: /Saved/ }).click();
  await expect(page.locator('#shortlist')).toBeInViewport({ ratio: 0.05 });
  const shortlist = page.locator('#shortlist');
  await expect(shortlist.locator('[data-mobile-comparison]')).toHaveCount(2);
  await expect(shortlist.getByRole('table')).toBeHidden();
  await expect(shortlist.locator('[data-mobile-comparison]').first()).toContainText('Source');
  await shortlist.getByLabel('Sort by').selectOption('name');
  const cardNames = await shortlist.locator('[data-mobile-comparison] h3').allTextContents();
  expect(cardNames).toEqual([...cardNames].sort((a, b) => a.localeCompare(b)));
  await capture(page, testInfo, 'mobile-comparison.png', shortlist);
  const directory = page.locator('#directory');
  const filterToggle = directory.getByRole('button', { name: /Filters/ });
  await expect(filterToggle).toHaveAttribute('aria-expanded', 'false');
  await expect(directory.getByRole('button', { name: /^Research & Academia/ })).toBeHidden();
  await filterToggle.click();
  await expect(filterToggle).toHaveAttribute('aria-expanded', 'true');
  await directory.getByRole('button', { name: /^Research & Academia/ }).click();
  await expect(directory.locator('.org-row')).toHaveCount(72);
  await expect(filterToggle).toContainText('1 active');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test('guided contribution validates, reviews, creates a real PR response, and offers an honest fallback', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/?flat=1#contribute');
  const form = page.locator('#contribute');
  await expect(form.getByRole('link', { name: /Open a pull request/ })).toHaveCount(0);
  await expect(form.getByLabel(/email/i)).toHaveCount(0);
  await capture(page, testInfo, 'mobile-contribution-form.png', form);
  await form.getByRole('radio', { name: 'Suggest a Public AI resource' }).check();
  await form.getByLabel('Name', { exact: true }).fill('Community Knowledge Lab');
  await form.getByLabel('Website', { exact: true }).fill('https://example.org/');
  await form.getByLabel('Supporting source URL').fill('https://example.org/open-collection');
  await form.getByLabel('What should reviewers know?').fill('Too short');
  await form.getByRole('button', { name: 'Review submission' }).click();
  await expect(form.getByText(/at least 20 characters/i)).toBeVisible();
  await form.getByLabel('What should reviewers know?').fill('A community-maintained open collection with durable citations and practical learning resources.');
  await form.getByLabel(/I confirm/).check();
  await form.getByRole('button', { name: 'Review submission' }).click();
  await expect(form.getByRole('heading', { name: 'Review before sending.' })).toBeVisible();
  await expect(form).toContainText('Community Knowledge Lab');
  await capture(page, testInfo, 'mobile-contribution-review.png', form);
  await page.route('**/api/contributions', async (route) => {
    await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ pullRequestUrl: 'https://github.com/MartinMontero/BCAICompass/pull/42', number: 42, configured: true }) });
  });
  await form.getByRole('button', { name: 'Create pull request' }).click();
  await expect(form.getByRole('heading', { name: 'Pull request created.' })).toBeVisible();
  await expect(form.getByRole('link', { name: 'View pull request #42' })).toHaveAttribute('href', 'https://github.com/MartinMontero/BCAICompass/pull/42');
  await form.getByRole('button', { name: 'Make another contribution' }).click();
  await form.getByLabel('Name', { exact: true }).fill('Another Public Lab');
  await form.getByLabel('Website', { exact: true }).fill('https://example.com/');
  await form.getByLabel('Supporting source URL').fill('https://example.com/ai');
  await form.getByLabel('B.C. location').fill('Victoria, BC');
  await form.getByLabel('What should reviewers know?').fill('A public lab with a sourced B.C. presence and documented open AI workshops.');
  await form.getByLabel(/I confirm/).check();
  await form.getByRole('button', { name: 'Review submission' }).click();
  await page.unroute('**/api/contributions');
  await page.route('**/api/contributions', async (route) => {
    await route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: 'Pull-request submission is not configured on this server yet.', configured: false, fallback: true }) });
  });
  await form.getByRole('button', { name: 'Create pull request' }).click();
  await expect(form.getByText(/not configured/i)).toBeVisible();
  await expect(form.getByRole('link', { name: /View pull request/ })).toHaveCount(0);
  const pendingDownload = page.waitForEvent('download');
  await form.getByRole('button', { name: 'Download submission' }).click();
  const download = await pendingDownload;
  const path = await download.path();
  if (!path) throw new Error('Missing submission download');
  expect(await readFile(path, 'utf8')).toContain('Another Public Lab');
});
