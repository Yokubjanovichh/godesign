/**
 * Выгрузка собранного сайта на хостинг по FTP.
 *
 * Render открывается в России не у всех (Ольга заходила через VPN), поэтому
 * сайт живёт на российском хостинге reg.ru — там же, где домен.
 *
 * Заливаем инкрементально: рядом лежит .deploy-manifest.json с хешами того,
 * что уже на сервере, и в следующий раз уходят только изменившиеся файлы.
 * Полная выгрузка — 954 файла, 39 МБ; обычная правка — единицы файлов.
 *
 * Доступы читаются из .env (в git не попадает):
 *   FTP_HOST=...        например ongorchakova-design.ru или ftp.reg.ru
 *   FTP_USER=...
 *   FTP_PASSWORD=...
 *   FTP_DIR=/www/ongorchakova-design.ru   корень сайта на хостинге
 *
 * Запуск:  npm run deploy          — только изменившееся
 *          npm run deploy -- --all — залить всё заново
 *          npm run deploy -- --prune — ещё и удалить лишнее на сервере
 */
import { Client } from 'basic-ftp';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative, posix, dirname } from 'node:path';

const ROOT = process.cwd();
const DIST = join(ROOT, 'dist');
const MANIFEST = join(ROOT, '.deploy-manifest.json');

const FORCE_ALL = process.argv.includes('--all');
const PRUNE = process.argv.includes('--prune');

// --- .env ---------------------------------------------------------------
function loadEnv() {
  const file = join(ROOT, '.env');
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
loadEnv();

const { FTP_HOST, FTP_USER, FTP_PASSWORD } = process.env;
const FTP_DIR = process.env.FTP_DIR || '/';

if (!FTP_HOST || !FTP_USER || !FTP_PASSWORD) {
  console.error(
    'Нет доступов. Добавьте в .env:\n' +
      '  FTP_HOST=...\n  FTP_USER=...\n  FTP_PASSWORD=...\n  FTP_DIR=/www/ваш-домен'
  );
  process.exit(1);
}
if (!existsSync(DIST)) {
  console.error('Нет папки dist — сначала `npm run build`.');
  process.exit(1);
}

// --- что заливаем -------------------------------------------------------
function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, acc);
    else acc.push(full);
  }
  return acc;
}

const files = walk(DIST).map((full) => {
  const rel = relative(DIST, full).split('\\').join('/');
  const hash = createHash('sha1').update(readFileSync(full)).digest('hex');
  return { full, rel, hash, size: statSync(full).size };
});

const prev = !FORCE_ALL && existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : {};
const changed = files.filter((f) => prev[f.rel] !== f.hash);
const gone = Object.keys(prev).filter((rel) => !files.some((f) => f.rel === rel));

const mb = (n) => (n / 1024 / 1024).toFixed(1);
console.log(
  `Всего ${files.length} файлов (${mb(files.reduce((s, f) => s + f.size, 0))} МБ). ` +
    `К выгрузке: ${changed.length} (${mb(changed.reduce((s, f) => s + f.size, 0))} МБ)` +
    (gone.length ? `, лишних на сервере: ${gone.length}` : '')
);
if (!changed.length && !(PRUNE && gone.length)) {
  console.log('Нечего выгружать — сервер уже совпадает со сборкой.');
  process.exit(0);
}

// --- выгрузка -----------------------------------------------------------
const client = new Client(30_000);
client.ftp.verbose = false;

try {
  // secure: true — FTPS, если хостинг его поддерживает; иначе обычный FTP
  try {
    await client.access({
      host: FTP_HOST,
      user: FTP_USER,
      password: FTP_PASSWORD,
      secure: true,
      secureOptions: { rejectUnauthorized: false },
    });
    console.log('Подключились по FTPS.');
  } catch {
    await client.access({ host: FTP_HOST, user: FTP_USER, password: FTP_PASSWORD });
    console.log('Подключились по FTP (без TLS).');
  }

  await client.ensureDir(FTP_DIR);

  const done = { ...prev };
  let i = 0;
  const madeDirs = new Set();

  for (const f of changed) {
    const remote = posix.join(FTP_DIR, f.rel);
    const remoteDir = posix.dirname(remote);
    if (!madeDirs.has(remoteDir)) {
      await client.ensureDir(remoteDir);
      madeDirs.add(remoteDir);
    }
    await client.uploadFrom(f.full, remote);
    done[f.rel] = f.hash;
    i += 1;
    if (i % 25 === 0 || i === changed.length) {
      console.log(`  ${i}/${changed.length}`);
      // манифест пишем по ходу: обрыв связи не заставит заливать всё заново
      writeFileSync(MANIFEST, JSON.stringify(done, null, 0));
    }
  }

  if (PRUNE && gone.length) {
    for (const rel of gone) {
      try {
        await client.remove(posix.join(FTP_DIR, rel));
        delete done[rel];
      } catch {
        /* уже нет — и хорошо */
      }
    }
    console.log(`Удалено лишних: ${gone.length}`);
  }

  writeFileSync(MANIFEST, JSON.stringify(done, null, 0));
  console.log('Готово.');
} catch (err) {
  console.error('Ошибка выгрузки:', err.message);
  process.exitCode = 1;
} finally {
  client.close();
}
