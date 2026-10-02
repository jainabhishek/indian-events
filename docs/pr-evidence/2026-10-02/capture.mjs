import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const repo = fileURLToPath(new URL('../../../', import.meta.url));
if (!process.argv[2]) throw new Error('Pass the absolute path of the baseline snapshot');
const baseline = resolve(process.argv[2]);
const output = resolve(repo, 'output/playwright/near-term-2026-10-02');
await mkdir(output, { recursive: true });
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.webp': 'image/webp', '.svg': 'image/svg+xml' };
const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const [stage, ...parts] = url.pathname.slice(1).split('/');
  const root = stage === 'before' ? baseline : repo;
  const path = resolve(root, parts.join('/') || 'index.html');
  if (!path.startsWith(root + '/')) return res.writeHead(403).end();
  try {
    const body = await readFile(path);
    res.writeHead(200, { 'Content-Type': mime[extname(path)] || 'application/octet-stream' }).end(body);
  } catch { res.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch();
const records = [];
try {
  for (const [device, viewport] of [['desktop', { width: 1440, height: 1000 }],
    ['mobile', { width: 390, height: 844 }]]) {
    for (const stage of ['before', 'after']) {
      const context = await browser.newContext({ viewport, deviceScaleFactor: 1,
        reducedMotion: 'reduce', serviceWorkers: 'block' });
      const external = [], errors = [];
      await context.route('**/*', async route => {
        const url = new URL(route.request().url());
        if (url.origin !== origin) { external.push(url.href); return route.abort(); }
        if (url.pathname.endsWith('/cdn-cgi/trace')) {
          return route.fulfill({ contentType: 'text/plain', body: 'loc=DE\n' });
        }
        return route.continue();
      });
      await context.addInitScript(() => {
        localStorage.setItem('desi-on-stage-analytics-consent', 'denied');
        localStorage.setItem('desi-shortlist', JSON.stringify(['arvind', 'geeta', 'aura']));
        document.addEventListener('click', event => {
          const a = event.target.closest('a[href]');
          if (a && new URL(a.href).origin !== location.origin) event.preventDefault();
        }, true);
      });
      const page = await context.newPage();
      page.on('pageerror', err => errors.push(err.message));
      await page.clock.setFixedTime(new Date('2026-10-02T17:00:00Z'));
      await page.goto(`${origin}/${stage}/`);
      await page.locator('#event-list .event').first().waitFor();
      if (device === 'mobile') await page.locator('#search-toggle').click();
      await page.locator('#search').fill('Garba');
      await page.locator('.listing-updates summary').click();
      await page.locator('body').evaluate(async () => {
        await Promise.all([...document.images].map(img => img.decode().catch(() => {})));
      });
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({ path: resolve(output, `${device}-garba-${stage}.png`), fullPage: true });
      records.push({ device, stage, scenario: 'garba', viewport,
        count: await page.locator('#result-count').innerText(),
        ids: await page.locator('#event-list [data-event]').evaluateAll(rows => rows.map(r => r.dataset.event)),
        horizontalOverflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        overflowElements: await page.evaluate(() => [...document.querySelectorAll('body *')].filter(e => {
          const r = e.getBoundingClientRect(); return r.width && (r.right > innerWidth + 1 || r.left < -1);
        }).map(e => ({ tag: e.tagName, class: e.className, text: e.textContent.slice(0,80),
          rect: e.getBoundingClientRect().toJSON() }))) });
      await page.locator('#search').fill('Sivaangi');
      await page.locator('#event-list [data-detail="aura"]').click();
      await page.screenshot({ path: resolve(output, `${device}-aura-${stage}.png`) });
      records.push({ device, stage, scenario: 'aura', viewport,
        text: await page.locator('#detail-dialog').innerText() });
      await page.getByRole('button', { name: 'Close event details', exact: true }).click();
      await page.locator('#shortlist-open').click();
      await page.screenshot({ path: resolve(output, `${device}-shortlist-${stage}.png`) });
      records.push({ device, stage, scenario: 'shortlist', viewport,
        text: await page.locator('#shortlist-dialog').innerText(),
        dialogScrollHeight: await page.locator('#shortlist-dialog').evaluate(d => d.scrollHeight),
        dialogClientHeight: await page.locator('#shortlist-dialog').evaluate(d => d.clientHeight) });
      if (device === 'mobile') {
        await page.locator('#shortlist-list a[data-event-link="aura"]').scrollIntoViewIfNeeded();
        await page.screenshot({ path: resolve(output, `${device}-shortlist-bottom-${stage}.png`) });
      }
      assert.deepEqual(external, [], 'No external requests during capture');
      assert.deepEqual(errors, [], 'No browser errors during capture');
      await context.close();
    }
  }
  await writeFile(resolve(output, 'capture-results.json'), JSON.stringify(records, null, 2));
  console.log(JSON.stringify({ output, screenshots: 14, externalRequests: 0, browserErrors: 0, records }, null, 2));
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
