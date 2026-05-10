// === Apps Script для Дипломной мастерской ===
// Этот код вставляется в Google Sheet через "Расширения → Apps Script".
// После сохранения и развёртывания как Web App, скрипт обрабатывает:
//   GET  → возвращает список активных промокодов
//   POST → дописывает строку в лист "Заявки"

// ================== НАСТРОЙКИ ==================

// Имена листов в таблице. Если переименуешь листы — поменяй здесь.
const ORDERS_SHEET = 'Заявки';
const PROMOS_SHEET = 'Промокоды';

// ВАЖНО: Поставь сюда любую длинную случайную строку (не короче 24 символов).
// Это же значение положишь в Netlify env-переменную SHEETS_SECRET.
// Без совпадения секрета чужой никто не сможет писать в таблицу через POST.
const SECRET = 'CHANGE-ME-TO-RANDOM-STRING-AT-LEAST-24-CHARS';

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

      // Активность: чекбокс TRUE / "да" / "true" / "1" / "+"
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


// === POST: запись новой заявки в лист "Заявки" ===
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ error: 'Пустое тело запроса' });
    }

    const data = JSON.parse(e.postData.contents);

    // Проверка секрета
    if (String(data.secret || '') !== SECRET) {
      return jsonResponse({ error: 'Forbidden — неверный секрет' });
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ORDERS_SHEET);
    if (!sheet) {
      return jsonResponse({ error: 'Не найден лист "' + ORDERS_SHEET + '"' });
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
      Number(config.basePrice) || '',             // F: Базовая стоимость, ₽
      (Number(config.urgency) || 0) + '%',        // G: Срочность
      (Number(config.seasonDiscount) || 0) + '%', // H: Скидка сезон
      String(config.promoCode || ''),             // I: Промокод
      (Number(config.promoDiscount) || 0) + '%',  // J: Скидка промо
      (Number(config.totalModifier) || 0) + '%',  // K: Итог. модификатор
      Number(config.finalPrice) || '',            // L: Итого, ₽
      String(config.deadline || ''),              // M: Срок
      String(config.month || ''),                 // N: Месяц заказа
      String(config.urgencyLabel || '')           // O: Темп
    ]);

    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ error: String(err && err.message || err) });
  }
}


function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function formatPrice(n) {
  const num = Math.round(Number(n) || 0);
  return num.toLocaleString('ru-RU').replace(/,/g, ' ');
}
