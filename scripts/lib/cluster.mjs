// Recoupement : regroupe les articles de médias différents qui parlent du même événement.
// Méthode déterministe, sans service externe : similarité cosinus TF-IDF sur le titre et
// l'extrait, pondération des noms propres et des chiffres, liaison moyenne pour éviter
// les chaînes de sujets qui n'ont rien à voir, et fenêtre de temps.

const STOP = new Set(`
alors apres avant avec avoir bien cela celle celui ces cette chez comme contre dans depuis des donc dont elle elles encore entre est
etre eux faire fait font ici ils juste leur leurs lors mais meme moins nous notre nouveau nouvelle nouvelles nouveaux par parce
pas peut plus plusieurs pour pourquoi quand que quel quelle quels quelles qui sans sera ses seront son sont sous sur tout tous
tout toute toutes tres une vers vos votre vous aussi autre autres apres selon afin ainsi face lors etre ete etait seront serait
comment quoi dit disent annonce annonces annoncer apres veut veulent voici video photos direct live infos info
`.split(/\s+/).filter(Boolean));

export function normalizeText(value = '') {
  return String(value).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

function stem(word) {
  let w = word;
  if (w.length > 5 && w.endsWith('aux')) w = `${w.slice(0, -3)}al`;
  else if (w.length > 4 && (w.endsWith('s') || w.endsWith('x'))) w = w.slice(0, -1);
  if (w.length > 6 && w.endsWith('ement')) w = w.slice(0, -5);
  else if (w.length > 6 && w.endsWith('ation')) w = w.slice(0, -5);
  if (w.length > 5 && (w.endsWith('e') || w.endsWith('r'))) w = w.slice(0, -1);
  return w;
}

/** Retourne une Map jeton -> poids. Les noms propres et les nombres comptent double. */
export function weightedTokens(text = '', baseWeight = 1) {
  const result = new Map();
  const words = String(text).split(/[^\p{L}\p{N}'’-]+/u).filter(Boolean);
  words.forEach((raw, index) => {
    const parts = raw.split(/['’-]/).filter(Boolean);
    for (const part of parts) {
      const norm = normalizeText(part);
      if (!norm || STOP.has(norm)) continue;
      const isNumber = /^\d{2,}$/.test(norm);
      if (norm.length < 3 && !isNumber) continue;
      const proper = /^\p{Lu}/u.test(part) && index > 0 && part !== part.toUpperCase();
      const acronym = part.length >= 2 && part === part.toUpperCase() && /\p{L}/u.test(part);
      const weight = baseWeight * (isNumber || proper || acronym ? 2 : 1);
      const token = isNumber ? norm : stem(norm);
      result.set(token, Math.max(result.get(token) || 0, weight));
    }
  });
  return result;
}

function vectorFor(article) {
  const vector = new Map();
  const add = (map) => { for (const [token, weight] of map) vector.set(token, Math.max(vector.get(token) || 0, weight)); };
  add(weightedTokens(article.title, 2));
  add(weightedTokens(String(article.rawDescription || '').slice(0, 320), 1));
  return vector;
}

/**
 * @param {Array<{title:string, rawDescription?:string, pubDate:string}>} articles
 * @returns {number[][]} groupes d'indices dans `articles`
 */
export function clusterArticles(articles, options = {}) {
  const { threshold = 0.34, minSharedRare = 2, maxSize = 8, windowHours = 36, rareRatio = 0.25, averageFactor = 0.7 } = options;
  const n = articles.length;
  const vectors = articles.map(vectorFor);
  const df = new Map();
  vectors.forEach((vector) => { for (const token of vector.keys()) df.set(token, (df.get(token) || 0) + 1); });
  const idf = (token) => Math.log((n + 1) / ((df.get(token) || 0) + 1)) + 1;
  const weighted = vectors.map((vector) => {
    const map = new Map();
    let norm = 0;
    for (const [token, weight] of vector) { const value = weight * idf(token); map.set(token, value); norm += value * value; }
    return { map, norm: Math.sqrt(norm) || 1 };
  });
  // Sur un petit lot, tous les mots sont « fréquents » : on garde un plancher pour ne pas rejeter les vrais doublons.
  const rareLimit = Math.max(6, Math.ceil(n * rareRatio));
  const times = articles.map((article) => new Date(article.pubDate).valueOf());

  const similarity = (i, j) => {
    if (Math.abs(times[i] - times[j]) > windowHours * 3600_000) return 0;
    const [a, b] = weighted[i].map.size <= weighted[j].map.size ? [i, j] : [j, i];
    let dot = 0;
    let sharedRare = 0;
    for (const [token, value] of weighted[a].map) {
      const other = weighted[b].map.get(token);
      if (!other) continue;
      dot += value * other;
      if ((df.get(token) || 0) <= rareLimit) sharedRare++;
    }
    if (sharedRare < minSharedRare) return 0;
    return dot / (weighted[a].norm * weighted[b].norm);
  };

  const sims = new Map();
  const pairs = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const s = similarity(i, j);
      if (s >= threshold) { sims.set(`${i}:${j}`, s); pairs.push([i, j, s]); }
    }
  }
  pairs.sort((x, y) => y[2] - x[2]);

  const groupOf = Array.from({ length: n }, (_, i) => i);
  const members = new Map(Array.from({ length: n }, (_, i) => [i, [i]]));
  const pairSim = (i, j) => (i < j ? sims.get(`${i}:${j}`) : sims.get(`${j}:${i}`)) || 0;
  for (const [i, j] of pairs) {
    const gi = groupOf[i];
    const gj = groupOf[j];
    if (gi === gj) continue;
    const left = members.get(gi);
    const right = members.get(gj);
    if (left.length + right.length > maxSize) continue;
    let total = 0;
    for (const a of left) for (const b of right) total += pairSim(a, b);
    if (total / (left.length * right.length) < threshold * averageFactor) continue;
    for (const k of right) groupOf[k] = gi;
    members.set(gi, [...left, ...right]);
    members.delete(gj);
  }
  return [...members.values()].map((group) => group.sort((a, b) => times[a] - times[b])).sort((a, b) => times[b[0]] - times[a[0]]);
}

/** Garde la première référence de chaque média (la plus ancienne) : un média = une voix. */
export function dedupeByOutlet(refs) {
  const seen = new Set();
  return [...refs]
    .sort((a, b) => new Date(a.pubDate).valueOf() - new Date(b.pubDate).valueOf())
    .filter((ref) => { const key = normalizeText(ref.name); if (seen.has(key)) return false; seen.add(key); return true; });
}
