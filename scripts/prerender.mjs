/**
 * Static prerender for public routes.
 *
 * A Vite SPA ships an empty <div id="root"></div>, so crawlers and AI
 * assistants that don't run JavaScript see no content. This script renders each
 * PUBLIC route in a real browser (after `vite build`) and writes the fully
 * rendered HTML into dist/<route>/index.html. Vercel then serves that static,
 * content-rich HTML to crawlers; real users still get the SPA, which re-renders
 * on load.
 *
 * The authenticated app (/app) and admin console (/admin) are NEVER prerendered
 * — they stay behind auth and out of every index.
 *
 * Fail-soft by design: any error (no browser installed, preview won't boot)
 * logs a warning and exits 0, so the normal SPA build still ships.
 */

import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const PORT = 4183;
const BASE = `http://localhost:${PORT}`;

// Public, crawlable routes only. No /app, /admin, or transient verify flows.
const ROUTES = [
  '/',
  '/about',
  '/how-it-works',
  '/use-cases',
  '/business',
  '/resources',
  '/blog',
  '/help',
  '/faqs',
  '/report-concern',
  '/contact',
  '/terms',
  '/privacy',
  '/verification-policy',
  '/compliance',
  '/feedback',
  '/login',
  '/register',
  '/register-business',
  '/register-customer',
];

function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tick = async () => {
      try {
        const res = await fetch(url);
        if (res.ok) return resolve(true);
      } catch {
        /* not up yet */
      }
      if (Date.now() - start > timeoutMs) return reject(new Error('preview server timeout'));
      setTimeout(tick, 400);
    };
    tick();
  });
}

async function main() {
  if (!existsSync(DIST)) {
    console.warn('[prerender] dist/ not found — run `vite build` first. Skipping.');
    return;
  }

  // Serve the built app with SPA fallback so unrendered routes still resolve.
  const preview = spawn(
    'npx',
    ['vite', 'preview', '--port', String(PORT), '--strictPort'],
    { cwd: ROOT, stdio: 'ignore' },
  );

  let browser;
  try {
    await waitForServer(BASE);
    browser = await chromium.launch();
    const page = await browser.newPage();

    let ok = 0;
    for (const route of ROUTES) {
      try {
        await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 20000 });
        // Wait until React has painted real content into #root — and NOT the
        // lazy-route preloader (login/register are code-split, so the Suspense
        // fallback shows first; we must capture the page behind it).
        await page.waitForFunction(
          () => {
            const root = document.getElementById('root');
            const text = document.body.innerText.trim();
            return (
              root &&
              root.children.length > 0 &&
              text.length > 50 &&
              !text.includes('Preparing your secure experience')
            );
          },
          { timeout: 12000 },
        );
        const html = '<!doctype html>\n' + (await page.content());
        const outPath =
          route === '/' ? join(DIST, 'index.html') : join(DIST, route, 'index.html');
        mkdirSync(dirname(outPath), { recursive: true });
        writeFileSync(outPath, html, 'utf8');
        ok += 1;
        console.log(`[prerender] ${route} -> ${outPath.replace(ROOT + '/', '')}`);
      } catch (err) {
        console.warn(`[prerender] skipped ${route}: ${err.message}`);
      }
    }
    console.log(`[prerender] done — ${ok}/${ROUTES.length} routes prerendered.`);
  } catch (err) {
    console.warn(`[prerender] disabled this build: ${err.message}`);
  } finally {
    if (browser) await browser.close().catch(() => {});
    preview.kill('SIGTERM');
  }
}

main()
  .catch((err) => console.warn(`[prerender] unexpected: ${err.message}`))
  .finally(() => process.exit(0));
