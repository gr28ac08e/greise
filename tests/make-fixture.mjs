// Écrit une collecte factice (dates relatives à maintenant) pour tester la chaîne complète en CI :
// recoupement -> fichiers Markdown -> build Astro -> pages et flux RSS.
import fs from 'node:fs/promises';

const ago = (hours) => new Date(Date.now() - hours * 3600_000).toISOString();
const item = (outlet, category, title, rawDescription, hours, extra = {}) => ({
  title, rawDescription, category, outlet, source: outlet, pubDate: ago(hours), guid: `${outlet}:${title}`,
  link: `https://${outlet.toLowerCase().replace(/[^a-z]/g, '')}.example/${encodeURIComponent(title).slice(0, 40)}`, ...extra,
});

const articles = [
  item('France 24', 'international', 'Guinée \u2014 le président sortant revendique la victoire à la présidentielle', 'Le chef de l’État sortant a proclamé sa victoire dimanche soir &#8211; alors que l’opposition conteste le scrutin.', 6, { imageUrl: 'https://images.example/guinee.jpg' }),
  item('RFI', 'international', 'Présidentielle en Guinée, le chef de l’État sortant se proclame vainqueur', 'L’opposition guinéenne dénonce &#x2014; des irrégularités dans le scrutin présidentiel organisé dimanche.', 5),
  item('Le Monde', 'international', 'En Guinée, le président sortant revendique sa réélection malgré les contestations', 'Le scrutin présidentiel de dimanche est contesté &mdash; par l’opposition qui parle de fraudes.', 3),
  item('La Tribune', 'economie', 'La Banque centrale européenne maintient ses taux directeurs inchangés', 'La BCE laisse ses taux inchangés face à une inflation qui reste proche de 2 %.', 4),
  item('Futura Sciences', 'tech', 'Un nouveau télescope spatial livre ses premières images de galaxies lointaines', 'Les premières images du télescope montrent des galaxies formées peu après le Big Bang.', 8),
];

await fs.mkdir('scripts/.cache', { recursive: true });

// Analyse Greise de test : vérifie le schéma (2 sources), la page et le libellé. Ignorée par git.
await fs.mkdir('src/content/articles', { recursive: true });
await fs.writeFile('src/content/articles/zz-test-analyse.md', `---
title: "Analyse de test sur une élection"
kind: analyse
category: international
pubDate: ${ago(2)}
summary: "Une lecture croisée de deux publications fictives."
whyItMatters: "Ce qui compte pour la suite."
sources:
  - name: "RFI"
    url: "https://rfi.example/un"
    title: "Premier article cité"
  - name: "Le Monde"
    url: "https://lemonde.example/deux"
    title: "Deuxième article cité"
    pubDate: ${ago(3)}
---

Texte de l'analyse de test.
`);
await fs.writeFile('scripts/.cache/raw-articles.json', JSON.stringify(articles, null, 2));
console.log(`✓ ${articles.length} articles factices écrits`);
