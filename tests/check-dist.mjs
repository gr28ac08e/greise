// Vérifie le site construit à partir des sujets factices (voir make-fixture.mjs).
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

const dist = 'dist';
const read = (file) => fs.readFile(path.join(dist, file), 'utf8');

const feed = await read('rss.xml');
assert.match(feed, /<rss version="2\.0"/, 'rss.xml doit être un flux RSS 2.0');
assert.match(feed, /<guid isPermaLink="true">https:\/\/[^<]+\/article\/guinee-/, 'le sujet Guinée doit figurer dans le flux');
assert.match(feed, /Recoupé par 3 médias/, 'le flux doit indiquer le recoupement par 3 médias');
assert.match(feed, /<title>Greise : l(&apos;|')actualité recoupée<\/title>/, 'titre du flux attendu');
assert.doesNotMatch(feed, /images\.example/, 'le flux ne doit pas reprendre les photos des médias');

const categoryFeed = await read('rss/economie.xml');
assert.match(categoryFeed, /banque-centrale|Banque centrale/i, 'le flux Économie doit contenir le sujet BCE');
assert.doesNotMatch(categoryFeed, /Guinée/, 'le flux Économie ne doit pas contenir le sujet Guinée');

const articlesDir = await fs.readdir(path.join(dist, 'article'));
const guinee = articlesDir.find((name) => name.startsWith('guinee-'));
assert.ok(guinee, 'une page de sujet Guinée doit exister');
const page = await read(`article/${guinee}/index.html`);
assert.match(page, /Ce que disent les sources/, 'la page doit lister les sources');
assert.match(page, /Recoupé par 3 médias/, 'la page doit afficher le recoupement');
for (const name of ['France 24', 'RFI', 'Le Monde']) assert.ok(page.includes(name), `la page doit citer ${name}`);
assert.match(page, /application\/ld\+json/, 'la page doit contenir le JSON-LD');
assert.match(page, /isBasedOn/, 'le JSON-LD doit citer ses sources');

const home = await read('index.html');
assert.match(home, /Recoupé par 3 médias/, 'l’accueil doit afficher le recoupement');
assert.match(home, /rel="alternate" type="application\/rss\+xml"/, 'l’accueil doit déclarer le flux RSS');
assert.match(await read('flux-rss/index.html'), /rss\.xml/, 'la page Flux RSS doit citer les flux');

console.log('✓ pages, flux RSS et recoupement vérifiés');
