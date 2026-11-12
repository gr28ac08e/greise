import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanCopy, cleanTitle, decodeEntities, stripHtml } from '../scripts/lib/text.mjs';

const LONG = /[\u2012-\u2015\u2212\u2E3A\u2E3B\uFE58\uFE63\uFF0D]/;

test('décode les entités numériques, hexadécimales et nommées, même doublement encodées', () => {
  assert.equal(decodeEntities('A&#8211;B &#x2014; C &mdash; D &amp;#8211; E &rsquo;'), 'A\u2013B \u2014 C \u2014 D \u2013 E ’');
  assert.equal(stripHtml('<p>Tom &amp; Jerry&#8217;s &hellip;</p>'), 'Tom & Jerry’s …');
});

test('titres : plus aucun tiret long, séparateur « : »', () => {
  assert.equal(cleanTitle('Guinée \u2014 le président sortant revendique la victoire'), 'Guinée: le président sortant revendique la victoire');
  assert.equal(cleanTitle('Ligue 1 - 12e journée : Paris gagne'), 'Ligue 1: 12e journée: Paris gagne');
  assert.equal(cleanTitle('Match nul &#8211; Paris et Lyon'.replace('&#8211;', '\u2013')), 'Match nul: Paris et Lyon');
});

test('texte : plus aucun tiret long, séparateur virgule, dialogue sans tiret initial', () => {
  const out = cleanCopy('Le chef \u2014 sorti vainqueur \u2013 a parlé.\n\u2014 Bonjour, dit-il.\nSaison 2024\u20132025 \u2212 fin.');
  assert.doesNotMatch(out, LONG);
  assert.match(out, /Saison 2024-2025/);
  assert.match(out, /^Le chef, sorti vainqueur, a parlé\./);
  assert.match(out, /\nBonjour, dit-il\./);
});

test('conserve les traits d’union des mots', () => {
  assert.equal(cleanCopy('Les États-Unis, c’est-à-dire l’Amérique'), 'Les États-Unis, c’est-à-dire l’Amérique');
});
