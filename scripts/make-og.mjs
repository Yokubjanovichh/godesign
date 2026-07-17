/**
 * Генерация og-image (1200×630) для соцсетей: интерьерный кадр + бренд.
 *   node scripts/make-og.mjs
 */
import sharp from 'sharp';

const src = 'C:/Users/admin/Desktop/godesign/src/assets/projects/prime-park/01.webp';
const out = 'C:/Users/admin/Desktop/godesign/public/og-default.jpg';

const overlay = Buffer.from(
  `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0.3" stop-color="#120e0a" stop-opacity="0.05"/>
        <stop offset="1" stop-color="#120e0a" stop-opacity="0.9"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#g)"/>
    <circle cx="80" cy="512" r="5" fill="#d68a5f"/>
    <text x="98" y="518" font-family="Arial, sans-serif" font-size="22" letter-spacing="6" fill="#d68a5f">ДИЗАЙН ИНТЕРЬЕРА · МОСКВА</text>
    <text x="72" y="586" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="72" font-weight="600" fill="#f6efe4">Ольга Горчакова</text>
  </svg>`
);

await sharp(src)
  .resize(1200, 630, { fit: 'cover', position: 'centre' })
  .composite([{ input: overlay, top: 0, left: 0 }])
  .jpeg({ quality: 86 })
  .toFile(out);

console.log('✓ public/og-default.jpg создан (1200×630)');
