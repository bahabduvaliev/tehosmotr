import { clean, esc, json, leadId, looksLikeBot, normalizePhone, prettyPhone, rateLimited, readBody, sendTelegram, tashkentTime, type Ctx } from './shared';

const SERVICES: Record<string, string> = { inspection: 'Техосмотр', gas_test: 'Опрессовка ГБО и СПГ', insurance: 'Страховка', other: 'Другое' };
const THANKS: Record<string, string> = { ru: '/spasibo/', uz: '/uz/rahmat/' };

export function leadMessage(d: Record<string, unknown>, phone: string, id: string, now = new Date()) {
  const service = SERVICES[clean(d.service, 20)] ?? SERVICES.other;
  const lang = clean(d.lang, 2) === 'uz' ? 'UZ' : 'RU';
  const lines = [`🟢 <b>Заявка #${id} · ${service}</b>`, prettyPhone(phone)];
  const name = clean(d.name, 60);
  if (name) lines.push(`Имя: ${esc(name)}`);
  lines.push(`Страница: ${esc(clean(d.page, 120) || '/')} · ${lang}`);
  const src = clean(d.utm_source, 80), med = clean(d.utm_medium, 80), camp = clean(d.utm_campaign, 120), term = clean(d.utm_term, 120);
  const source = [src && med ? `${src} / ${med}` : src || med, camp && `кампания: ${camp}`, term && `ключ: ${term}`].filter(Boolean).join(' · ');
  if (source) lines.push(`Источник: ${esc(source)}`);
  const click = clean(d.gclid, 200) || clean(d.gbraid, 200) || clean(d.wbraid, 200);
  if (click) lines.push(`gclid: <code>${esc(click)}</code>`);
  const ref = clean(d.referrer, 200);
  if (ref && !source) lines.push(`Откуда: ${esc(ref)}`);
  lines.push(`${tashkentTime(now)} (Ташкент)`);
  return lines.join('\n');
}

export async function handleLead({ request, env }: Ctx): Promise<Response> {
  const { data, isForm } = await readBody(request);
  const lang = clean(data.lang, 2) === 'uz' ? 'uz' : 'ru';
  const done = (ok: boolean, status: number, extra: Record<string, unknown> = {}) =>
    isForm && ok
      ? new Response(null, { status: 303, headers: { Location: THANKS[lang]! } })
      : json({ ok, ...extra }, status);

  if (looksLikeBot(data)) return done(true, 200); // боту отвечаем «принято», в Telegram не шлём
  const phone = normalizePhone(data.phone);
  if (!phone) return done(false, 400, { error: 'phone' });
  if (await rateLimited(env, request, 'lead', 5)) return done(false, 429, { error: 'rate' });

  const id = leadId();
  const text = leadMessage(data, phone, id);
  let sent = await sendTelegram(env, env.TELEGRAM_CHAT_ID, text);
  if (!sent && env.TELEGRAM_FALLBACK_CHAT_ID) sent = await sendTelegram(env, env.TELEGRAM_FALLBACK_CHAT_ID, text);
  return sent ? done(true, 200, { id }) : done(false, 502, { error: 'delivery' });
}
