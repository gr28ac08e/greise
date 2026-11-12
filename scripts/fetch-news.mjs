import Parser from 'rss-parser';
import fs from 'node:fs/promises';
import path from 'node:path';
import { sources } from './sources.config.mjs';
import { stripHtml, cleanCopy, cleanTitle, validUrl } from './lib/text.mjs';

const SITE_URL = process.env.SITE_URL || 'https://gr28ac08e.github.io/greise';

const parser = new Parser({
  timeout: 15_000,
  headers: { 'User-Agent': `Greise/1.0 (+${SITE_URL}; agrégateur avec liens vers les sources)` },
  customFields: {
    item: [
      ['media:content', 'mediaContent', { keepArray: true }],
      ['media:thumbnail', 'mediaThumbnail', { keepArray: true }],
      ['content:encoded', 'encodedContent'],
    ],
  },
});
const cacheDir = path.join(process.cwd(), 'scripts/.cache');
const output = path.join(cacheDir, 'raw-articles.json');

function secureImageUrl(value, allowUnknownExtension = false) {
  const safe = validUrl(value);
  if (!safe || !safe.startsWith('https://')) return '';
  const pathName = new URL(safe).pathname;
  const knownImage = /\.(?:avif|gif|jpe?g|png|webp)$/i.test(pathName);
  return knownImage || allowUnknownExtension ? safe : '';
}

function fieldDetails(value) {
  const first = Array.isArray(value) ? value[0] : value;
  if (typeof first === 'string') return { url: first, type: '', medium: '' };
  const attrs = first?.$ || first || {};
  return {
    url: attrs.url || attrs.href || '',
    type: String(attrs.type || '').toLowerCase(),
    medium: String(attrs.medium || '').toLowerCase(),
  };
}

function imageFromField(value, mode = 'media') {
  const field = fieldDetails(value);
  if (!field.url) return '';
  if (field.type && !field.type.startsWith('image/')) return '';
  if (field.medium && field.medium !== 'image') return '';
  return secureImageUrl(field.url, mode === 'thumbnail' || field.type.startsWith('image/') || field.medium === 'image');
}

function imageFromMarkup(value = '') {
  const markup = String(value)
    .replace(/&amp;/gi, '&').replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'");
  const match = markup.match(/<(?:img|source)\b[^>]*\b(?:src|data-src)=['"]([^'"]+)['"]/i);
  return match ? secureImageUrl(match[1], true) : '';
}

function imageFromItem(item) {
  const enclosure = imageFromField(item.enclosure, 'enclosure');
  if (enclosure) return enclosure;
  const mediaContent = imageFromField(item.mediaContent || item['media:content'], 'media');
  if (mediaContent) return mediaContent;
  const thumbnail = imageFromField(item.mediaThumbnail || item['media:thumbnail'], 'thumbnail');
  if (thumbnail) return thumbnail;
  return imageFromMarkup(item.encodedContent || item['content:encoded'] || item.content || item.summary || item.description || '');
}

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
        const imageUrl = imageFromItem(item);
        sourceArticles.push({ title, link, source: source.name, outlet: source.outlet || source.name, category: source.category, pubDate: pubDate.toISOString(), rawDescription: description, guid: String(item.guid || link), ...(imageUrl ? { imageUrl } : {}) });
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
