// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Render Static Site (сборка на сервере Render, открывается в России;
  // Netlify/Vercel/Cloudflare заблокированы, у Surge падает CLI-загрузка)
  site: 'https://gorchakova-design.onrender.com',
  integrations: [sitemap()],
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
  build: {
    inlineStylesheets: 'auto',
  },
});
