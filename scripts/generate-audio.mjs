import fs from 'node:fs/promises';
import path from 'node:path';

const IN = path.join(process.cwd(), 'scripts/.cache/generated.json');
const OUT = path.join(process.cwd(), 'public/audio');
const ARTICLE_DIR = path.join(process.cwd(), 'src/content/rss');
const openai = process.env.OPENAI_API_KEY ? new (await import('openai')).default({ apiKey: process.env.OPENAI_API_KEY }) : null;

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  let items;
  try { items = JSON.parse(await fs.readFile(IN, 'utf8')); }
  catch { items = []; }
  // Seules les synthèses rédigées par Greise sont mises en audio : on ne fait pas lire par une voix de synthèse
  // les extraits d'autres médias. Pour ceux-là, le navigateur propose sa propre lecture vocale.
  items = items.filter((article) => article.generatedBy === 'ai');
  const keep = new Set(items.map((article) => `${article.slug}.mp3`));
  for (const name of await fs.readdir(OUT)) {
    if (name.endsWith('.mp3') && !keep.has(name)) await fs.rm(path.join(OUT, name), { force: true });
  }
  if (!openai) { console.log('OPENAI_API_KEY absent : les lecteurs utiliseront la synthèse vocale française du navigateur.'); return; }
  for (const article of items) {
    const file = path.join(OUT, `${article.slug}.mp3`);
    try { await fs.access(file); continue; } catch {}
    try {
      const markdown = await fs.readFile(path.join(ARTICLE_DIR, `${article.slug}.md`), 'utf8');
      const body = markdown.replace(/^---[\s\S]*?---\s*/, '').replace(/[#*_`\[\]]/g, ' ').replace(/\s+/g, ' ').trim();
      let summary = '';
      try { summary = JSON.parse(markdown.match(/^summary: (.*)$/m)?.[1] || '""'); } catch {}
      const input = `Synthèse Greise. ${article.title}. ${summary} ${body}`.slice(0, 4000);
      const speech = await openai.audio.speech.create({ model: 'tts-1', voice: 'nova', input, speed: 0.98 });
      await fs.writeFile(file, Buffer.from(await speech.arrayBuffer()));
      console.log(`✓ audio ${article.slug}`);
    } catch (error) { console.warn(`[audio skip] ${article.slug}: ${error.message}`); }
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
