// Receives website inquiries and forwards them to the private Google Apps Script web app.
export default async request => {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ ok: false, error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json; charset=utf-8', Allow: 'POST' }
    });
  }

  const sheetUrl = process.env.SHEETS_WEB_APP_URL;
  const secret = process.env.WEBHOOK_SECRET;
  if (!sheetUrl || !secret) {
    return new Response(JSON.stringify({ ok: false, error: 'Sheet connection is not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }

  try {
    const payload = await request.json();
    const sheetResponse = await fetch(sheetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, secret })
    });
    const text = await sheetResponse.text();
    let result;
    try { result = JSON.parse(text); } catch { result = { ok: false, error: 'Invalid response from Google Sheets' }; }
    if (!sheetResponse.ok || !result.ok) {
      return new Response(JSON.stringify({ ok: false, error: result.error || 'Google Sheets rejected the inquiry' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Could not send inquiry' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }
};
