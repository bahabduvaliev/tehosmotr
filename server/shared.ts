/** Общий код серверных функций (Cloudflare Pages Functions). */
export interface KV {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>;
}
export interface Env {
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
  TELEGRAM_FEEDBACK_CHAT_ID?: string;
  TELEGRAM_FALLBACK_CHAT_ID?: string;
  GOOGLE_PLACES_API_KEY?: string;
  GOOGLE_PLACE_ID?: string;
  LEAD_DRY_RUN?: string;
  PLACE_CACHE?: KV;
}
export interface Ctx { request: Request; env: Env; waitUntil(p: Promise<unknown>): void }

export const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers } });

export const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export const clean = (v: unknown, max: number) => (typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, max) : '');

/** Тело запроса: JSON (скрипт сайта) или обычная форма (без JavaScript). */
export async function readBody(request: Request): Promise<{ data: Record<string, unknown>; isForm: boolean }> {
  const type = request.headers.get('content-type') ?? '';
  if (type.includes('application/json')) {
    const data = await request.json().catch(() => ({}));
    return { data: data && typeof data === 'object' ? (data as Record<string, unknown>) : {}, isForm: false };
  }
  const fd = await request.formData().catch(() => null);
  const data: Record<string, unknown> = {};
  fd?.forEach((v, k) => { if (typeof v === 'string') data[k] = v; });
  return { data, isForm: true };
}

/** Номер в формате +998XXXXXXXXX или null. */
export function normalizePhone(raw: unknown): string | null {
  let d = String(raw ?? '').replace(/\D/g, '');
  if (d.length === 12 && d.startsWith('998')) d = d.slice(3);
  if (d.length === 10 && d.startsWith('8')) d = d.slice(1);
  return d.length === 9 ? `+998${d}` : null;
}
export const prettyPhone = (e164: string) => e164.replace(/^\+998(\d{2})(\d{3})(\d{2})(\d{2})$/, '+998 $1 $2 $3 $4');

/** Бот: поле-ловушка заполнено или форма отправлена быстрее, чем за 2,5 секунды. */
export function looksLikeBot(data: Record<string, unknown>, now = Date.now()) {
  if (clean(data.company, 50)) return true;
  const started = Number(data.ts_start);
  return Number.isFinite(started) && started > 0 && now - started < 2500;
}

/** Ограничение частоты по IP. Без KV не ограничивает. */
export async function rateLimited(env: Env, request: Request, scope: string, limit: number) {
  const kv = env.PLACE_CACHE;
  if (!kv) return false;
  const ip = request.headers.get('cf-connecting-ip') ?? 'unknown';
  const key = `rl:${scope}:${ip}:${Math.floor(Date.now() / 600_000)}`;
  const count = Number((await kv.get(key)) ?? 0);
  if (count >= limit) return true;
  await kv.put(key, String(count + 1), { expirationTtl: 660 });
  return false;
}

export function tashkentTime(now = new Date()) {
  const d = new Date(now.getTime() + 5 * 3600_000);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getUTCDate())}.${p(d.getUTCMonth() + 1)}.${d.getUTCFullYear()} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}`;
}

export const leadId = () => {
  const abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  return Array.from(bytes, (b) => abc[b % abc.length]).join('');
};

/** Отправка в один или несколько чатов (id через запятую). true, если дошло хотя бы в один. */
export async function sendTelegram(env: Env, chatIds: string | undefined, text: string): Promise<boolean> {
  const ids = (chatIds ?? '').split(',').map((x) => x.trim()).filter(Boolean);
  if (env.LEAD_DRY_RUN !== '1' && !ids.length) return false;
  const results = await Promise.all((ids.length ? ids : ['dry-run']).map((id) => sendOne(env, id, text)));
  return results.some(Boolean);
}

/** Отправка в один чат с двумя повторами. */
async function sendOne(env: Env, chatId: string, text: string): Promise<boolean> {
  if (env.LEAD_DRY_RUN === '1') {
    console.log('[dry run] сообщение в Telegram не отправлено (LEAD_DRY_RUN=1)');
    return true;
  }
  if (!env.TELEGRAM_BOT_TOKEN) return false;
  const url = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;
  const body = JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: true });
  for (const wait of [0, 300, 1000]) {
    if (wait) await new Promise((r) => setTimeout(r, wait));
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
      if (res.ok) return true;
      if (res.status >= 400 && res.status < 500 && res.status !== 429) break; // ошибка настройки, повтор не поможет
    } catch { /* сеть: пробуем ещё раз */ }
  }
  return false;
}
