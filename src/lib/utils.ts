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

/**
 * Isole un mot du titre pour le mettre en italique (effet éditorial de la une).
 * Choisit le mot le plus long (6 lettres ou plus), hors premier mot.
 */
export function emphasizeParts(title: string): { before: string; word: string; after: string } {
  const words = title.trim().split(/\s+/);
  let index = -1;
  let longest = 0;
  words.forEach((token, i) => {
    const core = token.replace(/[^\p{L}\p{N}]/gu, '');
    if (i > 0 && core.length >= 6 && core.length > longest) { longest = core.length; index = i; }
  });
  if (index < 0) return { before: title, word: '', after: '' };
  const match = words[index].match(/^([^\p{L}\p{N}]*)(.*?)([^\p{L}\p{N}]*)$/u);
  const [, lead = '', core = words[index], trail = ''] = match || [];
  const before = `${words.slice(0, index).join(' ')} ${lead}`;
  const rest = words.slice(index + 1).join(' ');
  return { before, word: core, after: `${trail}${rest ? ` ${rest}` : ''}` };
}

export function readingTime(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}
