// Rubriques géographiques : une zone précise l'emporte sur « international » quand un média l'a indiquée.
export const REGIONS = ['france', 'europe', 'afrique', 'moyen-orient', 'asie', 'ameriques'];

function majority(values, fallback) {
  const counts = new Map();
  for (const value of values.filter(Boolean)) counts.set(value, (counts.get(value) || 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || fallback;
}

export function pickCategory(categories, fallback = 'international') {
  const regional = categories.filter((category) => REGIONS.includes(category));
  if (regional.length) return majority(regional, fallback);
  return majority(categories, fallback);
}
