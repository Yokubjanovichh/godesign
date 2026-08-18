// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Российский хостинг reg.ru (Host-A). Зарубежные площадки не подошли:
  // Netlify/Vercel/Cloudflare заблокированы, а Render у Ольги открывался
  // только через VPN.
  site: 'https://ongorchakova-design.ru',
  integrations: [sitemap()],
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
  build: {
    inlineStylesheets: 'auto',
  },
});
