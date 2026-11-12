// Garantie d'affichage : aucun tiret long (cadratin, demi-cadratin, barre horizontale, signe moins)
// ni tiret simple entouré d'espaces n'est affiché sur le site, quelle que soit l'origine du texte
// (anciens fichiers en cache, flux RSS, synthèse IA). Les traits d'union des mots sont conservés.
// Même règle que scripts/lib/text.mjs (normalizeDashes).
const LONG_DASH = '\\u2012-\\u2015\\u2212\\u2E3A\\u2E3B\\uFE58\\uFE63\\uFF0D';

export function normalizeDashes(value: string, separator = ', '): string {
  return String(value ?? '')
    .replace(/[‐‑]/g, '-')
    .replace(new RegExp(`^\\s*[${LONG_DASH}]+\\s*`, 'gm'), '')
    .replace(new RegExp(`\\s*[${LONG_DASH}]+\\s+|\\s+[${LONG_DASH}]+\\s*`, 'g'), separator)
    .replace(new RegExp(`[${LONG_DASH}]+`, 'g'), '-')
    .replace(/\s+-\s+/g, separator)
    .replace(/\s+([,;:.!?])/g, '$1')
    .replace(/([,;:.!?]){2,}/g, '$1')
    .trim();
}

export const noDashesTitle = (value: string) => normalizeDashes(value, ': ');
export const noDashesText = (value: string) => normalizeDashes(value, ', ');
