import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { buildRss } from '../../lib/feed';
import { categories, pathFor } from '../../lib/utils';

export function getStaticPaths() {
  return categories.map((category) => ({ params: { category: category.slug }, props: { label: category.label, short: category.short } }));
}

export async function GET({ site, params, props }: APIContext) {
  const slug = String(params.category);
  const [editorial, rss] = await Promise.all([getCollection('articles'), getCollection('rssArticles')]);
  const abs = (path: string) => new URL(pathFor(path), site).toString();
  const body = buildRss({
    title: `Greise | ${props.label}`,
    description: `${props.short}. L'actualité ${String(props.label).toLowerCase()} recoupée par Greise, avec les liens vers les sources.`,
    link: abs(`/categorie/${slug}/`),
    selfUrl: abs(`/rss/${slug}.xml`),
    abs,
    entries: [...editorial, ...rss].filter((entry) => inCategory(entry.data.category, slug)),
  });
  return new Response(body, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
