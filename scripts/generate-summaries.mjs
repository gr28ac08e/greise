import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import OpenAI from 'openai';

const IN = path.join(process.cwd(), 'scripts/.cache/raw-articles.json');
const CACHE = path.join(process.cwd(), 'scripts/.cache/generated.json');
const OUT_DIR = path.join(process.cwd(), 'src/content/articles');
const CATEGORY_IMAGE = { international: '/images/international.svg', economie: '/images/economie.svg', tech: '/images/tech.svg', culture: '/images/culture.svg', sport: '/images/sport.svg' };
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
let aiCount = 0;
let fallbackCount = 0;

function slugify(value) {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 66);
}
function quote(value) { return JSON.stringify(String(value ?? '')); }
function safeExcerpt(value) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, 600);
}
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
  const prompt = `Tu es journaliste francophone pour Greise. Résume avec prudence uniquement les informations présentes dans le titre et l’extrait fournis. N’invente ni détails, ni citations, ni faits manquants. Si l’extrait est insuffisant, dis-le clairement et renvoie à la source. Rédige en français neutre.\nRetourne un JSON strict : {"summary":"3 à 5 phrases, 90 mots maximum","whyItMatters":"2 phrases prudentes sur le contexte ou ce qu’il faut vérifier","report":"6 à 10 phrases, 220 mots maximum, ne déduis pas des détails absents"}.\nTitre : ${article.title}\nSource : ${article.source}\nExtrait RSS : ${safeExcerpt(article.rawDescription) || '[aucun extrait fourni]'}\nLien d’origine : ${article.link}`;
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    });
    const content = response.choices?.[0]?.message?.content;
    if (!content) throw new Error('réponse OpenAI vide ou au format inattendu');
    const parsed = JSON.parse(content);
    aiCount++;
    return { summary: parsed.summary || fallback.summary, whyItMatters: parsed.whyItMatters || fallback.whyItMatters, report: parsed.report || fallback.report };
  } catch (error) {
    fallbackCount++;
    console.warn(`[repli RSS] ${article.title}: ${error.message}`);
    return fallback;
  }
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const raw = JSON.parse(await fs.readFile(IN, 'utf8'));
  const generated = [];
  const keep = new Set();
  for (const article of raw.slice(0, 40)) {
    try {
      const hash = createHash('sha256').update(article.link).digest('hex').slice(0, 7);
      const slug = `${slugify(article.title) || 'article'}-${hash}`;
      const file = path.join(OUT_DIR, `${slug}.md`);
      keep.add(`${slug}.md`);
      try {
        await fs.access(file);
        generated.push({ ...article, slug });
        continue;
      } catch {}
      const text = await summarize(article);
      const markdown = `---\ntitle: ${quote(article.title)}\nsource: ${quote(article.source)}\nsourceUrl: ${quote(article.link)}\ncategory: ${article.category}\npubDate: ${quote(article.pubDate)}\nsummary: ${quote(text.summary)}\nwhyItMatters: ${quote(text.whyItMatters)}\nimage: ${CATEGORY_IMAGE[article.category] || '/images/repere.svg'}\naudioFile: ${quote(`/audio/${slug}.mp3`)}\nfeatured: false\ngeneratedBy: rss\nkind: actualité\n---\n\n${text.report}\n`;
      await fs.writeFile(file, markdown);
      generated.push({ ...article, slug });
      console.log(`✓ ${slug}`);
    } catch (error) {
      console.warn(`[skip] ${article.title}: ${error.message}`);
    }
  }
  const cutoff = Date.now() - 72 * 60 * 60 * 1000;
  for (const name of await fs.readdir(OUT_DIR)) {
    if (!name.endsWith('.md') || keep.has(name)) continue;
    const file = path.join(OUT_DIR, name);
    const content = await fs.readFile(file, 'utf8');
    if (!content.startsWith('---\n') || !content.includes('generatedBy: rss')) continue;
    const date = content.match(/^pubDate:\s*"?([^"\n]+)"?/m)?.[1];
    if (date && new Date(date).valueOf() < cutoff) await fs.rm(file, { force: true });
  }
  await fs.writeFile(CACHE, JSON.stringify(generated, null, 2));
  console.log(`✓ ${generated.length} articles traités : ${aiCount} résumés OpenAI, ${fallbackCount} replis RSS`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
