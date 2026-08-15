/**
 * Арт-объекты Ольги. Раньше картинки снимались с её сайта — там были коллажи
 * в 380 px. В августе Ольга прислала отдельные снимки в хорошем качестве
 * (архив «АРТ»), их и берём: по одному кадру на объект.
 */
import sharp from 'sharp';
import { mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const SRC = 'C:/Users/admin/Desktop/go-design-demo/art-new/АРТ';
const DEST = 'C:/Users/admin/Desktop/godesign/src/assets/art';

const ITEMS = [
  ['IMG_20260603_164109.png', 'panno-ryab'], // панно «Рябь на воде»
  ['d6a2bfc357cb43011a62a5cb11f9f130.jpg', 'metal-kartina'], // металлизированная картина
  ['текстурная картина.jpg', 'teksturnaya-kartina'],
  ['IMG_20260815_095815.png', 'keramika-seaweed'], // Seaweed — бирюзовая драпировка
  ['IMG_20260815_095802.png', 'keramika-basho'], // «Старый пруд» — квадратная чаша
  ['IMG_20260815_095823.png', 'keramika-kurosy'], // куросы, зелёная глазурь
  ['картина.jpg', 'kartina-pechat'], // интерьерная картина, печать
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
