import { chromium, expect } from '@playwright/test';
const base = process.env.SMOKE_BASE_URL || 'http://localhost:3100';
const browser = await chromium.launch({ headless: true });
const results = [];
try {
  for (const prefetch of [false, true]) {
    const context = await browser.newContext();
    const page = await context.newPage();
    const errors = [];
    const requests = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => requests.push(request));
    await page.route('**/api/auth/session', route => route.fulfill({ json: { user: { id: 'test', username: 'admin' } } }));
    await page.route('**/api/data/**', async route => {
      const categories = new URL(route.request().url()).pathname === '/api/data/categories';
      if (categories) await new Promise(resolve => setTimeout(resolve, 800));
      await route.fulfill({ json: { data: categories ? [{ id: 'test', title: 'Navigation fixture', slug: 'fixture', subtitle: 'Fixture', description: 'Test category description' }] : [] } });
    });
    await page.goto(base + '/admin');
    await expect(page.locator('h1')).toBeVisible();
    const link = page.locator('aside a[href="/admin/categories"]');
    if (prefetch) {
      const response = page.waitForResponse(response => new URL(response.url()).pathname === '/api/data/categories');
      await link.hover();
      await response;
    }
    const documentRequests = requests.filter(request => request.resourceType() === 'document').length;
    const start = Date.now();
    // Programmatic click isolates click time from Playwright's implicit hover.
    await link.evaluate(element => element.click());
    await expect(page.getByText('Navigation fixture', { exact: true })).toBeVisible();
    results.push({ prefetch, apiDelayMs: 800, clickToDataMs: Date.now() - start });
    expect(requests.filter(request => new URL(request.url()).pathname === '/api/data/categories')).toHaveLength(1);
    expect(requests.filter(request => request.resourceType() === 'document')).toHaveLength(documentRequests);
    const scriptCount = requests.filter(request => request.resourceType() === 'script').length;
    await page.locator('main button').nth(2).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    expect(requests.filter(request => request.resourceType() === 'script').length).toBeGreaterThan(scriptCount);
    expect(errors).toEqual([]);
    await context.close();
  }
  console.log(JSON.stringify({ results, checks: ['one API request per navigation', 'no document reload', 'form chunk loaded only on opening', 'no browser errors'] }, null, 2));
} finally { await browser.close(); }
