// Captures d'écran du site construit (mobile et ordinateur), pour contrôler la mise en page.
import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const base = process.env.BASE_URL || 'http://localhost:4321/greise';
const out = process.env.OUT_DIR || 'screens';
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch();
const shots = [
  ['home-mobile', '/', { width: 390, height: 844 }, true],
  ['home-desktop', '/', { width: 1280, height: 900 }, true],
  ['home-sunset-mobile', '/?theme=sunset', { width: 390, height: 844 }, true],
  ['article-mobile', null, { width: 390, height: 844 }, true],
];
for (const [name, route, viewport, full] of shots) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1, isMobile: viewport.width < 600 });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log('ERREUR page', name, e.message));
  await page.route(/supabase\.co|fonts\.g|cdn\.jsdelivr/, (r) => r.abort());
  let url = base + (route || '/');
  if (!route) {
    await page.goto(base + '/', { waitUntil: 'load' });
    const href = await page.evaluate(() => document.querySelector('a[href*="/article/"]')?.getAttribute('href'));
    url = new URL(href, base + '/').toString();
  }
  await page.goto(url.replace('?theme=sunset', ''), { waitUntil: 'load' });
  if (url.includes('theme=sunset')) await page.evaluate(() => { document.documentElement.dataset.theme = 'sunset'; });
  await page.waitForTimeout(600);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  console.log(name, 'débordement horizontal (px):', overflow);
  await page.screenshot({ path: `${out}/${name}.png`, fullPage: full });
  await ctx.close();
}
await browser.close();
