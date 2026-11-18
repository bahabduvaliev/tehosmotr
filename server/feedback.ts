import { clean, esc, json, looksLikeBot, normalizePhone, prettyPhone, rateLimited, readBody, sendTelegram, tashkentTime, type Ctx } from './shared';

const KIND: Record<string, string> = { complaint: '⚠️ <b>Жалоба</b>', suggestion: '💡 <b>Предложение</b>', message: '💬 <b>Сообщение</b>' };

export function feedbackMessage(d: Record<string, unknown>, now = new Date()) {
  const kind = KIND[clean(d.type, 20)] ?? KIND.message;
  const phone = normalizePhone(d.phone);
  const rawPhone = clean(d.phone, 30);
  const lang = clean(d.lang, 2) === 'uz' ? 'UZ' : 'RU';
  return [
    `${kind} · с сайта`,
    `«${esc(clean(d.text, 1000))}»`,
    `Телефон для ответа: ${phone ? prettyPhone(phone) : rawPhone ? esc(rawPhone) : 'не указан'}`,
    `Страница: ${esc(clean(d.page, 120) || '/')} · ${lang} · ${tashkentTime(now)}`,
  ].join('\n');
}

export async function handleFeedback({ request, env }: Ctx): Promise<Response> {
  const { data } = await readBody(request);
  if (looksLikeBot(data)) return json({ ok: true });
  if (clean(data.text, 1000).length < 3) return json({ ok: false, error: 'text' }, 400);
  if (await rateLimited(env, request, 'feedback', 3)) return json({ ok: false, error: 'rate' }, 429);
  // Жалобы идут руководителю. Если отдельный чат не задан, отправляем в общий.
  const sent = await sendTelegram(env, env.TELEGRAM_FEEDBACK_CHAT_ID ?? env.TELEGRAM_CHAT_ID, feedbackMessage(data));
  return sent ? json({ ok: true }) : json({ ok: false, error: 'delivery' }, 502);
}
