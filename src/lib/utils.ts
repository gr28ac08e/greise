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

export interface SourceRef { name: string; url: string; title?: string; pubDate?: Date; excerpt?: string }
interface StoryLike { kind?: string; source?: string; sourceUrl?: string; sources?: SourceRef[]; title?: string; pubDate?: Date }

/** Sources d'un sujet. Les anciens fichiers (une seule source) restent lisibles. */
export function storySources(data: StoryLike): SourceRef[] {
  if (data.sources && data.sources.length) return [...data.sources].sort((a, b) => (a.pubDate?.valueOf() ?? 0) - (b.pubDate?.valueOf() ?? 0));
  if (data.sourceUrl) return [{ name: data.source || 'Source', url: data.sourceUrl, title: data.title, pubDate: data.pubDate }];
  return [];
}

export function outletCount(data: StoryLike): number {
  return new Set(storySources(data).map((ref) => ref.name.trim().toLocaleLowerCase('fr'))).size;
}

/** Libellé court de recoupement : « Recoupé par 3 médias », « Source unique », « Dossier Greise ». */
export function coverageLabel(data: StoryLike): string {
  if (data.kind === 'repère') return 'Dossier Greise';
  const count = outletCount(data);
  if (count > 1) return `Recoupé par ${count} médias`;
  return 'Source unique';
}

/** « France 24, RFI et Le Monde » */
export function outletNames(data: StoryLike, max = 4): string {
  const names = [...new Set(storySources(data).map((ref) => ref.name))];
  const shown = names.slice(0, max);
  const rest = names.length - shown.length;
  const joined = shown.length > 1 ? `${shown.slice(0, -1).join(', ')} et ${shown[shown.length - 1]}` : shown[0] || '';
  return rest > 0 ? `${shown.join(', ')} et ${rest} autre${rest > 1 ? 's' : ''}` : joined;
}

export const SITE_NAME = 'Greise';
