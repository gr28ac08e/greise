// Utilitaires de texte partagés par les scripts de collecte et de génération.

export function stripHtml(value = '') {
  return String(value)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&').replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<').replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ').trim();
}

/** Remplace les tirets longs par une ponctuation simple (ligne éditoriale du site). */
export function cleanCopy(value = '') {
  return String(value)
    .replace(/\s+[—–]\s+/g, ', ')
    .replace(/[—–]/g, '-')
    .replace(/[ \t]+/g, ' ')
    .replace(/[ \t]+\n[ \t]*/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s+([,;:.!?])/g, '$1')
    .replace(/([,;:.!?]){2,}/g, '$1')
    .trim();
}

export function cleanTitle(value = '') {
  return String(value)
    .replace(/\s+[—–]\s+/g, ': ')
    .replace(/[—–]/g, '-')
    .replace(/\s+([,;:.!?])/g, '$1')
    .replace(/\s+/g, ' ').trim();
}

export function slugify(value = '') {
  return String(value).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 66);
}

/** Coupe proprement à la fin d'une phrase (ou d'un mot) sans dépasser `max` caractères. */
export function shorten(value = '', max = 240) {
  const text = cleanCopy(value);
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const sentence = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '));
  if (sentence > max * 0.5) return cut.slice(0, sentence + 1);
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:\s]+$/, '')}…`;
}

export function validUrl(value) {
  try {
    const url = new URL(String(value));
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}
