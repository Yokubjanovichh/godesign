/**
 * Кадры для главной страницы: «Загородный семейный клуб».
 *
 * Ольга просила развернуть ракурс правее — на золотистую панель, а не на
 * телевизор, поэтому слева срезаем 22 % кадра.
 *
 * Дальше — два варианта под разную форму экрана, иначе на широком мониторе
 * от вертикального кадра оставалось лишь ~35 % высоты:
 *   semeyny-wide.webp (1560×1000) — для десктопа и планшета;
 *   semeyny-tall.webp (1560×2000) — для телефона, где экран вытянут вверх.
 */
import sharp from 'sharp';
import { mkdirSync, existsSync } from 'node:fs';

const SRC =
  'C:/Users/admin/Desktop/go-design-demo/Фото в работу сайт/Загородный семейный клуб , 450 м 2/Reka_30000.jpg';
const DEST_DIR = 'C:/Users/admin/Desktop/godesign/src/assets/hero';

const CROP_LEFT = 0.22; // слева телевизор — убираем
const WIDE_TOP = 300; // полоса с панелью, диванами и окном
const WIDE_H = 1000;

if (!existsSync(DEST_DIR)) mkdirSync(DEST_DIR, { recursive: true });

const { width, height } = await sharp(SRC).metadata();
const left = Math.round(width * CROP_LEFT);
const w = width - left;

const tall = await sharp(SRC)
  .rotate()
  .extract({ left, top: 0, width: w, height })
  .webp({ quality: 84 })
  .toFile(`${DEST_DIR}/semeyny-tall.webp`);

const wide = await sharp(SRC)
  .rotate()
  .extract({ left, top: WIDE_TOP, width: w, height: WIDE_H })
  .webp({ quality: 84 })
  .toFile(`${DEST_DIR}/semeyny-wide.webp`);

console.log(`tall: ${tall.width}×${tall.height}  ${(tall.size / 1024).toFixed(0)} КБ`);
console.log(`wide: ${wide.width}×${wide.height}  ${(wide.size / 1024).toFixed(0)} КБ`);
