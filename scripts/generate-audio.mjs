import fs from 'node:fs/promises';
import path from 'node:path';
import OpenAI from 'openai';

const IN = path.join(process.cwd(), 'scripts/.cache/generated.json');
const OUT = path.join(process.cwd(), 'public/audio');
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  let items;
  try { items = JSON.parse(await fs.readFile(IN, 'utf8')); }
  catch { items = []; }
  const keep = new Set(items.map((article) => `${article.slug}.mp3`));
  for (const name of await fs.readdir(OUT)) {
    if (name.endsWith('.mp3') && !keep.has(name)) await fs.rm(path.join(OUT, name), { force: true });
  }
  if (!openai) { console.log('OPENAI_API_KEY absent : les lecteurs utiliseront la synthèse vocale française du navigateur.'); return; }
  for (const article of items) {
    const file = path.join(OUT, `${article.slug}.mp3`);
    try { await fs.access(file); continue; } catch {}
    try {
      const markdown = await fs.readFile(path.join(process.cwd(), 'src/content/articles', `${article.slug}.md`), 'utf8');
      const body = markdown.replace(/^---[\s\S]*?---\s*/, '').replace(/[#*_`\[\]]/g, ' ').replace(/\s+/g, ' ').trim();
      const input = `Article de Greise. ${article.title}. ${body}`.slice(0, 4000);
      const speech = await openai.audio.speech.create({ model: 'tts-1', voice: 'nova', input, speed: 0.98 });
      await fs.writeFile(file, Buffer.from(await speech.arrayBuffer()));
      console.log(`✓ audio ${article.slug}`);
    } catch (error) { console.warn(`[audio skip] ${article.slug}: ${error.message}`); }
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
