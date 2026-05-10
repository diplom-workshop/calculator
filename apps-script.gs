// === Apps Script для Дипломной мастерской ===
// Один скрипт делает всё: возвращает промокоды, пишет заявки в таблицу,
// шлёт уведомления в Telegram.
//
// После любых правок этого файла — нужно ПЕРЕРАЗВЕРНУТЬ Web App:
//   "Развернуть → Управление развёртываниями → шестерёнка → Изменить →
//    Версия: новая версия → Развернуть"
// (URL Web App при этом сохраняется тот же.)

// ================== НАСТРОЙКИ ==================

// Имена листов в таблице
const ORDERS_SHEET = 'Заявки';
const PROMOS_SHEET = 'Промокоды';

// Telegram — токен бота и chat_id куда слать уведомления
// ВАЖНО: эти значения подставляешь только в редакторе Apps Script (Google),
// в репозитории на GitHub оставляй заглушки — иначе токен утечёт.
const TG_TOKEN = 'PASTE_BOT_TOKEN_HERE';
const TG_CHAT  = 'PASTE_CHAT_ID_HERE';

// ================== /НАСТРОЙКИ =================


// === GET: список активных промокодов ===
function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(PROMOS_SHEET);
    if (!sheet) {
      return jsonResponse({ promos: {}, error: 'Не найден лист "' + PROMOS_SHEET + '"' });
    }

    const data = sheet.getDataRange().getValues();
    const promos = {};

    // Ожидаем колонки: Промокод | Скидка % | Активен
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const code = String(row[0] || '').trim().toUpperCase();
      const discount = Number(row[1]);
      const activeRaw = row[2];

      if (!code) continue;
      if (isNaN(discount) || discount <= 0 || discount > 100) continue;

      const activeStr = String(activeRaw || '').toLowerCase().trim();
      const isActive = activeRaw === true ||
        activeStr === 'да' || activeStr === 'true' ||
        activeStr === '1' || activeStr === '+' || activeStr === 'yes';
      if (!isActive) continue;

      promos[code] = discount;
    }

    return jsonResponse({ promos: promos });
  } catch (err) {
    return jsonResponse({ promos: {}, error: String(err && err.message || err) });
  }
}


// === POST: запись новой заявки в лист "Заявки" + отправка в Telegram ===
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ error: 'Пустое тело запроса' });
    }

    const data = JSON.parse(e.postData.contents);

    // Валидация
    const name = String(data.name || '').trim();
    const contact = String(data.contact || '').trim();
    const comment = String(data.comment || '').trim();

    if (!name) return jsonResponse({ error: 'Не указано имя' });
    if (!contact) return jsonResponse({ error: 'Не указан контакт' });
    if (name.length > 200 || contact.length > 300 || comment.length > 2000) {
      return jsonResponse({ error: 'Слишком длинные поля' });
    }

    // 1) Запись в Sheet
    let sheetError = null;
    try {
      writeOrderToSheet({ name, contact, comment, config: data.config || {} });
    } catch (err) {
      sheetError = String(err && err.message || err);
    }

    // 2) Отправка в Telegram
    let tgError = null;
    try {
      sendTelegramNotification({ name, contact, comment, config: data.config || {} });
    } catch (err) {
      tgError = String(err && err.message || err);
    }

    // Если оба канала упали — ошибка
    if (sheetError && tgError) {
      return jsonResponse({ error: 'Не удалось сохранить заявку: ' + sheetError + '; ' + tgError });
    }

    return jsonResponse({
      ok: true,
      warnings: [sheetError && ('sheet: ' + sheetError), tgError && ('telegram: ' + tgError)].filter(Boolean)
    });
  } catch (err) {
    return jsonResponse({ error: String(err && err.message || err) });
  }
}


function writeOrderToSheet(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ORDERS_SHEET);
  if (!sheet) {
    throw new Error('Не найден лист "' + ORDERS_SHEET + '"');
  }

  const config = data.config || {};
  const items = Array.isArray(config.items) ? config.items : [];
  const itemsText = items
    .map(i => '• ' + (i.name || '') + ' — ' + formatPrice(i.price) + ' ₽')
    .join('\n');

  sheet.appendRow([
    new Date(),                                 // A: Дата
    String(data.name || ''),                    // B: Имя
    String(data.contact || ''),                 // C: Контакт
    String(data.comment || ''),                 // D: Комментарий
    itemsText,                                  // E: Состав заказа
    Number(config.basePrice) || '',             // F: Базовая стоимость
    (Number(config.urgency) || 0) + '%',        // G: Срочность
    (Number(config.seasonDiscount) || 0) + '%', // H: Скидка сезон
    String(config.promoCode || ''),             // I: Промокод
    (Number(config.promoDiscount) || 0) + '%',  // J: Скидка промо
    (Number(config.totalModifier) || 0) + '%',  // K: Итог. модификатор
    Number(config.finalPrice) || '',            // L: Итого
    String(config.deadline || ''),              // M: Срок
    String(config.month || ''),                 // N: Месяц заказа
    String(config.urgencyLabel || '')           // O: Темп
  ]);
}


function sendTelegramNotification(data) {
  if (!TG_TOKEN || !TG_CHAT) {
    throw new Error('TG_TOKEN или TG_CHAT не заданы');
  }

  const message = formatTelegramMessage(data);
  const url = 'https://api.telegram.org/bot' + TG_TOKEN + '/sendMessage';

  const response = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({
      chat_id: TG_CHAT,
      text: message,
      parse_mode: 'HTML',
      disable_web_page_preview: true
    }),
    muteHttpExceptions: true
  });

  const code = response.getResponseCode();
  if (code !== 200) {
    throw new Error('Telegram HTTP ' + code + ': ' + response.getContentText().slice(0, 200));
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


// === Вспомогательные ===

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatPrice(n) {
  const num = Math.round(Number(n) || 0);
  return num.toLocaleString('ru-RU').replace(/,/g, ' ');
}
