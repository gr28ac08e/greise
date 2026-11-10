import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import OpenAI from 'openai';

const IN = path.join(process.cwd(), 'scripts/.cache/raw-articles.json');
const CACHE = path.join(process.cwd(), 'scripts/.cache/generated.json');
const OUT_DIR = path.join(process.cwd(), 'src/content/rss');
const CATEGORY_IMAGE = { international: '/images/international.svg', economie: '/images/economie.svg', tech: '/images/tech.svg', culture: '/images/culture.svg', sport: '/images/sport.svg' };
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
let aiCount = 0;
let fallbackCount = 0;

function slugify(value) {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 66);
}
function quote(value) { return JSON.stringify(String(value ?? '')); }
function cleanCopy(value) {
  return String(value ?? '')
    .replace(/\s+[\u2014\u2013]\s+/g, ', ')
    .replace(/[\u2014\u2013]/g, '-')
    .replace(/[ \t]+/g, ' ')
    .replace(/[ \t]+\n[ \t]*/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s+([,;:.!?])/g, '$1')
    .replace(/([,;:.!?]){2,}/g, '$1')
    .trim();
}
function safeExcerpt(value) { return cleanCopy(value).slice(0, 600); }
function makeFallback(article) {
  const excerpt = safeExcerpt(article.rawDescription);
  return {
    summary: excerpt || `Le flux de ${article.source} signale la publication de cet article. Consultez la source originale pour en connaître les éléments et les mises à jour.`,
    whyItMatters: excerpt ? 'L’extrait donne un premier repère, mais ne restitue pas nécessairement tout le contexte. La source originale permet de vérifier les détails et les évolutions.' : 'Le flux RSS ne fournit pas de résumé détaillé. Le contexte et la portée du sujet doivent être vérifiés dans l’article original.',
    report: excerpt ? `${excerpt}\n\nCe résumé reprend uniquement l’extrait transmis dans le flux RSS de ${article.source}. Il peut omettre des informations importantes. Consultez la source originale pour le contexte complet et les dernières mises à jour.` : `Le flux RSS de ${article.source} fournit le titre de cet article sans extrait détaillé. Ce texte ne prétend pas en résumer le contenu : consultez l’article original pour en connaître les faits, le contexte et les éventuelles mises à jour.`
  };
}
async function summarize(article) {
  const fallback = makeFallback(article);
  if (!openai) { fallbackCount++; return fallback; }
  const prompt = `Tu es journaliste francophone pour Greise. Résume avec prudence uniquement les informations présentes dans le titre et l’extrait fournis. N’invente ni détails, ni citations, ni faits manquants. Si l’extrait est insuffisant, dis-le clairement et renvoie à la source. Rédige en français neutre. Évite les tirets longs et préfère une ponctuation simple.\nRetourne un JSON strict : {"summary":"3 à 5 phrases, 90 mots maximum","whyItMatters":"2 phrases prudentes sur le contexte ou ce qu’il faut vérifier","report":"6 à 10 phrases, 220 mots maximum, ne déduis pas des détails absents"}.\nTitre : ${article.title}\nSource : ${article.source}\nExtrait RSS : ${safeExcerpt(article.rawDescription) || '[aucun extrait fourni]'}\nLien d’origine : ${article.link}`;
  try {
    const response = await openai.chat.completions.create({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], response_format: { type: 'json_object' }, temperature: 0.2 });
    const content = response.choices?.[0]?.message?.content;
    if (!content) throw new Error('réponse OpenAI vide ou au format inattendu');
    const parsed = JSON.parse(content);
    aiCount++;
    return { summary: cleanCopy(parsed.summary || fallback.summary), whyItMatters: cleanCopy(parsed.whyItMatters || fallback.whyItMatters), report: cleanCopy(parsed.report || fallback.report) };
  } catch (error) {
    fallbackCount++;
    console.warn(`[repli RSS] ${article.title}: ${error.message}`);
    return fallback;
  }
}
function normalizeMarkdown(markdown, article = null) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return cleanCopy(markdown);
  let frontmatter = match[1];
  for (const field of ['title', 'summary', 'whyItMatters']) {
    const pattern = new RegExp(`^${field}: ("(?:\\\\.|[^"\\\\])*")$`, 'm');
    frontmatter = frontmatter.replace(pattern, (line, encoded) => {
      try { return `${field}: ${quote(cleanCopy(JSON.parse(encoded)))}`; }
      catch { return line; }
    });
  }
  if (article?.imageUrl) {
    const imageLine = `imageUrl: ${quote(article.imageUrl)}`;
    if (/^imageUrl:/m.test(frontmatter)) frontmatter = frontmatter.replace(/^imageUrl:.*$/m, imageLine);
    else frontmatter = frontmatter.replace(/^(image:.*)$/m, `$1\n${imageLine}`);
  }
  return `---\n${frontmatter}\n---\n\n${cleanCopy(match[2])}\n`;
}
function sourceUrlFromMarkdown(markdown) {
  const value = markdown.match(/^sourceUrl: ("(?:\\\\.|[^"\\\\])*")$/m)?.[1];
  if (!value) return '';
  try { return JSON.parse(value); } catch { return ''; }
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const raw = JSON.parse(await fs.readFile(IN, 'utf8'));
  const byLink = new Map(raw.map((article) => [article.link, article]));
  const generated = [];
  const keep = new Set();
  for (const article of raw.slice(0, 40)) {
    try {
      const hash = createHash('sha256').update(article.link).digest('hex').slice(0, 7);
      const slug = `${slugify(article.title) || 'article'}-${hash}`;
      const fileName = `${slug}.md`;
      const file = path.join(OUT_DIR, fileName);
      keep.add(fileName);
      try {
        const existing = await fs.readFile(file, 'utf8');
        const updated = normalizeMarkdown(existing, article);
        if (updated !== existing) await fs.writeFile(file, updated);
        generated.push({ ...article, slug });
        continue;
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
      const text = await summarize(article);
      const markdown = `---\ntitle: ${quote(article.title)}\nsource: ${quote(article.source)}\nsourceUrl: ${quote(article.link)}\ncategory: ${article.category}\npubDate: ${quote(article.pubDate)}\nsummary: ${quote(cleanCopy(text.summary))}\nwhyItMatters: ${quote(cleanCopy(text.whyItMatters))}\nimage: ${CATEGORY_IMAGE[article.category] || '/images/repere.svg'}\n${article.imageUrl ? `imageUrl: ${quote(article.imageUrl)}\n` : ''}audioFile: ${quote(`/audio/${slug}.mp3`)}\nfeatured: false\ngeneratedBy: rss\nkind: actualité\n---\n\n${cleanCopy(text.report)}\n`;
      await fs.writeFile(file, markdown);
      generated.push({ ...article, slug });
      console.log(`✓ ${slug}`);
    } catch (error) {
      console.warn(`[skip] ${article.title}: ${error.message}`);
    }
  }

  const cutoff = Date.now() - 72 * 60 * 60 * 1000;
  for (const name of await fs.readdir(OUT_DIR)) {
    if (!name.endsWith('.md')) continue;
    const file = path.join(OUT_DIR, name);
    const content = await fs.readFile(file, 'utf8');
    if (!content.startsWith('---\n') || !content.includes('generatedBy: rss')) continue;
    const linkedArticle = byLink.get(sourceUrlFromMarkdown(content));
    const updated = normalizeMarkdown(content, linkedArticle);
    if (updated !== content) await fs.writeFile(file, updated);
    if (keep.has(name)) continue;
    const date = updated.match(/^pubDate:\s*"?([^"\n]+)"?/m)?.[1];
    if (date && new Date(date).valueOf() < cutoff) await fs.rm(file, { force: true });
  }
  await fs.writeFile(CACHE, JSON.stringify(generated, null, 2));
  console.log(`✓ ${generated.length} articles traités : ${aiCount} résumés OpenAI, ${fallbackCount} replis RSS`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
