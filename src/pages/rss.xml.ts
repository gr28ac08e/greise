import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { buildRss } from '../lib/feed';
import { pathFor } from '../lib/utils';

export async function GET({ site }: APIContext) {
  const [editorial, rss] = await Promise.all([getCollection('articles'), getCollection('rssArticles')]);
  const abs = (path: string) => new URL(pathFor(path), site).toString();
  const body = buildRss({
    title: "Greise : l'actualité recoupée",
    description: "L'actualité du monde, rapprochée de plusieurs médias, avec un lien vers chaque source.",
    link: abs('/'),
    selfUrl: abs('/rss.xml'),
    abs,
    entries: [...editorial, ...rss],
  });
  return new Response(body, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
