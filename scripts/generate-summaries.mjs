// Construit les « sujets » Greise : regroupe les articles de médias différents qui traitent du même
// événement (recoupement), conserve le lien vers chaque source et écrit un fichier Markdown par sujet.
//
// Sans clé OpenAI : aucun texte n'est inventé. Le sujet reprend le titre et un court extrait du premier
// média, et la page liste ce que dit chaque source avec son lien. Avec OPENAI_API_KEY : une synthèse
// prudente est rédigée à partir des seuls titres et extraits fournis par les médias.
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { cleanCopy, cleanTitle, shorten, slugify } from './lib/text.mjs';
import { clusterArticles, dedupeByOutlet } from './lib/cluster.mjs';

const ROOT = process.cwd();
const IN = path.join(ROOT, 'scripts/.cache/raw-articles.json');
const CACHE = path.join(ROOT, 'scripts/.cache/generated.json');
const OUT_DIR = path.join(ROOT, 'src/content/rss');
const MAX_STORIES = 40;
const KEEP_HOURS = 72;
const CATEGORY_IMAGE = { international: '/images/international.svg', economie: '/images/economie.svg', tech: '/images/tech.svg', culture: '/images/culture.svg', sport: '/images/sport.svg' };

const openai = process.env.OPENAI_API_KEY ? new (await import('openai')).default({ apiKey: process.env.OPENAI_API_KEY }) : null;
let aiCount = 0;
let plainCount = 0;

const quote = (value) => JSON.stringify(String(value ?? ''));
const asJsonLine = (value) => JSON.stringify(value).replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
const time = (iso) => new Date(iso).valueOf();

// ---------------------------------------------------------------- lecture des sujets existants
function field(frontmatter, name) {
  return frontmatter.match(new RegExp(`^${name}: (.*)$`, 'm'))?.[1]?.trim() || '';
}
function jsonField(frontmatter, name) {
  const raw = field(frontmatter, name);
  if (!raw) return '';
  try { return JSON.parse(raw); } catch { return raw.replace(/^"|"$/g, ''); }
}

function parseStory(markdown, fileName) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return null;
  const fm = match[1];
  const generatedBy = field(fm, 'generatedBy');
  if (generatedBy !== 'rss' && generatedBy !== 'ai') return null; // les dossiers éditoriaux ne sont pas touchés
  const title = jsonField(fm, 'title');
  const pubDate = jsonField(fm, 'pubDate');
  let sources = jsonField(fm, 'sources');
  const hasSources = Array.isArray(sources);
  if (!hasSources) {
    const url = jsonField(fm, 'sourceUrl');
    sources = url ? [{ name: jsonField(fm, 'source') || 'Source', url, title, pubDate, excerpt: shorten(jsonField(fm, 'summary'), 280) }] : [];
  }
  return {
    fileName,
    slug: fileName.replace(/\.md$/, ''),
    title,
    pubDate,
    updatedDate: jsonField(fm, 'updatedDate') || sources.reduce((latest, ref) => (time(ref.pubDate) > time(latest) ? ref.pubDate : latest), pubDate),
    category: field(fm, 'category'),
    imageUrl: jsonField(fm, 'imageUrl') || '',
    imageCredit: jsonField(fm, 'imageCredit') || jsonField(fm, 'source') || '',
    generatedBy,
    sources,
    hasSources,
  };
}

async function loadExisting() {
  const stories = [];
  let names = [];
  try { names = await fs.readdir(OUT_DIR); } catch { return stories; }
  for (const name of names) {
    if (!name.endsWith('.md')) continue;
    const story = parseStory(await fs.readFile(path.join(OUT_DIR, name), 'utf8'), name);
    if (story && story.title && story.sources.length) stories.push(story);
  }
  return stories;
}

// ---------------------------------------------------------------- construction des sujets
const refFromRaw = (article) => ({
  name: article.outlet || article.source,
  url: article.link,
  title: cleanTitle(article.title),
  pubDate: article.pubDate,
  excerpt: shorten(cleanCopy(article.rawDescription || ''), 280),
});

function majority(values, fallback) {
  const counts = new Map();
  values.filter(Boolean).forEach((value) => counts.set(value, (counts.get(value) || 0) + 1));
  let best = fallback;
  let bestCount = 0;
  for (const [value, count] of counts) if (count > bestCount) { best = value; bestCount = count; }
  return best;
}

