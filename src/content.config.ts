import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const articleSchema = z.object({
  title: z.string(),
  source: z.string().default('Greise'),
  sourceUrl: z.string().url().optional(),
  category: z.enum(['international', 'economie', 'tech', 'culture', 'sport']),
  pubDate: z.coerce.date(),
  summary: z.string(),
  whyItMatters: z.string(),
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
