import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const articles = defineCollection({
  loader: glob({ base: './src/content/articles', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    source: z.string().default('Greise'),
    sourceUrl: z.string().url().optional(),
    category: z.enum(['international', 'economie', 'tech', 'culture', 'sport']),
    pubDate: z.coerce.date(),
    summary: z.string(),
    whyItMatters: z.string(),
    image: z.string().default('/images/repere.svg'),
    audioFile: z.string().optional(),
    featured: z.boolean().default(false),
    generatedBy: z.string().optional(),
    kind: z.enum(['actualité', 'repère']).default('actualité'),
  }),
});

export const collections = { articles };
