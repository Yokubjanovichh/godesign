/**
 * Кадры для главной страницы: «Загородный семейный клуб».
 *
 * Ольга дважды писала об этом кадре. Сначала — развернуть ракурс правее, на
 * золотистую панель, а не на телевизор. Потом, увидев результат: «темновато и
 * не видна панель… наверху свет» — на широком экране кадр брался с y = 700 и
 * волнистый верх панели вместе с подсветкой-карнизом оставался за рамкой.
 *
 * Замер яркости по строкам исходника (2000×2000) даёт ориентиры:
 *   y ≈ 230–280   подсветка над панелью (резкий скачок яркости)
 *   y ≈ 280–1100  сама панель
 *   y ≈ 1080–1420 мебель: диваны, кресла, столики
 *   y ≈ 1420+     пол
 *
 * Отсюда широкий кадр: от 200 до 1430 — подсветка, панель и мебель целиком.
 * Ширину берём полную: при обрезке слева пропорция становится вытянутее и на
 * мониторе 16:9 пришлось бы срезать по высоте как раз панель. Телевизор при
 * этом остаётся с краю — он есть и на фото, которое Ольга приложила к ТЗ.
 *
 *   semeyny-wide.webp — десктоп и планшет альбомом;
 *   semeyny-tall.webp — телефон: там экран вытянут вверх, кадр берём узкий
 *                       (без телевизора) и во всю высоту.
 */
import sharp from 'sharp';
import { mkdirSync, existsSync } from 'node:fs';

const SRC =
  'C:/Users/admin/Desktop/go-design-demo/Фото в работу сайт/Загородный семейный клуб , 450 м 2/Reka_30000.jpg';
const DEST_DIR = 'C:/Users/admin/Desktop/godesign/src/assets/hero';

const TALL_CROP_LEFT = 0.22; // на телефоне телевизор убираем
const WIDE_TOP = 200; // чуть выше подсветки
const WIDE_BOTTOM = 1430; // нижний край мебели

if (!existsSync(DEST_DIR)) mkdirSync(DEST_DIR, { recursive: true });

const { width, height } = await sharp(SRC).metadata();

const tallLeft = Math.round(width * TALL_CROP_LEFT);
const tall = await sharp(SRC)
  .rotate()
  .extract({ left: tallLeft, top: 0, width: width - tallLeft, height })
  .webp({ quality: 84 })
  .toFile(`${DEST_DIR}/semeyny-tall.webp`);

const wide = await sharp(SRC)
  .rotate()
  .extract({ left: 0, top: WIDE_TOP, width, height: WIDE_BOTTOM - WIDE_TOP })
  .webp({ quality: 84 })
  .toFile(`${DEST_DIR}/semeyny-wide.webp`);

const r = (i) => (i.width / i.height).toFixed(2);
console.log(`tall: ${tall.width}×${tall.height} (${r(tall)})  ${(tall.size / 1024).toFixed(0)} КБ`);
console.log(`wide: ${wide.width}×${wide.height} (${r(wide)})  ${(wide.size / 1024).toFixed(0)} КБ`);
