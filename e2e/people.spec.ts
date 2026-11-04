import { expect, test, type TestInfo } from '@playwright/test';
import { writeFile } from 'node:fs/promises';

async function capture(page: import('@playwright/test').Page, testInfo: TestInfo, name: string, target: import('@playwright/test').Locator) {
  const body = await target.screenshot();
  await writeFile(testInfo.outputPath(name), body);
  await testInfo.attach(name, { body, contentType: 'image/png' });
}

test('People search explains matches and opens sourced project connection paths', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto('/?flat=1&desktop=1#people');
  const people = page.locator('#people');
  await expect(people.getByRole('heading', { name: 'Find a person, not just a project.' })).toBeVisible();
  await expect(people.locator('[data-person]')).toHaveCount(6);
  await expect(people).toContainText('21 of 21 sourced people');

  await people.getByLabel('Search people').fill('Simon drug discovery');
  await expect(people.locator('[data-person]')).toHaveCount(1);
  await expect(people.locator('[data-person="simon-haworth"]')).toContainText('Matched');
  await people.locator('[data-person="simon-haworth"]').click();
  const profile = people.locator('[data-person-profile="simon-haworth"]');
  await expect(profile).toContainText('Life Sciences & AI Co-lead');
  await expect(profile).toContainText('Wild Salmon proposal');
  await expect(profile.getByRole('link', { name: /Offer help organizing the Vancouver Macnab/ })).toHaveAttribute('href', 'https://bc-ai.ca/communities/life-sciences-ai');
  await expect(profile.getByRole('link', { name: /Source/ })).toHaveAttribute('href', 'https://bc-ai.ca/communities/life-sciences-ai');
  await capture(page, testInfo, 'desktop-people.png', people);

  await people.getByRole('button', { name: 'Clear filters' }).click();
  await people.getByLabel('People community').selectOption('AI Film Club');
  await people.getByRole('button', { name: 'Offer help', exact: true }).click();
  await expect(people.locator('[data-person]')).toHaveCount(1);
  await people.locator('[data-person="kevin-friel"]').click();
  await people.getByRole('button', { name: /View BC \+ AI Film Club in the directory/ }).click();
  await expect(page.locator('#directory .org-row')).toHaveCount(1);
  await expect(page.locator('#directory .org-row')).toContainText('BC + AI Film Club');
  expect(errors).toEqual([]);
});

test('phone task navigation, compact filters, and profile selection stay readable without overflow', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/?flat=1');
  const tasks = page.getByRole('navigation', { name: 'Mobile tasks' });
  await tasks.getByRole('link', { name: 'People', exact: true }).click();
  const people = page.locator('#people');
  await expect(people).toBeInViewport({ ratio: 0.05 });
  const filterToggle = people.getByRole('button', { name: /Filters/ });
  await expect(filterToggle).toHaveAttribute('aria-expanded', 'false');
  await filterToggle.click();
  await expect(filterToggle).toHaveAttribute('aria-expanded', 'true');
  await people.getByLabel('People community').selectOption('Ed + AI: Education Meetup');
  await people.getByRole('button', { name: 'Join a project', exact: true }).click();
  await people.getByLabel('Search people').fill('Nessa');
  await expect(people.locator('[data-person]')).toHaveCount(1);
  await people.locator('[data-person="nessa-palmer"]').click();
  const profile = people.locator('[data-person-profile="nessa-palmer"]');
  await expect(profile).toContainText('curriculum designer');
  await expect(profile.getByRole('link', { name: /Join an Ed \+ AI session/ })).toBeVisible();
  await capture(page, testInfo, 'mobile-people.png', people);

  for (const width of [375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(1);
  }
});
