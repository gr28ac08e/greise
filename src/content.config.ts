import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { noDashesText, noDashesTitle } from './lib/dashes';

const title = z.string().transform(noDashesTitle);
const text = z.string().transform(noDashesText);

const sourceRef = z.object({
  name: text,
  url: z.string().url(),
  title,
  pubDate: z.coerce.date(),
  excerpt: text.optional(),
});

const articleSchema = z.object({
  title,
  source: text.default('Greise'),
  sourceUrl: z.string().url().optional(),
  category: z.enum(['france', 'international', 'europe', 'afrique', 'moyen-orient', 'asie', 'ameriques', 'economie', 'tech', 'culture', 'livres', 'sport']),
  pubDate: z.coerce.date(),
  summary: text,
  whyItMatters: text.default(''),
  updatedDate: z.coerce.date().optional(),
  // Médias dont les articles ont été recoupés pour ce sujet (un lien par média).
  sources: z.array(sourceRef).default([]),
  imageCredit: text.optional(),
  image: z.string().default('/images/repere.svg'),
  imageUrl: z.string().url().optional(),
  audioFile: z.string().optional(),
  featured: z.boolean().default(false),
  generatedBy: z.string().optional(),
  kind: z.enum(['actualité', 'repère']).default('actualité'),
});

const articles = defineCollection({
  loader: glob({ base: './src/content/articles', pattern: '**/*.md' }),
  schema: articleSchema,
});
const rssArticles = defineCollection({
  loader: glob({ base: './src/content/rss', pattern: '**/*.md' }),
  schema: articleSchema,
});

export const collections = { articles, rssArticles };
