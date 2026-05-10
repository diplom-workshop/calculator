// Возвращает список активных промокодов из Google Sheet (через Apps Script).
// Кэшируется в памяти функции на 5 минут, чтобы не дёргать Google слишком часто.

let cache = { data: null, ts: 0 };
const TTL_MS = 5 * 60 * 1000; // 5 минут

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders(), body: '' };
  }
  if (event.httpMethod !== 'GET') {
    return jsonResponse(405, { error: 'Method Not Allowed' });
  }

  const SHEETS_URL = process.env.SHEETS_SCRIPT_URL;
  if (!SHEETS_URL) {
    return jsonResponse(200, { promos: {} });
  }

  // Возврат из кэша
  const now = Date.now();
  if (cache.data && (now - cache.ts) < TTL_MS) {
    return jsonResponse(200, cache.data);
  }

  try {
    const r = await fetch(SHEETS_URL, { method: 'GET', redirect: 'follow' });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const text = await r.text();
    let body;
    try { body = JSON.parse(text); } catch (e) {
      throw new Error('Apps Script вернул не JSON');
    }
    const data = { promos: body.promos || {} };
    cache = { data, ts: now };
    return jsonResponse(200, data);
  } catch (err) {
    // Если упало — отдаём пустой список (промокоды не работают, но сайт жив)
    return jsonResponse(200, { promos: {}, warning: err.message });
  }
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'public, max-age=60'
  };
}

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    body: JSON.stringify(body)
  };
}
