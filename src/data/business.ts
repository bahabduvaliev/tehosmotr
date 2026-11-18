/**
 * Единый источник данных: цены, телефон, адрес, часы, ссылки.
 * Всё на сайте, в JSON-LD и в OG-картинках берётся отсюда.
 * Пометка CONFIRM — значение взято со старого сайта или из макета и ждёт подтверждения владельцев.
 */
export const business = {
  brand: 'Autocheck Lab',
  legalName: 'AUTOCHECK DIAGNOSTICS SERVICE LLC', // CONFIRM
  domain: 'https://texnikorik.uz',

  phoneE164: '+998950556555',
  phoneDisplay: '+998 95 055 65 55',
  phonePlate: { region: '95', number: '055 65 55' },

  telegramPublic: 'https://t.me/texosmotr_ads_admin', // CONFIRM: общий аккаунт для вопросов
  telegramInsurance: 'https://t.me/Botirkhon', // страховка оформляется здесь
  instagram: 'https://www.instagram.com/autocheck.lab/',
  facebook: 'https://www.facebook.com/profile.php?id=100090958953589',

  accreditation: 'ML1016',
  law: { name: 'ПКМ № 978', url: 'https://lex.uz/docs/5324826' },

  google: {
    placeId: '', // CONFIRM: Place ID карточки в Google Maps (нужен для кнопки «Оставить отзыв» и рейтинга)
    /** Рейтинг Google, пока нет ключа API: впишите цифры из карточки. С ключом показываются живые данные. */
    rating: { value: 0, count: 0 },
    listingUrl: 'https://share.google/4dEOsgYOzbRE7uThU', // со старого сайта
  },
  yandex: {
    orgId: '172968760916', // со старого сайта: yandex.ru/profile/172968760916
  },

  geo: { lat: 41.334837, lng: 69.31327 }, // метка карты со старого сайта

  /** Часы работы (без обеда). Если подключён Google Maps, часы берутся оттуда. 0 = вс … 6 = сб. */
  hoursFallback: {
    0: [['11:00', '16:00']],
    1: [['09:00', '19:00']],
    2: [['09:00', '19:00']],
    3: [['09:00', '19:00']],
    4: [['09:00', '19:00']],
    5: [['09:00', '19:00']],
    6: [['09:00', '19:00']],
  } as Record<number, [string, string][]>,
  utcOffsetHours: 5, // Asia/Tashkent, без перехода на летнее время

  services: {
    inspection: { priceUZS: 200_000, from: false, minutes: 15 }, // CONFIRM: цена и время
    gas: { priceUZS: 450_000, from: true },
    insurance: { priceUZS: 250_000, from: true },
  },

  callbackSlaMin: 15, // CONFIRM: «перезвоним за 15 минут»

  /** Автооткрытие формы обратного звонка. По умолчанию выключено. Работает только на десктопе. */
  callbackPopup: { autoOpen: false, delaySec: 45, scrollRatio: 0.6 },

  /** Коды подтверждения сайта: Google Search Console и Яндекс Вебмастер (только сам код, без тега). */
  verification: { google: '', yandex: '' },

  analytics: {
    ga4: 'G-MTLDQ7ZVL1',
    ym: 92182474,
    ymWebvisor: true, // запись визитов и карта кликов, как на старом сайте
    googleAds: '', // CONFIRM: AW-XXXXXXXXXX
    adsLabels: { lead: '', phone: '' }, // метки конверсий Google Ads
  },
} as const;

export type ServiceKey = keyof typeof business.services;

export const fmt = (n: number) => new Intl.NumberFormat('ru-RU').format(n).replace(/ /g, ' ');

export const mapLinks = {
  yandexEmbed: (lang: 'ru' | 'uz') =>
    `https://yandex.uz/map-widget/v1/?ll=${business.geo.lng}%2C${business.geo.lat}&z=16&mode=search&oid=${business.yandex.orgId}&ol=biz&lang=${lang === 'ru' ? 'ru_RU' : 'uz_UZ'}`,
  yandexRoute: `https://yandex.uz/maps/?rtext=~${business.geo.lat}%2C${business.geo.lng}&rtt=auto`,
  googleRoute:
    `https://www.google.com/maps/dir/?api=1&destination=${business.geo.lat}%2C${business.geo.lng}&travelmode=driving` +
    (business.google.placeId ? `&destination_place_id=${business.google.placeId}` : ''),
  yandexReviews: `https://yandex.uz/maps/org/${business.yandex.orgId}/reviews/`,
  yandexWriteReview: `https://yandex.uz/maps/org/${business.yandex.orgId}/reviews/?add-review=true`,
  yandexBadge: `https://yandex.ru/sprav/widget/rating-badge/${business.yandex.orgId}?type=rating`,
  googleReviews: business.google.listingUrl,
  googleWriteReview: business.google.placeId
    ? `https://search.google.com/local/writereview?placeid=${business.google.placeId}`
    : business.google.listingUrl,
};
