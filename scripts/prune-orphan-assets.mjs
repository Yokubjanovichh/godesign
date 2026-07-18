/**
 * Пост-обработка сборки под статический хостинг (уменьшаем вес dist):
 *
 * Шаг 1. В каждом <img> Astro ставит в src полноразмерный оригинал (напр. 2560px)
 *   как fallback, а в srcset — ресайзнутые варианты. Современные браузеры грузят
 *   srcset, но тяжёлый оригинал всё равно лежит в сборке. Переписываем src на
 *   самый большой вариант из srcset — оригинал перестаёт быть нужен.
 *
 * Шаг 2. Удаляем из dist/_astro все картинки, которые после этого не упомянуты
 *   нигде в сборке (html/css/js/xml) — это оригиналы из eager import.meta.glob
 *   и осиротевшие fallback-оригиналы. Отображаемые варианты не трогаются.
 */
import { readFileSync, writeFileSync, readdirSync, statSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
const ASSETS = join(DIST, '_astro');
const IMG = /\.(webp|jpe?g|png|avif|gif)$/i;
const TEXTSCAN = /\.(html|css|js|xml|json|txt|svg)$/i;

function walk(dir, cb) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, cb);
    else cb(p, name);
  }
}

// "url1 520w, url2 860w, url3 1200w" → url с максимальным дескриптором w
function largestFromSrcset(srcset) {
  let best = null;
  let bestW = -1;
  for (const part of srcset.split(',')) {
    const m = part.trim().match(/^(\S+)\s+(\d+)w$/);
    if (m && +m[2] > bestW) {
      bestW = +m[2];
      best = m[1];
    }
  }
  return best;
}

// --- Шаг 1 ---
let rewritten = 0;
walk(DIST, (p, name) => {
  if (!/\.html$/i.test(name)) return;
  let html = readFileSync(p, 'utf8');
  let changed = false;
  html = html.replace(/<img\b[^>]*>/gi, (tag) => {
    const ss = tag.match(/srcset="([^"]+)"/i);
    const sr = tag.match(/\ssrc="([^"]+)"/i);
    if (!ss || !sr) return tag;
    const largest = largestFromSrcset(ss[1]);
    if (!largest || largest === sr[1]) return tag;
    changed = true;
    return tag.replace(/(\s)src="[^"]*"/i, `$1src="${largest}"`);
  });
  if (changed) {
    writeFileSync(p, html);
    rewritten++;
  }
});

// --- Шаг 2 ---
let haystack = '';
walk(DIST, (p, name) => {
  if (TEXTSCAN.test(name)) haystack += readFileSync(p, 'utf8');
});

let removed = 0;
let freed = 0;
let kept = 0;
for (const name of readdirSync(ASSETS)) {
  if (!IMG.test(name)) continue;
  if (haystack.includes(name)) {
    kept++;
    continue;
  }
  const p = join(ASSETS, name);
  freed += statSync(p).size;
  rmSync(p);
  removed++;
}

console.log(
  `[optimize] src переписан в ${rewritten} html; удалено ${removed} картинок, ` +
    `освобождено ${(freed / 1048576).toFixed(1)} МБ, оставлено ${kept}`
);
