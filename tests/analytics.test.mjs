import assert from 'node:assert/strict';
import { before, after, describe, test } from 'node:test';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, extname, sep } from 'node:path';
import { chromium } from 'playwright';

const root = fileURLToPath(new URL('../', import.meta.url));
const consentKey = 'desi-on-stage-analytics-consent';
// Explicit expected IDs catch attribution collapsing onto the first shared URL.
const paidIds = ['amit', 'gurleen', 'vik-10-05', 'vik-10-12', 'vik-10-19',
  'vik-10-26', 'vik-11-02', 'vik-11-09', 'vik-11-16'];
const freeIds = ['ochin-gaanmela', 'arun-qais-gaanmela', 'aikyam-gaanmela', 'arun-lehra-gaanmela'];
const sharedIds = [...paidIds, ...freeIds];
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg' };
let server, browser, origin;

describe('local outbound analytics', () => {
  before(async () => {
    server = createServer(async (req, res) => {
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      const path = resolve(root, pathname === '/' ? 'index.html' : `.${pathname}`);
      if (!path.startsWith(root.endsWith(sep) ? root : `${root}${sep}`)) {
        res.writeHead(403).end();
        return;
      }
      try {
        const body = await readFile(path);
        res.writeHead(200, { 'Content-Type': mime[extname(path)] || 'application/octet-stream' }).end(body);
      } catch {
        res.writeHead(404).end();
      }
    });
    await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', resolve);
    });
    origin = `http://127.0.0.1:${server.address().port}`;
    browser = await chromium.launch();
  });

  after(async () => {
    await browser?.close();
    if (server) await new Promise(resolve => server.close(resolve));
  });

  async function openPage(t, { consent = 'granted', country = 'DE', gpc = false, missingAnalytics = false } = {}) {
    const context = await browser.newContext({ serviceWorkers: 'block', reducedMotion: 'reduce' });
    t.after(() => context.close());
    const externalRequests = [];
    // Installed before any page exists: no provider, Maps, GA, or other external
    // request can leave this browser, including requests from a popup.
    await context.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (url.origin !== origin) {
        externalRequests.push(url.href);
        if (url.hostname === 'www.googletagmanager.com' && url.pathname === '/gtag/js') {
          await route.fulfill({ contentType: 'text/javascript', body: '// Local GA loader stub: dataLayer stays local.' });
        } else await route.abort();
        return;
      }
      if (url.pathname === '/cdn-cgi/trace') {
        await route.fulfill({ contentType: 'text/plain', body: country ? `loc=${country}\n` : 'location unavailable\n' });
      } else if (missingAnalytics && url.pathname === '/analytics.js') {
        await route.fulfill({ contentType: 'text/javascript', body: '// Analytics deliberately unavailable.' });
      } else await route.continue();
    });
    await context.addInitScript(({ consent, consentKey, gpc }) => {
      // Preserve choices on reload so revocation exercises the actual saved-denied path.
      if (!sessionStorage.getItem('regression-initialized')) {
        localStorage.clear();
        if (consent) localStorage.setItem(consentKey, consent);
        sessionStorage.setItem('regression-initialized', 'yes');
      }
      Object.defineProperty(navigator, 'globalPrivacyControl', { value: gpc });
      window.interceptedOutbound = [];
      document.addEventListener('click', event => {
        const anchor = event.target.closest('a[href]');
        if (anchor && new URL(anchor.href).origin !== location.origin) {
          window.interceptedOutbound.push(anchor.href);
          event.preventDefault(); // Leave propagation intact for the real delegated listener.
        }
      }, true);
    }, { consent, consentKey, gpc });
    const page = await context.newPage();
    await page.clock.setFixedTime(new Date('2026-09-30T17:00:00Z'));
    await page.goto(origin);
    await page.locator('#event-list .event').first().waitFor();
    if (!missingAnalytics && !gpc && consent !== 'denied') {
      await page.waitForFunction(() => Boolean(window.dataLayer) || !document.querySelector('#analytics-consent').hidden);
    }
    t.after(() => {
      assert.ok(externalRequests.every(url => new URL(url).hostname === 'www.googletagmanager.com'),
        `Unexpected external fetch was blocked: ${externalRequests.join(', ')}`);
    });
    return { page, externalRequests };
  }

  async function eventsNamed(page, name = 'select_content') {
    return page.evaluate(name => (window.dataLayer || []).filter(entry => entry[0] === 'event' && entry[1] === name)
      .map(entry => entry[2]), name);
  }

  async function clickListing(page, anchor, id, nested = '') {
    assert.equal(await anchor.count(), 1, `Exactly one listing anchor for ${id}`);
    assert.equal(await anchor.getAttribute('data-event-link'), id);
    assert.equal(await anchor.getAttribute('target'), '_blank');
    assert.deepEqual((await anchor.getAttribute('rel')).split(/\s+/).sort(), ['noopener', 'noreferrer']);
    const before = await eventsNamed(page);
    await (nested ? anchor.locator(nested) : anchor).click();
    const after = await eventsNamed(page);
    assert.equal(after.length, before.length + 1, `One select_content for ${id}`);
    // Exact keys also prohibit source, category, query text, or shortlist contents.
    assert.deepEqual(after.at(-1), { content_type: 'event', content_id: id,
      link_type: freeIds.includes(id) ? 'venue_details' : 'tickets' });
  }

  test('each shared-URL event keeps its ID across lineup, details, and shortlist', async t => {
    const { page } = await openPage(t);
    for (const [index, id] of sharedIds.entries()) {
      const row = page.locator(`#event-list [data-event="${id}"]`);
      await clickListing(page, row.locator('a.tickets'), id, ['span', 'svg', 'path'][index % 3]);
      await row.locator('[data-detail]').click();
      await clickListing(page, page.locator('#detail-content a[data-event-link]'), id, 'path');
      await page.getByRole('button', { name: 'Close event details', exact: true }).click();
      await row.locator('[data-save]').click();
    }
    await page.locator('#shortlist-open').click();
    for (const id of sharedIds) {
      await clickListing(page, page.locator(`#shortlist-list a[data-event-link="${id}"]`), id, 'svg');
    }
    assert.equal((await eventsNamed(page)).length, sharedIds.length * 3);
    assert.equal(await page.evaluate(() => window.interceptedOutbound.length), sharedIds.length * 3);
  });

  test('replacement renders retain attribution and ordinary outbound links are ignored', async t => {
    const { page } = await openPage(t);
    await page.locator('#search').fill('Gurleen');
    await page.locator('[data-kind="comedy"]').click();
    await page.locator('#location').selectOption('suburbs');
    await clickListing(page, page.locator('#event-list a[data-event-link="gurleen"]'), 'gurleen', 'span');
    assert.deepEqual(await eventsNamed(page, 'event_filter'), [{ filter_name: 'comedy' }]);
    await page.locator('#event-list [data-save="gurleen"]').click();
    await page.locator('#clear-filters').click();
    await page.locator('#event-list [data-save="vik-11-16"]').click();
    await page.locator('#shortlist-open').click();
    await page.locator('#shortlist-list [data-save="gurleen"]').click();
    assert.equal(await page.locator('#shortlist-list a[data-event-link="gurleen"]').count(), 0);
    await clickListing(page, page.locator('#shortlist-list a[data-event-link="vik-11-16"]'), 'vik-11-16', 'path');
    await page.getByRole('button', { name: 'Close shortlist', exact: true }).click();
    await page.locator('#event-list [data-detail="gurleen"]').click();
    await clickListing(page, page.locator('#detail-content a[data-event-link]'), 'gurleen');
    await page.getByRole('button', { name: 'Close event details', exact: true }).click();
    await page.locator('#event-list [data-detail="aikyam-gaanmela"]').click();
    await clickListing(page, page.locator('#detail-content a[data-event-link]'), 'aikyam-gaanmela');
    const before = await eventsNamed(page);
    await page.locator('#detail-content a').filter({ hasText: 'Directions' }).click();
    await page.getByRole('button', { name: 'Close event details', exact: true }).click();
    await page.locator('#about-open').click();
    await page.getByRole('link', { name: 'how Google uses data', exact: true }).click();
    await page.getByRole('button', { name: 'Close about this guide', exact: true }).click();
    // Reuse a real shared href so a URL-based fallback would falsely attribute it.
    await page.evaluate(() => {
      const href = document.querySelector('#event-list a[data-event-link="gurleen"]').href;
      for (const [id, value] of [['test-untagged', null], ['test-invalid', 'unknown-event'], ['test-empty', '']]) {
        const a = document.createElement('a');
        a.id = id;
        a.className = 'tickets';
        a.href = href;
        a.target = '_blank';
        a.textContent = id;
        if (value !== null) a.dataset.eventLink = value;
        document.body.append(a);
      }
      const a = document.createElement('a');
      a.id = 'ordinary-external';
      a.href = 'https://unrelated.invalid/outbound';
      a.textContent = 'Ordinary external link';
      document.body.append(a);
    });
    for (const id of ['test-untagged', 'test-invalid', 'test-empty', 'ordinary-external']) await page.locator(`#${id}`).click();
    assert.deepEqual(await eventsNamed(page), before);
  });

  test('click attribution follows the existing analytics consent gate', async t => {
    for (const [name, options] of [
      ['analytics API unavailable', { missingAnalytics: true }],
      ['saved denied', { consent: 'denied' }],
      ['Global Privacy Control', { gpc: true }],
      ['EEA before consent', { consent: null, country: 'DE' }],
      ['unknown location before consent', { consent: null, country: null }]
    ]) {
      await t.test(name, async t => {
        const { page, externalRequests } = await openPage(t, options);
        await page.locator('#event-list a[data-event-link="gurleen"] span').click();
        assert.deepEqual(await eventsNamed(page), []);
        assert.equal(externalRequests.length, 0, 'No GA loader without permitted analytics');
        if (options.missingAnalytics) assert.equal(await page.evaluate(() => typeof window.siteAnalytics), 'undefined');
      });
    }
    await t.test('grant permits attribution and revoke disables it after reload', async t => {
      const { page, externalRequests } = await openPage(t, { consent: null, country: 'DE' });
      await page.locator('#analytics-allow').click();
      await clickListing(page, page.locator('#event-list a[data-event-link="gurleen"]'), 'gurleen', 'span');
      assert.equal(externalRequests.length, 1, 'Only the locally stubbed GA loader was requested');
      await page.locator('#privacy-settings').click();
      await Promise.all([page.waitForEvent('load'), page.locator('#analytics-decline').click()]);
      await page.locator('#event-list a[data-event-link="gurleen"]').click();
      assert.deepEqual(await eventsNamed(page), []);
      assert.equal(await page.evaluate(key => localStorage.getItem(key), consentKey), 'denied');
      assert.equal(externalRequests.length, 1, 'Revocation does not reload the GA loader');
    });
  });
});
