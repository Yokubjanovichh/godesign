/**
 * Арт-объекты Ольги — изображения с ongorchakova-design.ru/art-obekt.
 * Исходники выгружены в go-design-demo/art/a1..a7 → src/assets/art/<slug>.webp.
 */
import sharp from 'sharp';
import { mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const SRC = 'C:/Users/admin/Desktop/go-design-demo/art';
const DEST = 'C:/Users/admin/Desktop/godesign/src/assets/art';

const ITEMS = [
  ['a1.jpg', 'metal-kartina'],
  ['a2.png', 'panno-ryab'],
  ['a3.jpg', 'teksturnaya-kartina'],
  ['a4.png', 'keramika-seaweed'],
  ['a5.png', 'keramika-basho'],
  ['a6.png', 'keramika-kurosy'],
  ['a7.png', 'kartina-pechat'],
];

if (!existsSync(DEST)) mkdirSync(DEST, { recursive: true });

for (const [file, slug] of ITEMS) {
  const info = await sharp(join(SRC, file))
    .rotate()
    .resize({ width: 1400, height: 1400, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(join(DEST, `${slug}.webp`));
  console.log(`${slug.padEnd(22)} ${info.width}×${info.height}  ${(info.size / 1024).toFixed(0)} КБ`);
}
console.log(`\nГотово: ${ITEMS.length} арт-объектов.`);
