const TYPES = new Set(['waitlist', 'contact', 'subscription', 'feedback', 'concern']);
const clean = (value, max = 5000) => String(value ?? '').trim().slice(0, max);
const escapeHtml = (value) => clean(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
const json = (statusCode, body) => ({ statusCode, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' }, body: JSON.stringify(body) });

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return json(204, {});
  if (event.httpMethod !== 'POST') return json(405, { message: 'Method not allowed.' });
  if (!process.env.RESEND_API_KEY) return json(500, { message: 'Submission service is not configured.' });
  let body;
  try { body = JSON.parse(event.body || '{}'); } catch { return json(400, { message: 'Invalid request.' }); }
  const type = clean(body.type, 30);
  const email = clean(body.email, 254).toLowerCase();
  if (!TYPES.has(type)) return json(400, { message: 'Invalid submission type.' });
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) return json(400, { message: 'A valid email address is required.' });
  if (type !== 'subscription' && !clean(body.name, 120)) return json(400, { message: 'Your name is required.' });
  if (['contact', 'feedback', 'concern'].includes(type) && !clean(body.message)) return json(400, { message: 'Please enter a message.' });
  if (type === 'waitlist' && body.consent !== true) return json(400, { message: 'Consent is required.' });
  const reference = `NT-${type.slice(0, 3).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
  const fields = { reference, type, name: clean(body.name, 120), email, phone: clean(body.phone, 40), subject: clean(body.subject, 160), category: clean(body.category, 120), message: clean(body.message), rating: body.rating ?? '', source: clean(body.source, 120), metadata: JSON.stringify(body.metadata || {}) };
  const rows = Object.entries(fields).map(([key, value]) => `<tr><td style="padding:6px"><strong>${escapeHtml(key)}</strong></td><td style="padding:6px">${escapeHtml(value)}</td></tr>`).join('');
  const sent = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: process.env.RESEND_FROM_EMAIL || 'Naitrust <onboarding@resend.dev>', to: [process.env.PUBLIC_FORMS_TO_EMAIL || process.env.WAITLIST_TO_EMAIL || 'contact@naitrust.com'], reply_to: email, subject: `[Naitrust ${type}] ${fields.subject || fields.name || email}`, html: `<h2>New Naitrust ${escapeHtml(type)} submission</h2><table>${rows}</table>`, text: Object.entries(fields).map(([key, value]) => `${key}: ${value}`).join('\n') }) });
  if (!sent.ok) return json(502, { message: 'Could not send your request.' });
  return json(200, { message: 'Your request has been received.', reference });
}