function plainText(story) {
  const lead = story.sources.find((ref) => ref.excerpt) || null;
  const outlets = story.sources.map((ref) => ref.name);
  return {
    title: story.title,
    summary: lead ? shorten(lead.excerpt, 240) : 'Consultez les sources ci-dessous pour le détail de cette information.',
    whyItMatters: '',
    report: '',
    generatedBy: 'rss',
    outlets,
  };
}

async function aiText(story) {
  const fallback = plainText(story);
  if (!openai) { plainCount++; return fallback; }
  const sourcesBlock = story.sources.map((ref, i) => `Source ${i + 1} : ${ref.name} (${ref.pubDate})\nTitre : ${ref.title}\nExtrait : ${ref.excerpt || '[aucun extrait]'}`).join('\n\n');
  const prompt = `Tu es journaliste francophone pour Greise, un média qui recoupe l’actualité publiée par d’autres médias. À partir UNIQUEMENT des titres et extraits ci-dessous (${story.sources.length} média${story.sources.length > 1 ? 's' : ''}), rédige une synthèse neutre. N’invente aucun fait, chiffre, nom ou citation. Signale les divergences et ce que seul un média rapporte, en le nommant. Si un seul média est cité, dis que l’information n’est pas encore recoupée. Évite les tirets longs.\nRetourne un JSON strict : {"title":"titre neutre et factuel, 100 caractères maximum","summary":"2 à 3 phrases, 70 mots maximum","whyItMatters":"1 à 2 phrases sur ce qui est confirmé par plusieurs médias, ce qui ne l’est pas, et ce qu’il faut suivre","report":"synthèse de 5 à 9 phrases, 200 mots maximum"}\n\n${sourcesBlock}`;
  try {
    const response = await openai.chat.completions.create({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], response_format: { type: 'json_object' }, temperature: 0.2 });
    const content = response.choices?.[0]?.message?.content;
    if (!content) throw new Error('réponse OpenAI vide');
    const parsed = JSON.parse(content);
    aiCount++;
    return {
      title: cleanCopy(parsed.title || fallback.title).slice(0, 140),
      summary: cleanCopy(parsed.summary || fallback.summary),
      whyItMatters: cleanCopy(parsed.whyItMatters || ''),
      report: cleanCopy(parsed.report || ''),
      generatedBy: 'ai',
    };
  } catch (error) {
    plainCount++;
    console.warn(`[repli sans IA] ${story.title}: ${error.message}`);
    return fallback;
  }
}

function toMarkdown(story, text) {
  const lines = [
    '---',
    `title: ${quote(text.title)}`,
    `source: ${quote(story.sources[0].name)}`,
    `sourceUrl: ${quote(story.sources[0].url)}`,
    `category: ${story.category}`,
    `pubDate: ${quote(story.pubDate)}`,
    `updatedDate: ${quote(story.updatedDate)}`,
    `summary: ${quote(cleanCopy(text.summary))}`,
    `whyItMatters: ${quote(cleanCopy(text.whyItMatters || ''))}`,
    `image: ${CATEGORY_IMAGE[story.category] || '/images/repere.svg'}`,
  ];
  if (story.imageUrl) { lines.push(`imageUrl: ${quote(story.imageUrl)}`); lines.push(`imageCredit: ${quote(story.imageCredit)}`); }
  lines.push(`sources: ${asJsonLine(story.sources)}`);
  lines.push(`audioFile: ${quote(`/audio/${story.slug}.mp3`)}`, 'featured: false', `generatedBy: ${text.generatedBy}`, 'kind: actualité', '---', '', `${cleanCopy(text.report || '')}`.trim(), '');
  return lines.join('\n');
}

