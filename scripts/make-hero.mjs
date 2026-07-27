/**
 * Кадр для главной страницы: «Загородный семейный клуб».
 * Ольга просила развернуть ракурс правее — на золотистую панель, а не на телевизор.
 * Поэтому кадр обрезан слева на 22 %: телевизор уходит за край, панель по центру.
 */
import sharp from 'sharp';
import { mkdirSync, existsSync } from 'node:fs';

const SRC = 'C:/Users/admin/Desktop/go-design-demo/Фото в работу сайт/Загородный семейный клуб , 450 м 2/Reka_30000.jpg';
const DEST_DIR = 'C:/Users/admin/Desktop/godesign/src/assets/hero';
const DEST = `${DEST_DIR}/semeyny-panel.webp`;

const CROP_LEFT = 0.22; // доля кадра, срезаемая слева (там телевизор)

if (!existsSync(DEST_DIR)) mkdirSync(DEST_DIR, { recursive: true });

const { width, height } = await sharp(SRC).metadata();
const left = Math.round(width * CROP_LEFT);

const info = await sharp(SRC)
  .rotate()
  .extract({ left, top: 0, width: width - left, height })
  .webp({ quality: 84 })
  .toFile(DEST);

console.log(`hero: ${width}×${height} → ${info.width}×${info.height}  ${(info.size / 1024).toFixed(0)} КБ`);
