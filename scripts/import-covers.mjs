/**
 * Заглавные фото проектов — ровно те, что Ольга проставила на своём сайте
 * ongorchakova-design.ru/editorial (по её замечанию от 27.07).
 * Исходники выгружены в go-design-demo/covers/c01..c10.jpg (2000 px).
 * Здесь: → src/assets/covers/<slug>.webp (макс 1600 px, q82).
 */
import sharp from 'sharp';
import { mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const SRC = 'C:/Users/admin/Desktop/go-design-demo/covers';
const DEST = 'C:/Users/admin/Desktop/godesign/src/assets/covers';

// порядок = порядок карточек на сайте Ольги (сверху вниз, слева направо)
const COVERS = [
  ['c01.jpg', 'bakeevo'],
  ['c02.jpg', 'semeyny-klub'],
  ['c03.jpg', 'vostochnoe-biryulevo'],
  ['c04.jpg', 'tsaritsyno'],
  ['c05.jpg', 'yantarny-gorod'],
  ['c06.jpg', 'edem'],
  ['c07.jpg', 'pushchino'],
  ['c08.jpg', 'prime-park'],
  ['c09.jpg', 'kislovsky'],
  ['c10.jpg', 'stantsiya'],
];

if (!existsSync(DEST)) mkdirSync(DEST, { recursive: true });

for (const [file, slug] of COVERS) {
  const out = join(DEST, `${slug}.webp`);
  const info = await sharp(join(SRC, file))
    .rotate()
    .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(out);
  console.log(`${slug.padEnd(22)} ${info.width}×${info.height}  ${(info.size / 1024).toFixed(0)} КБ`);
}
console.log(`\nГотово: ${COVERS.length} обложек.`);
