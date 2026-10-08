import { test } from '@e2e-dev/web';
import { expect } from 'e2e';

test('OSS landing preserves authority and fits the viewport', async ({ app, browser }) => {
  await app.open('/');
  await expect(browser.locator('h1')).toHaveText('Verification infrastructure for AI-assisted software work.');
  await expect(browser.locator('.thesis')).toHaveText('Codex proposes. BOQA verifies.');
  await expect(browser.locator('.invariant')).toBeVisible();
  expect(await browser.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('safe fixture demo is local-only and navigable', async ({ app, browser, screen }) => {
  await app.open('/');
  await screen.getByRole('link', 'Run safe demo').click();
  await expect(browser.locator('#safe-demo')).toBeVisible();
  await expect(browser.locator('.demo-contract')).toBeVisible();
  expect(await browser.evaluate(() => document.querySelector('#safe-demo')?.textContent?.includes('target_asset_network_requests=0') ?? false)).toBe(true);
});

test('degraded status never displays contradictory N/D grid', async ({ app, browser }) => {
  await app.open('/status/');
  await expect(browser.locator('#overall-state')).toHaveText('UNAVAILABLE');
  await expect(browser.locator('#empty-state')).toBeVisible();
  await expect(browser.locator('#status-grid')).toBeHidden();
  await expect(browser.locator('#hunter-view-state')).toHaveText('UNAVAILABLE');
  await expect(browser.locator('#health-view-state')).toHaveText('UNAVAILABLE');
});

test('status navigation reaches the real /status/ path', async ({ app, browser, screen }) => {
  await app.open('/');
  await screen.getByRole('link', 'System status').first().click();
  expect(await browser.evaluate(() => location.pathname)).toBe('/status/');
  await expect(browser.locator('#overall-state')).toHaveText('UNAVAILABLE');
  await expect(browser.locator('#status-grid')).toBeHidden();
});

test('public boundary, security headers, and 360px overflow', async ({ app, browser }) => {
  await app.open('/');
  const boundary = await browser.evaluate(async () => {
    const health = await fetch('/health', { cache: 'no-store' });
    const privateApi = await fetch('/api/private/billing', { cache: 'no-store' });
    const hiddenApi = await fetch('/api/findings', { cache: 'no-store' });
    return {
      health: health.status,
      hsts: health.headers.get('strict-transport-security') || '',
      csp: health.headers.get('content-security-policy') || '',
      privateStatus: privateApi.status,
      privateBody: await privateApi.json(),
      hiddenStatus: hiddenApi.status,
      hiddenBody: await hiddenApi.json(),
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  expect(boundary.health).toBe(200);
  expect(boundary.hsts.includes('max-age=31536000')).toBe(true);
  expect(boundary.csp.includes("default-src 'self'")).toBe(true);
  expect(boundary.privateStatus).toBe(404);
  expect(boundary.privateBody.error).toBe('not_found');
  expect(boundary.hiddenStatus).toBe(404);
  expect(boundary.hiddenBody.error).toBe('not_found');
  expect(boundary.overflow).toBe(false);

  if ((await browser.evaluate(() => innerWidth)) === 390) {
    await browser.setViewport({ width: 360, height: 800 });
    await app.open('/status/');
    await expect(browser.locator('#overall-state')).toHaveText('UNAVAILABLE');
    await expect(browser.locator('#status-grid')).toBeHidden();
    expect(await browser.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  }
});
