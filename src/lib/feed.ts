// Flux RSS 2.0 propre à Greise : permet à d'autres sites, lecteurs RSS et agrégateurs de reprendre
// l'actualité recoupée par Greise. Aucune dépendance : le XML est construit et échappé ici.
import { categoryLabel, coverageLabel, outletCount, outletNames, storySources } from './utils';

export interface FeedEntry {
  id: string;
  body?: string;
  data: {
    title: string;
    summary: string;
    whyItMatters?: string;
    category: string;
    kind?: string;
    pubDate: Date;
    updatedDate?: Date;
    generatedBy?: string;
    source?: string;
    sourceUrl?: string;
    sources?: Array<{ name: string; url: string; title?: string; pubDate?: Date; excerpt?: string }>;
  };
}

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' };
// eslint-disable-next-line no-control-regex
const INVALID_XML = /[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g;

export const escapeXml = (value: unknown): string => String(value ?? '').replace(INVALID_XML, '').replace(/[&<>"']/g, (char) => ESCAPES[char]);
const cdata = (value: string): string => `<![CDATA[${value.replace(INVALID_XML, '').replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;

/** Description courte, sans recopier l'extrait d'un autre média quand le sujet n'a pas été réécrit. */
export function feedDescription(entry: FeedEntry): string {
  const { data } = entry;
  if (data.kind === 'repère' || data.generatedBy === 'ai') return [data.summary, data.whyItMatters].filter(Boolean).join(' ');
  const names = outletNames(data, 6);
  return outletCount(data) > 1
    ? `Sujet recoupé par ${outletCount(data)} médias : ${names}. Greise renvoie vers chaque article.`
    : `Information rapportée par ${names}, pas encore recoupée. Greise renvoie vers l'article d'origine.`;
}

export function feedContent(entry: FeedEntry, url: string): string {
  const { data } = entry;
  const parts = [`<p>${escapeXml(feedDescription(entry))}</p>`];
  const sources = storySources(data);
  if (data.kind !== 'repère' && sources.length) {
    parts.push('<p><strong>Sources :</strong></p><ul>');
    for (const ref of sources) parts.push(`<li><a href="${escapeXml(ref.url)}">${escapeXml(ref.name)} : ${escapeXml(ref.title || data.title)}</a></li>`);
    parts.push('</ul>');
  }
  parts.push(`<p><a href="${escapeXml(url)}">Lire le sujet sur Greise</a></p>`);
  return parts.join('');
}

export interface FeedOptions {
  title: string;
  description: string;
  /** URL absolue de la page que le flux représente. */
  link: string;
  /** URL absolue du flux lui-même. */
  selfUrl: string;
  /** Construit une URL absolue à partir d'un chemin du site (gère le préfixe /greise). */
  abs: (path: string) => string;
  entries: FeedEntry[];
  limit?: number;
  now?: Date;
}

export function buildRss(options: FeedOptions): string {
  const { title, description, link, selfUrl, abs, limit = 50, now = new Date() } = options;
  const latest = (entry: FeedEntry) => (entry.data.updatedDate || entry.data.pubDate).valueOf();
  const entries = [...options.entries].sort((a, b) => latest(b) - latest(a)).slice(0, limit);
  const items = entries.map((entry) => {
    const url = abs(`/article/${entry.id}/`);
    return [
      '    <item>',
      `      <title>${escapeXml(entry.data.title)}</title>`,
      `      <link>${escapeXml(url)}</link>`,
      `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
      `      <pubDate>${entry.data.pubDate.toUTCString()}</pubDate>`,
      `      <dc:creator>Rédaction Greise</dc:creator>`,
      `      <category>${escapeXml(categoryLabel(entry.data.category))}</category>`,
      `      <description>${escapeXml(feedDescription(entry))}</description>`,
      `      <content:encoded>${cdata(feedContent(entry, url))}</content:encoded>`,
      `      <greise:coverage>${escapeXml(coverageLabel(entry.data))}</greise:coverage>`,
      '    </item>',
    ].join('\n');
  });
  const built = entries.length ? new Date(Math.max(...entries.map(latest))) : now;
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:greise="https://gr28ac08e.github.io/greise/ns/1.0">',
    '  <channel>',
    `    <title>${escapeXml(title)}</title>`,
    `    <link>${escapeXml(link)}</link>`,
    `    <description>${escapeXml(description)}</description>`,
    '    <language>fr</language>',
    `    <copyright>${escapeXml(`© ${now.getUTCFullYear()} Greise. Les titres et extraits cités appartiennent à leurs éditeurs.`)}</copyright>`,
    `    <lastBuildDate>${built.toUTCString()}</lastBuildDate>`,
    '    <generator>Greise</generator>',
    '    <ttl>60</ttl>',
    `    <atom:link href="${escapeXml(selfUrl)}" rel="self" type="application/rss+xml" />`,
    '    <image>',
    `      <url>${escapeXml(abs('/avatar.jpg'))}</url>`,
    `      <title>${escapeXml(title)}</title>`,
    `      <link>${escapeXml(link)}</link>`,
    '    </image>',
    ...items,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n');
}
