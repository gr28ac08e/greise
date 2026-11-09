import Parser from 'rss-parser';
import fs from 'node:fs/promises';
import path from 'node:path';
import { sources } from './sources.config.mjs';

const parser = new Parser({ timeout: 15_000, headers: { 'User-Agent': 'Greise/1.0 (+https://gr28ac08e.github.io/greise)' } });
const cacheDir = path.join(process.cwd(), 'scripts/.cache');
const output = path.join(cacheDir, 'raw-articles.json');

function stripHtml(value = '') {
  return String(value)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&').replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<').replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ').trim();
}

function validUrl(value) {
  try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) ? url.href : ''; }
  catch { return ''; }
}

async function main() {
  await fs.mkdir(cacheDir, { recursive: true });
  const articles = [];
  const cutoff = Date.now() - 48 * 60 * 60 * 1000;
  for (const source of sources) {
    try {
      const feed = await parser.parseURL(source.url);
      for (const item of (feed.items || []).slice(0, 12)) {
        const title = item.title?.trim();
        const link = validUrl(item.link || item.guid || '');
        if (!title || !link) continue;
        const dateValue = item.isoDate || item.pubDate;
        const pubDate = dateValue ? new Date(dateValue) : new Date();
        if (Number.isNaN(pubDate.valueOf()) || pubDate.valueOf() < cutoff) continue;
        const description = stripHtml(item.contentSnippet || item.summary || item.content || item['content:encoded'] || '').slice(0, 1200);
        articles.push({ title, link, source: source.name, category: source.category, pubDate: pubDate.toISOString(), rawDescription: description, guid: String(item.guid || link) });
      }
      console.log(`[ok] ${source.name}`);
    } catch (error) {
      console.warn(`[skip] ${source.name}: ${error.message}`);
    }
  }
  const seen = new Set();
  const unique = articles
    .sort((a, b) => b.pubDate.localeCompare(a.pubDate))
    .filter((article) => {
      const key = article.title.toLocaleLowerCase('fr').normalize('NFD').replace(/[\u0300-\u036f]/g, '').slice(0, 72);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  await fs.writeFile(output, JSON.stringify(unique, null, 2));
  console.log(`✓ ${unique.length} articles RSS récents collectés`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
