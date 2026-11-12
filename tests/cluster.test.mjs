import test from 'node:test';
import assert from 'node:assert/strict';
import { clusterArticles, dedupeByOutlet } from '../scripts/lib/cluster.mjs';

const t = (h) => new Date(Date.UTC(2026, 10, 11, h)).toISOString();
const a = (title, rawDescription, h, source = 'X') => ({ title, rawDescription, pubDate: t(h), source });

const fixtures = [
  // 0-2 : même événement, trois médias, formulations différentes
  a('Guinée : le président sortant revendique la victoire à la présidentielle', 'Le chef de l’État sortant a proclamé sa victoire dimanche soir, alors que l’opposition conteste le scrutin.', 6, 'France 24'),
  a('Présidentielle en Guinée, le chef de l’État sortant se proclame vainqueur', 'L’opposition guinéenne dénonce des irrégularités dans le scrutin présidentiel organisé dimanche.', 7, 'RFI'),
  a('En Guinée, le président sortant revendique sa réélection malgré les contestations', 'Le scrutin présidentiel de dimanche est contesté par l’opposition qui parle de fraudes.', 9, 'Le Monde'),
  // 3-4 : autre événement économique
  a('La Banque centrale européenne maintient ses taux directeurs inchangés', 'La BCE laisse ses taux inchangés face à une inflation qui reste proche de 2 %.', 8, 'La Tribune'),
  a('BCE : les taux directeurs restent inchangés, l’inflation proche de la cible', 'Christine Lagarde justifie le maintien des taux par une inflation proche de 2 %.', 8, 'Franceinfo'),
  // 5 : sujet isolé partageant des mots génériques (président, France)
  a('Le président de la Fédération française de football annonce sa candidature', 'Le dirigeant se présente à sa propre succession lors de l’assemblée générale.', 8, 'L’Équipe'),
  // 6 : même sujet que 0-2 mais trois jours plus tard (hors fenêtre)
  a('Guinée : la Cour suprême valide la victoire du président sortant', 'La Cour suprême a validé les résultats de la présidentielle guinéenne.', 90, 'RFI'),
  // 7 : tech, rien à voir
  a('Un nouveau télescope spatial livre ses premières images de galaxies lointaines', 'Les premières images du télescope montrent des galaxies formées peu après le Big Bang.', 10, 'Futura'),
];

test('regroupe les articles de médias différents sur le même événement', () => {
  const groups = clusterArticles(fixtures).map((g) => g.join(','));
  assert.ok(groups.includes('0,1,2'), `attendu 0,1,2 dans ${JSON.stringify(groups)}`);
  assert.ok(groups.includes('3,4'), `attendu 3,4 dans ${JSON.stringify(groups)}`);
});

test('ne fusionne pas des sujets sans rapport malgré des mots communs', () => {
  const groups = clusterArticles(fixtures);
  const of = (i) => groups.find((g) => g.includes(i));
  assert.deepEqual(of(5), [5]);
  assert.deepEqual(of(7), [7]);
});

test('respecte la fenêtre de temps (même sujet à trois jours d’écart)', () => {
  const groups = clusterArticles(fixtures);
  assert.deepEqual(groups.find((g) => g.includes(6)), [6]);
});

test('plafonne la taille d’un regroupement', () => {
  const many = Array.from({ length: 12 }, (_, i) => a('Séisme de magnitude 6 au large du Japon, alerte au tsunami', 'Une alerte au tsunami a été levée après le séisme au large du Japon.', 5 + (i % 3), `M${i}`));
  const groups = clusterArticles(many, { maxSize: 8 });
  assert.ok(groups.every((g) => g.length <= 8));
});

test('un média ne compte qu’une fois (dédoublonnage par média)', () => {
  const refs = [
    { name: 'Franceinfo', url: 'https://a/1', pubDate: t(9) },
    { name: 'RFI', url: 'https://b/1', pubDate: t(8) },
    { name: 'franceinfo', url: 'https://a/0', pubDate: t(7) },
  ];
  const out = dedupeByOutlet(refs);
  assert.equal(out.length, 2);
  assert.equal(out[0].url, 'https://a/0');
});

test('distingue deux séismes différents le même jour', () => {
  const items = [
    a('Séisme de magnitude 6,4 au large du Japon, alerte au tsunami levée', 'Un séisme a frappé la côte est du Japon.', 5, 'A'),
    a('Séisme de magnitude 6,1 au Chili : plusieurs blessés à Valparaiso', 'Un séisme a frappé la côte du Chili.', 6, 'B'),
    a('Japon : un séisme de 6,4 déclenche une alerte au tsunami', 'Alerte au tsunami après un séisme sur la côte est.', 6, 'C'),
  ];
  const groups = clusterArticles(items).map((g) => g.join(','));
  assert.ok(groups.includes('0,2'));
  assert.ok(groups.includes('1'));
});
