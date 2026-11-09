import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: process.env.SITE_URL || 'https://gr28ac08e.github.io/greise',
  base: '/greise',
  output: 'static',
  integrations: [sitemap()],
  build: { format: 'directory' },
});
