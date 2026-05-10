// Handler приёма заявки с калькулятора.
// Получает JSON { name, contact, comment, config }, шлёт в Telegram + Google Sheet.

exports.handler = async (event) => {
  // CORS для preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders(),
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method Not Allowed' });
  }

  let data;
  try {
    data = JSON.parse(event.body || '{}');
  } catch (e) {
    return jsonResponse(400, { error: 'Невалидный JSON' });
  }

  // Минимальная валидация
  const name = String(data.name || '').trim();
  const contact = String(data.contact || '').trim();
  const comment = String(data.comment || '').trim();

  if (!name) return jsonResponse(400, { error: 'Не указано имя' });
  if (!contact) return jsonResponse(400, { error: 'Не указан контакт' });
  if (name.length > 200 || contact.length > 300 || comment.length > 2000) {
    return jsonResponse(400, { error: 'Слишком длинные поля' });
  }

  const TG_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TG_CHAT = process.env.TELEGRAM_CHAT_ID;
  const SHEETS_URL = process.env.SHEETS_SCRIPT_URL;
  const SHEETS_SECRET = process.env.SHEETS_SECRET;

  const tasks = [];
  const warnings = [];

  // Telegram
  if (TG_TOKEN && TG_CHAT) {
    tasks.push(
      sendToTelegram(TG_TOKEN, TG_CHAT, { name, contact, comment, config: data.config || {} })
        .catch(err => warnings.push('telegram: ' + err.message))
    );
  } else {
    warnings.push('telegram: env not configured');
  }

  // Google Sheet
  if (SHEETS_URL) {
    tasks.push(
      sendToSheet(SHEETS_URL, SHEETS_SECRET, { name, contact, comment, config: data.config || {} })
        .catch(err => warnings.push('sheet: ' + err.message))
    );
  } else {
    warnings.push('sheet: env not configured');
  }

  await Promise.all(tasks);

  // Если оба канала упали — возвращаем ошибку
  const tgFailed = warnings.some(w => w.startsWith('telegram'));
  const sheetFailed = warnings.some(w => w.startsWith('sheet'));
  const allFailed = tgFailed && sheetFailed;

  if (allFailed) {
    return jsonResponse(500, { error: 'Не удалось отправить заявку. Попробуйте позже.', warnings });
  }

  return jsonResponse(200, { ok: true, warnings });
};

async function sendToTelegram(token, chatId, data) {
  const message = formatTelegramMessage(data);
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML',
      disable_web_page_preview: true
    })
  });
  if (!r.ok) {
    const text = await r.text().catch(() => '');
    throw new Error(`HTTP ${r.status} ${text.slice(0, 200)}`);
  }
}

async function sendToSheet(url, secret, data) {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret: secret || '', ...data }),
    redirect: 'follow'
  });
  if (!r.ok) {
    const text = await r.text().catch(() => '');
    throw new Error(`HTTP ${r.status} ${text.slice(0, 200)}`);
  }
  // Apps Script отдаёт 200 даже при ошибке внутри. Проверим тело.
  const text = await r.text();
  let body;
  try { body = JSON.parse(text); } catch (e) { body = null; }
  if (body && body.error) {
    throw new Error(body.error);
  }
}

function formatTelegramMessage(data) {
  const cfg = data.config || {};
  const items = Array.isArray(cfg.items) ? cfg.items : [];

  const lines = [];
  lines.push('🎓 <b>Новая заявка с калькулятора</b>');
  lines.push('');
  lines.push('👤 <b>' + escapeHtml(data.name) + '</b>');
  lines.push('📞 ' + escapeHtml(data.contact));
  if (data.comment) {
    lines.push('💬 ' + escapeHtml(data.comment));
  }
  lines.push('');

  if (items.length > 0) {
    lines.push('<b>Состав заказа</b>');
    items.forEach(item => {
      lines.push('· ' + escapeHtml(item.name || '') + ' — ' + formatPrice(item.price) + ' ₽');
    });
    lines.push('');
  }

  if (cfg.basePrice !== undefined) {
    lines.push('Базовая стоимость: <b>' + formatPrice(cfg.basePrice) + ' ₽</b>');
  }
  if (cfg.urgency > 0) {
    lines.push('Наценка за срочность: +' + cfg.urgency + '%');
  }
  if (cfg.seasonDiscount > 0) {
    lines.push('Скидка ' + escapeHtml(cfg.month || '') + ': −' + cfg.seasonDiscount + '%');
  }
  if (cfg.promoDiscount > 0) {
    lines.push('Промокод ' + escapeHtml(cfg.promoCode || '') + ': −' + cfg.promoDiscount + '%');
  }
  if (cfg.finalPrice !== undefined) {
    lines.push('');
    lines.push('💰 <b>Итого: ' + formatPrice(cfg.finalPrice) + ' ₽</b>');
  }

  if (cfg.deadline || cfg.comfortDays) {
    lines.push('');
    if (cfg.deadline) lines.push('Срок: ' + escapeHtml(cfg.deadline));
    if (cfg.comfortDays) lines.push('Комфортно для авторов: ' + cfg.comfortDays + ' дн.');
  }
  if (cfg.urgencyLabel) {
    lines.push('Темп: ' + escapeHtml(cfg.urgencyLabel));
  }

  return lines.join('\n');
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatPrice(n) {
  return Math.round(Number(n) || 0).toLocaleString('ru-RU').replace(/,/g, ' ');
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    body: JSON.stringify(body)
  };
}