// ---------------------------------------------------------------- programme principal
async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  let raw = [];
  try { raw = JSON.parse(await fs.readFile(IN, 'utf8')); } catch { console.warn('[info] aucune collecte récente : seuls les sujets existants sont conservés.'); }

  const cutoff = Date.now() - KEEP_HOURS * 3600_000;
  const everyExisting = await loadExisting();
  const existing = [];
  for (const story of everyExisting) {
    if (time(story.updatedDate) < cutoff) await fs.rm(path.join(OUT_DIR, story.fileName), { force: true });
    else existing.push(story);
  }
  const knownLinks = new Set(existing.flatMap((story) => story.sources.map((ref) => ref.url)));
  const fresh = raw.filter((article) => !knownLinks.has(article.link));

  const items = [
    ...existing.map((story) => ({ kind: 'file', story, title: story.title, rawDescription: story.sources.map((ref) => ref.excerpt).join(' '), pubDate: story.pubDate })),
    ...fresh.map((article) => ({ kind: 'raw', article, title: cleanTitle(article.title), rawDescription: cleanCopy(article.rawDescription || ''), pubDate: article.pubDate })),
  ];
  const groups = clusterArticles(items);

  const stories = [];
  for (const group of groups) {
    const members = group.map((index) => items[index]);
    const files = members.filter((member) => member.kind === 'file').map((member) => member.story).sort((a, b) => time(a.pubDate) - time(b.pubDate));
    const raws = members.filter((member) => member.kind === 'raw').map((member) => member.article).sort((a, b) => time(a.pubDate) - time(b.pubDate));

    const byUrl = new Map();
    for (const ref of [...files.flatMap((story) => story.sources), ...raws.map(refFromRaw)]) if (!byUrl.has(ref.url)) byUrl.set(ref.url, ref);
    const sources = dedupeByOutlet([...byUrl.values()]);
    const withImage = [...files.filter((story) => story.imageUrl).map((story) => ({ imageUrl: story.imageUrl, credit: story.imageCredit })), ...raws.filter((article) => article.imageUrl).map((article) => ({ imageUrl: article.imageUrl, credit: article.outlet || article.source }))][0];
    const pubDate = [...files.map((story) => story.pubDate), ...sources.map((ref) => ref.pubDate)].sort((a, b) => time(a) - time(b))[0];
    const updatedDate = sources.map((ref) => ref.pubDate).sort((a, b) => time(b) - time(a))[0] || pubDate;
    const lead = files[0];
    const title = lead?.title || sources[0].title;
    const earliestLink = sources[0].url;
    const slug = lead?.slug || `${slugify(title) || 'sujet'}-${createHash('sha256').update(earliestLink).digest('hex').slice(0, 7)}`;
    const category = majority([...files.map((story) => story.category), ...raws.map((article) => article.category)], lead?.category || raws[0]?.category || 'international');
    stories.push({ slug, title, category, pubDate, updatedDate, sources, imageUrl: withImage?.imageUrl || '', imageCredit: withImage?.credit || '', files, changed: !(files.length === 1 && raws.length === 0 && files[0].hasSources) });
  }

  stories.sort((a, b) => time(b.updatedDate) - time(a.updatedDate));
  const selected = stories.slice(0, MAX_STORIES);
  const keep = new Set(selected.map((story) => `${story.slug}.md`));

  for (const story of selected) {
    if (!story.changed) continue;
    const text = await aiText(story);
    await fs.writeFile(path.join(OUT_DIR, `${story.slug}.md`), toMarkdown(story, text));
    console.log(`✓ ${story.slug} (${new Set(story.sources.map((ref) => ref.name)).size} média${story.sources.length > 1 ? 's' : ''}, ${text.generatedBy})`);
  }

  // Suppression des fichiers fusionnés dans un autre sujet ou sortis du top.
  for (const story of everyExisting) {
    if (!keep.has(story.fileName)) await fs.rm(path.join(OUT_DIR, story.fileName), { force: true });
  }

  const summary = [];
  for (const story of selected) {
    const markdown = await fs.readFile(path.join(OUT_DIR, `${story.slug}.md`), 'utf8');
    summary.push({ slug: story.slug, title: story.title, generatedBy: field(markdown.match(/^---\n([\s\S]*?)\n---/)[1], 'generatedBy') });
  }
  await fs.mkdir(path.dirname(CACHE), { recursive: true });
  await fs.writeFile(CACHE, JSON.stringify(summary, null, 2));
  const corroborated = selected.filter((story) => new Set(story.sources.map((ref) => ref.name)).size > 1).length;
  console.log(`✓ ${selected.length} sujets (${corroborated} recoupés par au moins deux médias) : ${aiCount} synthèses IA, ${plainCount} sans IA`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
