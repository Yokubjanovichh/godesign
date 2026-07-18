/**
 * Netlify Function: приём контактной формы → Telegram-группа.
 * Переменные окружения (Site settings → Environment variables):
 *   TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
 */

const esc = (s) =>
  String(s ?? '')
    .trim()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;') || '—';

const json = (data, statusCode = 200) => ({
  statusCode,
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify(data),
});

function sendTelegram(token, chatId, text) {
  return fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
  }).then((r) => r.json());
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return json({ success: false, message: 'Method not allowed' }, 405);
  }

  try {
    const raw = event.isBase64Encoded
      ? Buffer.from(event.body || '', 'base64').toString('utf8')
      : event.body || '';
    const form = new URLSearchParams(raw);

    // Ловушка для ботов
    if (form.get('botcheck')) return json({ success: true });

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!token || !chatId) {
      return json({ success: false, message: 'Telegram не настроен (нет переменных).' }, 500);
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

    let tg = await sendTelegram(token, chatId, text);

    // Группа была преобразована в супергруппу → id изменился. Telegram
    // возвращает новый id в parameters.migrate_to_chat_id — повторяем отправку.
    if (!tg.ok && tg.parameters && tg.parameters.migrate_to_chat_id) {
      const newId = tg.parameters.migrate_to_chat_id;
      // Виден в логах функции (Netlify → Functions → contact) — можно
      // прописать это значение в TELEGRAM_CHAT_ID, чтобы убрать лишний запрос.
      console.log('Telegram chat migrated to supergroup id:', newId);
      tg = await sendTelegram(token, newId, text);
    }

    if (!tg.ok) {
      return json({ success: false, message: tg.description || 'Ошибка Telegram' }, 502);
    }
    return json({ success: true });
  } catch {
    return json({ success: false, message: 'Ошибка сервера' }, 500);
  }
}
