import { json, type Ctx } from './shared';

/** Данные карточки Google Maps: часы, рейтинг, отзывы. Кэш в KV на 6 часов. */
type Intervals = [string, string][];
interface GTime { day: number; hour: number; minute: number; date?: { year: number; month: number; day: number } }
interface GPeriod { open?: GTime; close?: GTime }
export interface GPlace {
  id?: string;
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  regularOpeningHours?: { periods?: GPeriod[] };
  currentOpeningHours?: { periods?: GPeriod[] };
  reviews?: { rating?: number; relativePublishTimeDescription?: string; text?: { text?: string }; originalText?: { text?: string }; authorAttribution?: { displayName?: string } }[];
}
export interface PlaceData {
  rating?: number;
  count?: number;
  mapsUri?: string;
  placeId?: string;
  reviews: { author: string; text: string; rating: number; when: string }[];
  hours: { regular: Record<string, Intervals>; days: Record<string, Intervals> };
  fetchedAt: number;
}

const hm = (t: GTime) => `${String(t.hour ?? 0).padStart(2, '0')}:${String(t.minute ?? 0).padStart(2, '0')}`;
const iso = (d: { year: number; month: number; day: number }) => `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`;

export function normalizePlace(p: GPlace, now = Date.now()): PlaceData {
  const regular: Record<string, Intervals> = {};
  for (const per of p.regularOpeningHours?.periods ?? []) {
    if (!per.open) continue;
    // Круглосуточно: Google отдаёт один период без close
    const close = per.close && per.close.day === per.open.day ? hm(per.close) : '24:00';
    (regular[String(per.open.day)] ??= []).push([hm(per.open), close]);
  }
  // Ближайшие 7 дней с учётом праздников и особых часов
  const days: Record<string, Intervals> = {};
  const current = p.currentOpeningHours?.periods ?? [];
  for (const per of current) {
    if (!per.open?.date) continue;
    const sameDay = per.close?.date && iso(per.close.date) === iso(per.open.date);
    (days[iso(per.open.date)] ??= []).push([hm(per.open), sameDay && per.close ? hm(per.close) : '24:00']);
  }
  if (current.length) {
    // Дни из этого окна, в которые периодов нет, закрыты
    for (let i = 0; i < 7; i++) {
      const d = new Date(now + 5 * 3600_000 + i * 86400_000).toISOString().slice(0, 10);
      days[d] ??= [];
    }
  }
  const reviews = (p.reviews ?? [])
    .filter((r) => (r.rating ?? 0) >= 1 && (r.text?.text || r.originalText?.text))
    .slice(0, 3)
    .map((r) => ({
      author: r.authorAttribution?.displayName ?? 'Google',
      text: (r.text?.text ?? r.originalText?.text ?? '').slice(0, 400),
      rating: r.rating ?? 0,
      when: r.relativePublishTimeDescription ?? '',
    }));
  return { rating: p.rating, count: p.userRatingCount, mapsUri: p.googleMapsUri, placeId: p.id, reviews, hours: { regular, days }, fetchedAt: now };
}

const TTL_MS = 6 * 3600_000;
const FIELDS = 'id,rating,userRatingCount,reviews,regularOpeningHours,currentOpeningHours,googleMapsUri';

async function fetchPlace(key: string, placeId: string, lang: string): Promise<PlaceData | null> {
  const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=${lang}`, {
    headers: { 'X-Goog-Api-Key': key, 'X-Goog-FieldMask': FIELDS },
  });
  if (!res.ok) return null;
  return normalizePlace((await res.json()) as GPlace);
}

export async function handlePlace({ request, env, waitUntil }: Ctx): Promise<Response> {
  const headers = { 'Cache-Control': 'public, max-age=900' };
  const key = env.GOOGLE_PLACES_API_KEY;
  const placeId = env.GOOGLE_PLACE_ID;
  if (!key || !placeId) return json({ fallback: true }, 200, headers);

  const lang = new URL(request.url).searchParams.get('lang') === 'uz' ? 'uz' : 'ru';
  const kv = env.PLACE_CACHE;
  const cacheKey = `place:${lang}`;
  const cached = kv ? await kv.get(cacheKey).then((s) => (s ? (JSON.parse(s) as PlaceData) : null)).catch(() => null) : null;

  const refresh = async () => {
    const fresh = await fetchPlace(key, placeId, lang).catch(() => null);
    if (fresh && kv) await kv.put(cacheKey, JSON.stringify(fresh), { expirationTtl: 7 * 86400 });
    return fresh;
  };

  if (cached) {
    if (Date.now() - cached.fetchedAt > TTL_MS) waitUntil(refresh()); // отдаём старое, обновляем в фоне
    return json(cached, 200, headers);
  }
  const fresh = await refresh();
  return fresh ? json(fresh, 200, headers) : json({ fallback: true }, 200, { 'Cache-Control': 'public, max-age=60' });
}
