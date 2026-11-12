// Utilitaires de texte partagés par les scripts de collecte et de génération.

const NAMED_ENTITIES = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ', mdash: '\u2014', ndash: '\u2013', hellip: '…', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', laquo: '«', raquo: '»', eacute: 'é', egrave: 'è', agrave: 'à', ccedil: 'ç', ecirc: 'ê', euro: '€' };

/** Décode les entités HTML (nommées, décimales et hexadécimales), y compris doublement encodées. */
export function decodeEntities(value = '') {
  let text = String(value);
  for (let pass = 0; pass < 2; pass++) {
    text = text
      .replace(/&#(\d{1,7});/g, (match, code) => { const n = Number(code); return n > 0 && n < 0x110000 ? String.fromCodePoint(n) : match; })
      .replace(/&#x([0-9a-f]{1,6});/gi, (match, code) => { const n = parseInt(code, 16); return n > 0 && n < 0x110000 ? String.fromCodePoint(n) : match; })
      .replace(/&([a-z]{2,8});/gi, (match, name) => NAMED_ENTITIES[name.toLowerCase()] ?? match);
  }
  return text;
}

export function stripHtml(value = '') {
  const withoutTags = String(value)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]*>/g, ' ');
  return decodeEntities(withoutTags).replace(/\s+/g, ' ').trim();
}

// Tirets « longs » : cadratin, demi-cadratin, barre horizontale, signe moins, etc.
const LONG_DASH = '\\u2012-\\u2015\\u2212\\u2E3A\\u2E3B\\uFE58\\uFE63\\uFF0D';

/**
 * Supprime tous les tirets longs et les tirets simples entourés d'espaces (qui ressemblent à des tirets longs).
 * Les traits d'union des mots (États-Unis, c'est-à-dire) et des intervalles (2024-2025) sont conservés.
 * `separator` remplace le tiret : « : » dans un titre, « , » dans un texte.
 */
export function normalizeDashes(value = '', separator = ', ') {
  return String(value)
    .replace(/[\u2010\u2011]/g, '-')
    .replace(new RegExp(`^\\s*[${LONG_DASH}]+\\s*`, 'gm'), '')
    .replace(new RegExp(`\\s*[${LONG_DASH}]+\\s+|\\s+[${LONG_DASH}]+\\s*`, 'g'), separator)
    .replace(new RegExp(`[${LONG_DASH}]+`, 'g'), '-')
    .replace(/\s+-\s+/g, separator);
}

/** Texte courant : dashes normalisés, espaces et ponctuation nettoyés (ligne éditoriale du site). */
export function cleanCopy(value = '') {
  return normalizeDashes(decodeEntities(value), ', ')
    .replace(/[ \t]+/g, ' ')
    .replace(/[ \t]+\n[ \t]*/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s+([,;:.!?])/g, '$1')
    .replace(/([,;:.!?]){2,}/g, '$1')
    .trim();
}

export function cleanTitle(value = '') {
  return normalizeDashes(decodeEntities(value), ': ')
    .replace(/\s+([,;:.!?])/g, '$1')
    .replace(/([,;:.!?]){2,}/g, '$1')
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
