// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Временный превью на GitHub Pages (в России открывается надёжнее Cloudflare);
  // позже — переезд на российский хостинг / свой домен (тогда base снова '/')
  site: 'https://yokubjanovichh.github.io',
  base: '/godesign',
  integrations: [sitemap()],
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
  build: {
    inlineStylesheets: 'auto',
  },
});
