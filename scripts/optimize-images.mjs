/**
 * Оптимизация фотографий проектов для веба.
 * Исходники (15–21 MB JPG) → WebP (~250 KB), без потери качества на глаз.
 *
 *   node scripts/optimize-images.mjs            # все проекты
 *   node scripts/optimize-images.mjs prime-park # только один
 */
import sharp from 'sharp';
import { readdir, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';

const SRC = 'C:/Users/admin/Desktop/go-design-demo/Фото в работу сайт';
const OUT = 'C:/Users/admin/Desktop/godesign/src/assets/projects';

const MAX_WIDTH = 2560; // ретины хватает; крупнее — избыточно
const QUALITY = 82; // на глаз неотличимо от оригинала

// folder-match → slug (частичное совпадение, чтобы не мучиться с пробелами)
const PROJECTS = [
  { m: 'Prime Park', slug: 'prime-park' },
  { m: 'Восточное Бирюлево', slug: 'vostochnoe-biryulevo' },
  { m: 'Станция', slug: 'stantsiya' },
  { m: 'Царицыно', slug: 'tsaritsyno' },
  { m: 'Янтарный', slug: 'yantarny-gorod' },
  { m: 'Бакеево', slug: 'bakeevo' },
  { m: 'семейный клуб', slug: 'semeyny-klub' },
  { m: 'Эдем', slug: 'edem' },
  { m: 'Кисловский', slug: 'kislovsky' },
  { m: 'Пущино', slug: 'pushchino' },
  { m: 'Фото Ольги', slug: 'olga' },
];

const only = process.argv[2];
const folders = await readdir(SRC);

let totalSrc = 0;
let totalOut = 0;
let totalFiles = 0;

for (const proj of PROJECTS) {
  if (only && proj.slug !== only) continue;

  const folder = folders.find((f) => f.includes(proj.m));
  if (!folder) {
    console.log(`  ✗ не найдено: ${proj.m}`);
    continue;
  }

  const srcDir = path.join(SRC, folder);
  const outDir = path.join(OUT, proj.slug);
  await mkdir(outDir, { recursive: true });

  // все фото, кроме подписи "N в конце всех фото.jpg"; естественный порядок
  const files = (await readdir(srcDir))
    .filter((f) => /\.(jpe?g|png)$/i.test(f) && !/в\s*конце/i.test(f))
    .sort((a, b) => a.localeCompare(b, 'ru', { numeric: true }));

  let srcBytes = 0;
  let outBytes = 0;

  for (let i = 0; i < files.length; i++) {
    const inPath = path.join(srcDir, files[i]);
    const outPath = path.join(outDir, `${String(i + 1).padStart(2, '0')}.webp`);

    await sharp(inPath)
      .rotate() // учитываем EXIF-ориентацию
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toFile(outPath);

    srcBytes += (await stat(inPath)).size;
    outBytes += (await stat(outPath)).size;
  }

  totalSrc += srcBytes;
  totalOut += outBytes;
  totalFiles += files.length;

  const mb = (b) => (b / 1e6).toFixed(1);
  console.log(
    `  ✓ ${proj.slug.padEnd(20)} ${String(files.length).padStart(2)} фото · ${mb(srcBytes).padStart(6)} MB → ${mb(outBytes).padStart(5)} MB`
  );
}

const mb = (b) => (b / 1e6).toFixed(1);
console.log('  ─────────────────────────────────────────────');
console.log(
  `  Σ ${totalFiles} фото · ${mb(totalSrc)} MB → ${mb(totalOut)} MB (×${(totalSrc / totalOut).toFixed(0)} легче)`
);
