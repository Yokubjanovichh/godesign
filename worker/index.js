/**
 * Cloudflare Worker: раздаёт статические файлы сайта и принимает контактную
 * форму, пересылая заявку в Telegram-группу.
 *
 * Секреты (задаются один раз, не попадают в репозиторий):
 *   npx wrangler secret put TELEGRAM_BOT_TOKEN
 *   npx wrangler secret put TELEGRAM_CHAT_ID
 *
 * Как получить:
 *   1. Создать бота у @BotFather → он выдаст TOKEN.
 *   2. Добавить бота в группу; узнать chat_id группы (напр. через @getidsbot
 *      или https://api.telegram.org/bot<TOKEN>/getUpdates после сообщения в группе).
 *      chat_id группы обычно отрицательный, напр. -1001234567890.
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/contact') {
      if (request.method !== 'POST') {
        return json({ success: false, message: 'Method not allowed' }, 405);
      }
      return handleContact(request, env);
    }

    // Всё остальное — статические ассеты сайта
    return env.ASSETS.fetch(request);
  },
};

const esc = (s) =>
  String(s ?? '')
    .trim()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;') || '—';

async function handleContact(request, env) {
  try {
    const form = await request.formData();

    // Ловушка для ботов: скрытое поле должно быть пустым
    if (form.get('botcheck')) return json({ success: true });

    if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
      return json(
        { success: false, message: 'Telegram не настроен (нет секретов).' },
        500
      );
    }

    const text = [
      '🏠 <b>Новая заявка — GO design</b>',
      '',
      `👤 <b>Имя:</b> ${esc(form.get('name'))}`,
      `📞 <b>Контакт:</b> ${esc(form.get('contact'))}`,
      `🏢 <b>Тип объекта:</b> ${esc(form.get('type'))}`,
      `📐 <b>Площадь:</b> ${esc(form.get('area'))} м²`,
      `📍 <b>Город:</b> ${esc(form.get('city'))}`,
      `💬 <b>Сообщение:</b> ${esc(form.get('message'))}`,
    ].join('\n');

    const tgRes = await fetch(
      `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: env.TELEGRAM_CHAT_ID,
          text,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
      }
    );

    const tg = await tgRes.json();
    if (!tg.ok) {
      return json({ success: false, message: tg.description || 'Ошибка Telegram' }, 502);
    }
    return json({ success: true });
  } catch {
    return json({ success: false, message: 'Ошибка сервера' }, 500);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}
