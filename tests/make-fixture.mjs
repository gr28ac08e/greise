// Écrit une collecte factice (dates relatives à maintenant) pour tester la chaîne complète en CI :
// recoupement -> fichiers Markdown -> build Astro -> pages et flux RSS.
import fs from 'node:fs/promises';

const ago = (hours) => new Date(Date.now() - hours * 3600_000).toISOString();
const item = (outlet, category, title, rawDescription, hours, extra = {}) => ({
  title, rawDescription, category, outlet, source: outlet, pubDate: ago(hours), guid: `${outlet}:${title}`,
  link: `https://${outlet.toLowerCase().replace(/[^a-z]/g, '')}.example/${encodeURIComponent(title).slice(0, 40)}`, ...extra,
});

const articles = [
  item('France 24', 'international', 'Guinée : le président sortant revendique la victoire à la présidentielle', 'Le chef de l’État sortant a proclamé sa victoire dimanche soir, alors que l’opposition conteste le scrutin.', 6, { imageUrl: 'https://images.example/guinee.jpg' }),
  item('RFI', 'international', 'Présidentielle en Guinée, le chef de l’État sortant se proclame vainqueur', 'L’opposition guinéenne dénonce des irrégularités dans le scrutin présidentiel organisé dimanche.', 5),
  item('Le Monde', 'international', 'En Guinée, le président sortant revendique sa réélection malgré les contestations', 'Le scrutin présidentiel de dimanche est contesté par l’opposition qui parle de fraudes.', 3),
  item('La Tribune', 'economie', 'La Banque centrale européenne maintient ses taux directeurs inchangés', 'La BCE laisse ses taux inchangés face à une inflation qui reste proche de 2 %.', 4),
  item('Futura Sciences', 'tech', 'Un nouveau télescope spatial livre ses premières images de galaxies lointaines', 'Les premières images du télescope montrent des galaxies formées peu après le Big Bang.', 8),
];

await fs.mkdir('scripts/.cache', { recursive: true });
await fs.writeFile('scripts/.cache/raw-articles.json', JSON.stringify(articles, null, 2));
console.log(`✓ ${articles.length} articles factices écrits`);
