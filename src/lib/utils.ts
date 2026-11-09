export const categories = [
  { slug: 'international', label: 'International', short: 'Le monde en perspective' },
  { slug: 'economie', label: 'Économie', short: 'Les forces qui façonnent les échanges' },
  { slug: 'tech', label: 'Tech & Science', short: 'Idées, recherche et usages' },
  { slug: 'culture', label: 'Culture', short: 'Création, récits et patrimoine' },
  { slug: 'sport', label: 'Sport', short: 'Jeux, performances et société' },
] as const;

export type CategorySlug = (typeof categories)[number]['slug'];

export function categoryLabel(slug: string): string {
  return categories.find((category) => category.slug === slug)?.label ?? 'Actualité';
}

export function pathFor(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${base}${clean === '/' ? '/' : clean}`;
}

export function readingTime(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}
