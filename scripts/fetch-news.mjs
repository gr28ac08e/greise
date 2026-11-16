import Parser from 'rss-parser';
import fs from 'node:fs/promises';
import path from 'node:path';
import { sources } from './sources.config.mjs';
import { stripHtml, cleanCopy, cleanTitle, validUrl } from './lib/text.mjs';

const SITE_URL = process.env.SITE_URL || 'https://greise-media.github.io';

const parser = new Parser({
  timeout: 15_000,
  headers: { 'User-Agent': `Greise/1.0 (+${SITE_URL}; agrégateur avec liens vers les sources)` },
  customFields: {
    item: [
      ['content:encoded', 'encodedContent'],
    ],
  },
});
const cacheDir = path.join(process.cwd(), 'scripts/.cache');
const output = path.join(cacheDir, 'raw-articles.json');

async function mapConcurrent(items, limit, mapper) {
  const results = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const index = next++;
      if (index >= items.length) return;
      results[index] = await mapper(items[index]);
    }
  }));
  return results;
}

async function main() {
  await fs.mkdir(cacheDir, { recursive: true });
  const cutoff = Date.now() - 48 * 60 * 60 * 1000;
  const batches = await mapConcurrent(sources, 4, async (source) => {
    const sourceArticles = [];
    try {
      const feed = await parser.parseURL(source.url);
      for (const item of (feed.items || []).slice(0, 12)) {
        const title = cleanTitle(item.title || '');
        const link = validUrl(item.link || item.guid || '');
        if (!title || !link) continue;
        const dateValue = item.isoDate || item.pubDate;
        const pubDate = dateValue ? new Date(dateValue) : new Date();
        if (Number.isNaN(pubDate.valueOf()) || pubDate.valueOf() < cutoff) continue;
        const description = cleanCopy(stripHtml(item.contentSnippet || item.summary || item.content || item.encodedContent || item['content:encoded'] || '').slice(0, 1200));
        sourceArticles.push({ title, link, source: source.name, outlet: source.outlet || source.name, category: source.category, pubDate: pubDate.toISOString(), rawDescription: description, guid: String(item.guid || link) });
      }
      console.log(`[ok] ${source.name}`);
    } catch (error) {
      console.warn(`[skip] ${source.name}: ${error.message}`);
    }
    return sourceArticles;
  });

  // Seuls les doublons exacts (même lien) sont écartés : deux médias qui traitent le même sujet
  // doivent rester visibles pour que le recoupement puisse les rapprocher.
  const seenLinks = new Set();
  const unique = batches.flat()
    .sort((a, b) => b.pubDate.localeCompare(a.pubDate))
    .filter((article) => {
      if (seenLinks.has(article.link)) return false;
      seenLinks.add(article.link);
      return true;
    });
  await fs.writeFile(output, JSON.stringify(unique, null, 2));
  console.log(`✓ ${unique.length} articles récents collectés auprès de ${new Set(unique.map((a) => a.outlet)).size} médias`);
}

main().then(() => {
  process.stdout.write('', () => process.exit(0));
}).catch((error) => {
  console.error(error);
  process.stdout.write('', () => process.exit(1));
});
