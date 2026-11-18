> **Изменения v3 (11.11.2026), сайт собран с ними:**
> - Техосмотр вынесен на отдельную страницу `/tehosmotr/` (`/uz/texnik-korik/`): документы, время, шаги, периодичность, форма звонка. Главная осталась общим входом с карточками услуг.
> - Страховка не имеет страницы: карточка и пункт меню открывают Telegram `https://t.me/Botirkhon`.
> - Серверный код лежит в `server/`, тонкие обёртки в `functions/api/`.
> - Sitemap генерируется своим файлом `src/pages/sitemap.xml.ts`.
> Всё остальное ниже действует как написано.

# Техническое задание: rebuild of texnikorik.uz (Autocheck Lab), v2

> **For Claude Code (next session):** this file is the complete brief. Read all of it before writing code.
> Build exactly what is specified here. Where a fact is marked **[CONFIRM]**, use the provisional value,
> keep it in the single data file (§4.3), and list it in your final report as still unconfirmed.
> Ask the user only for the items in §14 "Inputs needed", and only when you reach the step that needs them.
> Visual reference: the approved mockups (mobile + desktop, "Direction C · Номер") are in the claude.ai artifact
> "Autocheck Lab Redesign" (https://claude.ai/artifact/8B7rb9GGzJEoUGZBryyntR). Read it with the Artifact tool if you can; §10 restates everything needed.

Prepared 9 Nov 2026 from a live crawl of texnikorik.uz (6 pages) plus screenshots. v2 incorporates the owner's decisions:
pre-purchase inspection is **dropped**, **опрессовка ГБО и СПГ** is added, insurance is secondary, design direction **C (Номер)** is approved
with a Yandex map, route buttons, a callback pop-up, Google/Yandex reviews and a complaint/suggestion form in the footer.

---

## 1. Project summary

**Business:** Autocheck Lab (legal: AUTOCHECK DIAGNOSTICS SERVICE LLC [CONFIRM]), Tashkent. Accredited lab for vehicle technical condition, accreditation **№ ML1016** (Uzstandard accreditation centre).

**Services, in order of importance:**
1. **Техосмотр / Texnik koʻrik.** The main service and the main focus of every page. Vehicle inspection, entered into the ГАИ (DAN) database on the spot. **200 000 сум** [CONFIRM: the old UZ page said 150 000], ~15 min [CONFIRM: old pages say 5–10 and 10–15].
2. **Опрессовка ГБО и СПГ / GBO va SPG opressovkasi.** Pressure test of gas equipment; the act is required for техосмотр of gas-powered cars. **от 450 000 сум.**
3. **Автострахование / Avtosugʻurta.** Secondary, visually quieter. **от 250 000 сум.** Unlimited drivers, can be issued online.

**Removed:** pre-purchase inspection (автоподбор / проверка авто перед покупкой). Don't mention it anywhere; `/autocheck` redirects to `/`.

**Site's single job:** a visitor from a Google Ads click on a phone sees, on the first screen, *what we do, how much, and the phone number*, then right below *what to bring* and *where we are, with a route*. They call, write on Telegram, or leave their number in the callback pop-up, which goes to Telegram so the manager calls back.

**Success criteria**
| Metric | Target |
|---|---|
| Lighthouse mobile (Performance / A11y / Best Practices / SEO) | ≥ 95 / 100 / 100 / 100 (map iframe below the fold, lazy) |
| LCP (lab, mobile, slow 4G) | ≤ 2.0 s |
| CLS | ≤ 0.05 |
| INP | ≤ 200 ms |
| Own JS shipped per page (excl. analytics, map, widgets) | ≤ 20 KB gzip |
| Tap-to-call | Phone plate in the first screen + sticky bar on every page |
| Lead → Telegram delivery | 100% of valid submissions, < 3 s |
| Lead message contains | service, phone, page, language, UTM, gclid, local time |
| Open/closed light | Matches the Google Maps listing's hours, including special hours |

---

## 2. Audit of the current site (evidence for the decisions below)

### 2.1 Critical: losing leads from paid traffic now
1. **Phone not tappable on 4 of 6 pages.** Home, `/tehosmotr`, `/landing_uz` show the number as plain text and set `<meta name="format-detection" content="telephone=no">`. Zero `tel:` links on those pages.
2. **The only `tel:` link is broken.** `/autocheck` → `tel:+99895055655` (11 digits). Correct: `tel:+998950556555`.
3. **First screen has nothing to act on.** `100vh` stock-photo hero with a headline only.
4. **No Google Ads conversion tag** (`AW-`), no events for phone/Telegram/form. GA4 `G-MTLDQ7ZVL1` and Yandex Metrika `92182474` are injected after a **2-second `setTimeout`**.
5. **Prices and facts contradict each other:** техосмотр 200 000 (RU) vs 150 000 (UZ); insurance 384 000 vs 168 000; duration 5–10 vs 10–15 min; landmark "Horrot" vs "завод Crafers".
6. **Uzbek page broken:** title `new Autocheck (uzb)`, no description, English template sentence on screen ("I am ready for a long road flight…"), Russian form texts, 2025 prices, no hreflang.

### 2.2 SEO
7. No `lang` attribute; no `hreflang`. 8. `/tehosmotr` and `/landing_uz` have no H1/H2. 9. No `LocalBusiness`/`Service`/`Offer` JSON-LD. 10. Sitemap lists template junk `/multilink/location` ("Отзовик", description "…for a car dealership") and `/tolkopositivnieotzivi` ("only positive reviews", a review-gating risk under Google's policy). 11. Home ≈ 100 words. 12. Empty `alt`s; meta keywords "купить авто"; `og:title` brand mismatch. 13. Five spellings of the brand.

### 2.3 UX, trust, design
14. Two unrelated designs. 15. Stock hero photo. 16. ML1016 buried in the footer. 17. US phone mask `+1(999)999-9999`. 18. Three Telegram accounts incl. a personal one; Instagram link with `hl=af`. 19. "Made on Tilda" badge.

### 2.4 Performance
20. 6 CSS + 14 JS Tilda files, ~450 KB compressed before fonts/map/analytics; 278 KB hero JPEG; 78 KB polyfill. Record a PageSpeed Insights baseline on the old site before launch.

---

## 3. Scope

**Phase 1 (build now):**
- Static bilingual site: RU (default) + UZ Latin.
- Pages: home = техосмотр landing; опрессовка; страхование; контакты; privacy; review-request page; thank-you pages; 404.
- Callback pop-up form → Telegram (managers' group).
- Complaint/suggestion form in the footer → Telegram (owner's chat).
- Google Maps listing data (hours → open/closed light, rating, review count, latest reviews) via a cached serverless endpoint.
- Yandex Maps embed + route buttons for Yandex and Google; Yandex rating and reviews via Yandex's official widgets.
- Tracking: GA4 + Google Ads + Yandex Metrika, with defined events.
- SEO: meta, JSON-LD, hreflang, sitemap, robots, OG images.
- 301s from all old URLs, and a deployment plan.

**Phase 2 (don't build; keep the architecture ready):** Telegram lead-status buttons → Google Ads offline conversion import; Git-based CMS for owners; Uzbek Cyrillic; FAQ/blog articles.

**Out of scope:** payments, online booking calendar, accounts, pre-purchase inspection.

---

## 4. Tech stack and architecture

### 4.1 Stack
- **Astro** (latest stable), `output: 'static'`, TypeScript strict, i18n routing (`defaultLocale: 'ru'`, `locales: ['ru','uz']`, `prefixDefaultLocale: false`), `trailingSlash: 'always'`.
- **Styling:** plain CSS custom properties (tokens in §10.2) + Astro scoped styles. No Tailwind, no UI framework, no jQuery.
- **JS:** vanilla islands only: phone mask + callback dialog, feedback form, open/closed status, sticky-bar visibility, attribution, analytics helpers, click-to-load widgets.
- **Images:** `astro:assets` (AVIF/WebP, `srcset`, explicit dimensions). Few images are needed: logo, OG images, optionally the accreditation certificate.
- **Fonts:** self-hosted WOFF2 **Onest** (400/600/800) + **IBM Plex Mono** (500/600), subset Latin + Latin Ext + Cyrillic, must render **U+02BB (ʻ)** for Uzbek *oʻ gʻ* (Google Fonts' Latin subset includes U+02BB-02BC; verify the glyph exists; fall back to U+2018 if not). `font-display: swap`; preload Onest 800 (hero) only.
- **Hosting:** Cloudflare Pages (static `dist/`) + **Pages Functions** in `/functions` + one **KV namespace** `PLACE_CACHE`. Secrets in Pages env vars.
- **Repo:** GitHub; `main` → production, PRs → preview deployments (preview sends `X-Robots-Tag: noindex`).
- **Tooling:** Node LTS, npm, Prettier, `astro check`, Playwright tests (§12).

### 4.2 Structure
```
/src
  /data/business.ts        ← single source of truth (prices, phone, hours fallback, address, geo, IDs, links)
  /i18n/ru.ts, uz.ts       ← UI strings + page copy
  /components/  Header, Nav, LangSwitch, OpenStatus, PhonePlate, Hero, ServiceTickets, BundleNote,
                YandexMap, RouteButtons, ReviewsBlock, FeedbackForm, CallbackDialog, StickyBar, FAQ, Footer, JsonLd
  /layouts/Base.astro      ← <html lang>, meta, hreflang, OG, JSON-LD, analytics, CallbackDialog (once per page)
  /pages/      index, opressovka-gbo, strahovanie, kontakty, privacy, otzyv, spasibo, 404
  /pages/uz/   index, gbo-opressovka, sugurta, kontaktlar, maxfiylik, sharh, rahmat
/functions/api/lead.ts       ← POST callback form → Telegram (managers)
/functions/api/feedback.ts   ← POST complaint/suggestion → Telegram (owner)
/functions/api/place.ts      ← GET cached Google Place data (hours, rating, reviews)
/public/_redirects, _headers, robots.txt, favicons, og/*.png
/tests/
```

### 4.3 Single data file (`src/data/business.ts`)
Every price, phone, address, hour and link on the site, in JSON-LD and in OG images **must** come from this file.
```ts
export const business = {
  brand: 'Autocheck Lab',
  legalName: 'AUTOCHECK DIAGNOSTICS SERVICE LLC',            // [CONFIRM]
  domain: 'https://texnikorik.uz',
  phoneE164: '+998950556555',
  phoneDisplay: '+998 95 055 65 55',
  phonePlate: { region: '95', number: '055 65 55' },         // rendered as the licence-plate badge
  telegramPublic: 'texosmotr_ads_admin',                     // [CONFIRM] which account answers clients
  instagram: 'https://www.instagram.com/autocheck.lab/',
  facebook: 'https://www.facebook.com/profile.php?id=100090958953589',
  accreditation: 'ML1016',
  google: { placeId: 'TODO', mapsUri: 'https://share.google/4dEOsgYOzbRE7uThU' }, // [CONFIRM] Place ID
  yandex: { orgId: '172968760916' },                         // [CONFIRM] from yandex.ru/profile/172968760916
  address: {
    ru: { street: 'ул. Зиёлилар, 42', city: 'Ташкент', landmark: 'Бывший завод Лакокраски, рядом ресторан «Horrot»' }, // [CONFIRM]
    uz: { street: 'Ziyolilar koʻchasi, 42', city: 'Toshkent', landmark: 'Sobiq Lakokraska zavodi, «Horrot» restorani yonida' },
  },
  geo: { lat: 0, lng: 0 },                                   // [CONFIRM] exact gate coordinates
  hoursFallback: [{ days: ['Mo','Tu','We','Th','Fr','Sa'], opens: '09:00', closes: '19:00' }], // used if Google data unavailable [CONFIRM]
  timezone: 'Asia/Tashkent',
  services: {
    inspection: { slug: { ru: '/', uz: '/uz/' }, priceUZS: 200000, from: false, minutes: 15, weight: 'main' },   // [CONFIRM] price + time
    gasTest:    { slug: { ru: '/opressovka-gbo/', uz: '/uz/gbo-opressovka/' }, priceUZS: 450000, from: true, weight: 'normal' },
    insurance:  { slug: { ru: '/strahovanie/', uz: '/uz/sugurta/' }, priceUZS: 250000, from: true, weight: 'minor' },
  },
  analytics: { ga4: 'G-MTLDQ7ZVL1', ym: 92182474, googleAds: 'AW-XXXXXXXXX' },  // AW id + labels from owner
  callbackPopup: { autoOpen: false, autoOpenDelaySec: 45, autoOpenScrollRatio: 0.6, desktopOnly: true },        // §6.8
} as const;
```
Format prices with a narrow no-break space via `Intl.NumberFormat('ru-RU')`: `200 000 сум`, `от 450 000 сум`, UZ `450 000 soʻmdan`.

---

## 5. Information architecture, URLs, redirects

| Page | RU URL | UZ URL | Primary query |
|---|---|---|---|
| Home = Техосмотр (+ links to other services) | `/` | `/uz/` | техосмотр ташкент / texnik koʻrik toshkent |
| Опрессовка ГБО и СПГ | `/opressovka-gbo/` | `/uz/gbo-opressovka/` | опрессовка гбо ташкент, опрессовка газового баллона, акт опрессовки |
| Автострахование | `/strahovanie/` | `/uz/sugurta/` | страховка авто ташкент, ОСГО [CONFIRM product name] |
| Контакты | `/kontakty/` | `/uz/kontaktlar/` | brand + адрес |
| Privacy policy | `/privacy/` | `/uz/maxfiylik/` | — |
| Review request (neutral; for QR codes) | `/otzyv/` noindex | `/uz/sharh/` noindex | — |
| Thank-you (no-JS form fallback) | `/spasibo/` noindex | `/uz/rahmat/` noindex | — |
| 404 | `/404` | — | — |

- No auto-redirect by browser language. Language switch links to the **equivalent** page.
- `public/_redirects` (301; keep permanently, old URLs live in QR codes, Instagram bio and Ads):
```
/tehosmotr             /                  301
/autocheck             /                  301
/landing_ru            /                  301
/landing_uz            /uz/               301
/multilink/location    /kontakty/         301
/tolkopositivnieotzivi /otzyv/            301
/page21333631.html     /                  301
/page40713020.html     /                  301
```

---

## 6. Page anatomy (Direction C · Номер)

### 6.1 Order of blocks (service pages; home shown)
1. **Yellow band:** header + hero (§6.2–6.3)
2. **Услуги и цены:** service tickets (§6.4). This replaces the old "4-answer grid"; there is no grid after the phone plate.
3. **Где мы:** Yandex map + address + hours + route buttons (§6.5)
4. Page-specific content (§6.6), FAQ
5. **Footer:** reviews, complaint/suggestion, contacts, legal (§6.9)
6. Mobile sticky bar (§6.7). Callback dialog mounted once per page (§6.8).

**First-screen rule (360×640):** status light, H1, price + duration, phone plate, and the "Перезвоните мне" button are fully visible without scrolling.

### 6.2 Header
- **Mobile:** logo (engine icon + AUTOCHECK) · `RU | UZ`. Not sticky (the sticky bar does that job).
- **Desktop (≥ 1024 px):** sticky, yellow, ≤ 72 px. Logo · nav (Техосмотр · Опрессовка ГБО · Страховка · Контакты; current page underlined) · OpenStatus · `RU | UZ` · small phone plate (a `tel:` link).

### 6.3 Hero (yellow band, `--signal`)
- **OpenStatus pill** (§6.10): "● Открыто до 19:00" + small Google Maps pin icon; tap opens the Google Maps listing.
- **H1**, two lines: line 1 the service name, huge and heavy ("Техосмотр"); line 2 "за 15 минут · 200 000 сум". Opressovka page: "Опрессовка ГБО и СПГ" / "от 450 000 сум · акт сразу" [CONFIRM]. Insurance: "Автострахование" / "от 250 000 сум · без ограничения водителей".
- **Phone plate** (`PhonePlate`): the number drawn as an Uzbek licence plate `[95 | 055 65 55 | flag UZ]`, mono font, thick black border, white fill. It is an `<a href="tel:+998950556555">` with `aria-label="Позвонить +998 95 055 65 55"`. Caption: "↑ нажмите, чтобы позвонить". **The plate is the only place the plate motif is used** (plus the small header copy on desktop).
- **Button:** "Перезвоните мне" (black bg, yellow text) → opens the callback dialog.
- Desktop: two columns. Left: H1 (≈112 px), subline, one-line accreditation sentence ("Аккредитованная лаборатория ML1016. Сразу вносим в базу ГАИ."), buttons [Перезвоните мне] [Telegram]. Right: a card with "Позвоните, мы на месте", the large plate, the caption, the address line.

### 6.4 Service tickets ("Услуги и цены")
Three cards on every page, the current page's service first and visually dominant:
| Ticket | Weight | Content |
|---|---|---|
| Техосмотр | **main**: 3 px border, biggest name and price, yellow marker under the price | 200 000 сум · "15 минут · сразу в базе ГАИ" · "С собой: техпаспорт" [CONFIRM full list] |
| Опрессовка ГБО и СПГ | normal: 2 px border | от 450 000 сум · "Нужна для техосмотра, если авто на газу" · "Выдаём акт опрессовки" [CONFIRM] |
| Автострахование | **minor**: 1.5 px border, smaller price | от 250 000 сум · "Без ограничения водителей · можно онлайн" |

- Each ticket links to its page (arrow ↗ top-right). On the page of that service, the ticket isn't a link.
- Below the tickets, the **bundle note**: "Машина на газу? Опрессовка и техосмотр за один визит." / "Mashinangiz gazdami? Opressovka va texnik koʻrik bitta tashrifda."
- Mobile: tickets stacked. Desktop: one row, columns `1.25fr 1fr 1fr`.

### 6.5 "Где мы": Yandex map + routes (no photos)
- **YandexMap:** iframe `https://yandex.uz/map-widget/v1/?ll={lng},{lat}&z=16&pt={lng},{lat},pm2rdm&lang={ru_RU|uz_UZ}` (note: Yandex takes lon,lat). Alternative showing the organisation card: `?mode=search&oid={orgId}&ol=biz&z=16` [VERIFY which looks better]. `loading="lazy"`, `title="Карта: Autocheck Lab"`, 2 px black border, 12 px radius. Mobile 4:3; desktop min-height 380 px, left column (`1.5fr`).
- Next to it (desktop) / below it (mobile): address (bold), landmark, the hours line + OpenStatus.
- **RouteButtons**: two large buttons that can't be confused with each other:
  - **Яндекс Карты · Построить маршрут**: red tile `#FC3F1D` with a white pin → `https://yandex.uz/maps/?rtext=~{lat},{lng}&rtt=auto`
  - **Google Maps · Построить маршрут**: white tile with the multicolour Google pin → `https://www.google.com/maps/dir/?api=1&destination={lat},{lng}&destination_place_id={placeId}&travelmode=driving`
  - Both: full-width on mobile, 2 px black border, 12 px radius, ≥ 56 px tall, app name bold + action small, ↗ arrow, `target="_blank" rel="noopener"`. These links open the native apps on phones when installed.

### 6.6 Page-specific content
- **Home (техосмотр):** documents to bring; how it works (3 real steps [CONFIRM]); how often you need it (ПКМ 978 table from the old `/tehosmotr`: < 10 years voluntary; 10–15 years every 2 years; > 15 years yearly; taxis every 6 months; link to lex.uz) [CONFIRM still current]; accreditation ML1016 with certificate image if provided; FAQ.
- **Опрессовка ГБО и СПГ:** what it is and who needs it (gas cars before техосмотр), what's checked [CONFIRM], time [CONFIRM], what you get (акт опрессовки), price by gas type (метан/пропан) or cylinder count [CONFIRM], "сделаем техосмотр в тот же визит", FAQ.
- **Автострахование:** what's covered [CONFIRM product name, e.g. ОСГО ВТС], unlimited drivers, documents [CONFIRM], how online issuance works [CONFIRM], FAQ.
- **Контакты:** the same "Где мы" block, the inline callback form (no-JS target, §6.8), Telegram, Instagram, Facebook, legal details.

### 6.7 Sticky bottom bar (mobile < 768 px)
Black bar, three buttons, 44–48 px tall + safe-area inset: **Позвонить** (yellow, `tel:`) · **Telegram** · **Маршрут** (scrolls to "Где мы"). Hidden while the hero is in view (IntersectionObserver) and while any input/textarea is focused. This is the only permanently floating element.

### 6.8 Callback pop-up ("Перезвоните мне")
- Triggers: hero button, desktop header/hero, any element with `data-callback`. Each trigger may preselect a service (`data-service="gas_test"`).
- Implementation: native `<dialog>` with `showModal()` (built-in focus trap and Esc), mounted once in `Base.astro`. Mobile: bottom sheet (rounded top, drag handle look, full width). Desktop: centered, 440 px. Closes on Esc, on the × button (40 px, `aria-label="Закрыть"`), and on backdrop click. Returns focus to the trigger. Locks page scroll while open.
- Content: title "Перезвоним за 15 минут" [CONFIRM SLA] · phone field with fixed `+998` prefix and mask `__ ___ __ __` · service chips (Техосмотр / Опрессовка / Страховка; one selected, default = current page's service) · button "Жду звонка" · line "или позвоните сами: +998 95 055 65 55" (tel link).
- States: idle → sending (button disabled) → success inside the dialog ("Заявка принята. Перезвоним с номера +998 95 055 65 55." + "Закрыть") → error inline ("Не отправилось. Позвоните: +998 95 055 65 55"), keeping the entered number.
- **No-JS:** triggers are `<a href="/kontakty/#callback">`; JS intercepts and opens the dialog. The inline form on `/kontakty/` posts to `/api/lead`, which then `303`-redirects to `/spasibo/`.
- **Auto-open option** (`business.callbackPopup.autoOpen`, **default `false`**). When an owner turns it on, it only ever: runs on desktop (≥ 1024 px; Google penalises intrusive mobile interstitials), opens after `autoOpenDelaySec` **or** `autoOpenScrollRatio` scroll, once per session (`sessionStorage`), never after the visitor already tapped call/Telegram/route or submitted a form.

### 6.9 Footer (black)
Order on mobile; on desktop three columns (`1.3fr 1fr .85fr`) with legal line full-width under them.

**A. Отзывы (ReviewsBlock).** Two cards: Google and Яндекс Карты. Each card: source icon + name; rating (big mono number) + stars + review count; up to 2 latest review excerpts (Google only; author name + date + 2-line clamp, Google attribution per Places policy) or skeleton while loading; buttons **Читать** (ghost) and **Оставить отзыв** (white). Desktop: cards stacked, buttons on the right side of each card.
- Google data: from `/api/place` (§7.7): `rating`, `userRatingCount`, `reviews[]`, `googleMapsUri`. Read → `googleMapsUri`; Write → `https://search.google.com/local/writereview?placeid={placeId}`.
- Yandex data: there's no public Yandex reviews API, so use Yandex Business's official widgets: rating badge iframe `https://yandex.ru/sprav/widget/rating-badge/{orgId}?type=rating` inside the card, and the reviews widget `https://yandex.ru/maps-reviews-widget/{orgId}?comments` loaded only on "Читать" (expands under the card) [VERIFY both URLs in Yandex Business → Виджеты]. Write → `https://yandex.uz/maps/org/{orgId}/reviews/` [VERIFY a direct "add review" parameter]. Fallback if widgets fail: a manual `rating`/`count` in `business.ts`, updated monthly.
- Every customer gets the same "Оставить отзыв" buttons. Never filter who is asked.

**B. Обратная связь (FeedbackForm).** Collapsed by default to one row: **"Жалоба или предложение?"** + small "Прочитает руководитель" + button **Написать**. Expands inline (no modal) to: two toggle chips **Жалоба / Предложение** (optional; none = "Сообщение") · one textarea "Что случилось или что улучшить?" (required, 3–1000 chars) · optional phone "Телефон, если нужен ответ" · **Отправить**. Success inline: "Спасибо, сообщение у руководителя." Anonymous allowed. Button text toggles Написать ↔ Свернуть. Sends to `/api/feedback` (§7.6), which goes to the **owner's** chat, not the managers' group.

**C. Контакты.** Phone (tel link), address, hours, Telegram / Instagram / Facebook icons (36 px, labelled).

**D. Legal line.** © legal name · Аккредитация ML1016 · Политика конфиденциальности · RU/UZ.

### 6.10 OpenStatus (connected to Google Maps)
- Data: `regularOpeningHours.periods` + `currentOpeningHours` (special/holiday hours for the coming days) from `/api/place`, cached in KV (§7.7). Fallback: `business.hoursFallback`.
- Render: build-time HTML shows static hours ("Пн–Сб 9:00–19:00") so there's no layout shift. A small script fetches `/api/place` on idle, computes status in **Asia/Tashkent (UTC+5, no DST)**, and shows:
  - open → green dot "Открыто до 19:00" / "19:00 gacha ochiq"
  - closed → grey dot "Закрыто · откроемся в 9:00" / "…в пн в 9:00" / "Yopiq · 9:00 da ochamiz"
  - special hours today → use them ("Сегодня до 15:00")
- Recompute every minute. Tap/click → `googleMapsUri` (new tab). A small Google Maps pin icon in the pill tells the visitor where the data comes from.

---

## 7. Forms, endpoints, Telegram

### 7.1 Shared rules
- Accept `application/json` and `application/x-www-form-urlencoded`.
- Honeypot field `company`; reject (fake 200) if filled or if `now - ts_start < 2.5 s`.
- Rate limit per IP: lead 5 / 10 min, feedback 3 / 10 min (Cloudflare WAF rule or KV counter).
- Escape all user input for Telegram `parse_mode: 'HTML'`. Never log phone numbers or message text.
- Retry Telegram twice (300 ms, 1 s). Return `200 {ok:true,id}` or `502 {ok:false}`.

### 7.2 Phone field
`type="tel" inputmode="tel" autocomplete="tel"`, fixed `+998` prefix, mask `__ ___ __ __`; valid = exactly 9 digits after 998. Normalise pasted `+998950556555`, `95 055 65 55`, `8-95…` to E.164.

### 7.3 `/api/lead` (callback)
Fields: `phone` (required), `service` ∈ {`inspection`,`gas_test`,`insurance`,`other`}, `name` (optional, inline form only), hidden `lang`, `page`, `utm_*`, `gclid`, `gbraid`, `wbraid`, `referrer`, `ts_start`, `company`. Sends to `TELEGRAM_CHAT_ID`.

### 7.4 Lead message
```
🟢 Заявка #A7K2 · Техосмотр
+998 95 055 65 55
Страница: /opressovka-gbo/ · RU
Источник: google / cpc · кампания: gbo_ru · ключ: опрессовка гбо ташкент
gclid: Cj0KCQiA…
09.11.2026 11:42 (Ташкент)
```
Omit empty fields. Lead id = 4 random chars (for phase-2 status tracking).

### 7.5 Bot setup
The current Tilda forms probably use Tilda's built-in Telegram integration. The new site uses **its own bot**:
1. @BotFather → `/newbot` → token.
2. Group "Autocheck · заявки" with managers + bot → `TELEGRAM_CHAT_ID`.
3. Owner's private chat with the bot (or a private group "Autocheck · жалобы") → `TELEGRAM_FEEDBACK_CHAT_ID`.
4. Helper script `npm run tg:chat-id` prints chat ids from `getUpdates`.
5. Preview environment uses a separate test group.
If the owner already has a custom bot, reuse its token.

### 7.6 `/api/feedback`
Fields: `type` ∈ {`complaint`,`suggestion`,`message`}, `text` (3–1000), `phone` (optional), `lang`, `page`, `ts_start`, `company`. Message:
```
⚠️ Жалоба · с сайта
«Долго ждал в очереди, никто не вышел…»
Телефон для ответа: +998 90 123 45 67 (или: аноним)
Страница: / · RU · 09.11.2026 18:05
```
(💡 for Предложение, 💬 for Сообщение.)

### 7.7 `/api/place` (Google Maps listing data)
- Calls **Places API (New)** Place Details: `GET https://places.googleapis.com/v1/places/{GOOGLE_PLACE_ID}` with header `X-Goog-FieldMask: id,displayName,rating,userRatingCount,reviews,regularOpeningHours,currentOpeningHours,googleMapsUri` and `languageCode=ru` (second cached copy for `uz` or `en` if Uzbek isn't supported).
- Cache in KV `PLACE_CACHE` for 6 h (stale-while-revalidate: serve cached JSON, refresh in `waitUntil` if older than 6 h). Returns trimmed JSON (no API key, max 3 reviews). `Cache-Control: public, max-age=900`.
- If Google fails and the cache is empty → `{ fallback: true }`; the UI uses `business.hoursFallback` and hides the Google rating number (shows only the buttons).
- Key `GOOGLE_PLACES_API_KEY` server-side only, restricted to Places API. At ~4–8 calls/day, cost is within Google's free usage, but billing must be enabled on the Cloud project.

### 7.8 Env vars
`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `TELEGRAM_FEEDBACK_CHAT_ID`, `TELEGRAM_FALLBACK_CHAT_ID` (optional), `GOOGLE_PLACES_API_KEY`, `GOOGLE_PLACE_ID`, `LEAD_TEST_MODE`; KV binding `PLACE_CACHE`.

### 7.9 Phase 2 (prepare, don't build)
Inline buttons under each lead (`✅ Клиент приехал` · `📞 Не дозвонились` · `🚫 Спам`) → bot webhook stores `{leadId, gclid, status, ts}` (no phone) → CSV for Google Ads offline conversions. Uzbekistan's personal-data law has a data-localisation requirement for databases of citizens' personal data; Phase 1 stores no lead database. Check with a local lawyer before Phase 2 stores anything personal.

---

## 8. Analytics and conversion tracking

### 8.1 Tags
- One **gtag.js** in `<head>`, `async`, **no artificial delay**, configured for GA4 `G-MTLDQ7ZVL1` and Google Ads `AW-…`.
- **Yandex Metrika** `92182474` loaded on idle/first interaction; Webvisor off by default [owner choice].
- Attribution: on landing, store `gclid`, `gbraid`, `wbraid`, `utm_*` in `sessionStorage` + 90-day first-party cookie `_ac_attr`; inject into both forms.

### 8.2 Events
| Event (GA4) | Trigger | Ads conversion | Primary? |
|---|---|---|---|
| `generate_lead` | `/api/lead` returned ok | Lead form | Primary |
| `phone_click` | any `tel:` (plate, sticky bar, dialog, footer) | Phone click (site) | Primary |
| `telegram_click` | any t.me link | Telegram click | Secondary |
| `callback_open` | dialog opened (`trigger` param: hero/header/auto) | — | — |
| `route_click` | route button (`provider`: yandex/google) | Directions | Secondary |
| `status_click` | OpenStatus pill | — | — |
| `review_click` | reviews (`provider`, `action`: read/write) | — | — |
| `feedback_submit` | `/api/feedback` ok (`type`) | — | — |
| `lang_switch` | RU/UZ | — | — |

All events carry `service` and `lang`. Enhanced conversions for leads: `gtag('set','user_data',{phone_number:'+998…'})` before the lead conversion. Calls from ads via the Ads call asset. Final URL suffix: `utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_term={keyword}&utm_content={creative}`. No consent banner by default [CONFIRM].

---

## 9. SEO

### 9.1 Meta (≤ 60 / ≤ 155 chars; prices generated from `business.ts`)
| Page | `<title>` | Meta description |
|---|---|---|
| `/` | Техосмотр в Ташкенте за 15 минут · 200 000 сум | Аккредитованная лаборатория ML1016. Техосмотр без очереди, сразу вносим в базу ГАИ. Зиёлилар, 42 · Пн–Сб 9–19 |
| `/opressovka-gbo/` | Опрессовка ГБО и СПГ в Ташкенте · от 450 000 сум | Опрессовка газового оборудования с актом для техосмотра. Сделаем техосмотр в тот же визит. Autocheck Lab, Зиёлилар, 42 |
| `/strahovanie/` | Автострахование в Ташкенте · от 250 000 сум | Страховка без ограничения водителей, на месте или онлайн. Autocheck Lab, Зиёлилар, 42 · Пн–Сб 9–19 |
| `/uz/` | Toshkentda texnik koʻrik 15 daqiqada · 200 000 soʻm | ML1016 akkreditatsiyalangan laboratoriya. Navbatsiz texnik koʻrik, DAN bazasiga darhol kiritamiz. Ziyolilar 42 |
| `/uz/gbo-opressovka/` | Toshkentda GBO va SPG opressovkasi · 450 000 soʻmdan | Texnik koʻrik uchun opressovka dalolatnomasi. Texnik koʻrikni shu tashrifda oʻtkazamiz. Autocheck Lab |
| `/uz/sugurta/` | Toshkentda avtosugʻurta · 250 000 soʻmdan | Haydovchilar soni cheklanmagan sugʻurta, joyida yoki onlayn. Autocheck Lab, Ziyolilar 42 |
Uzbek copy proofread by a native speaker [CONFIRM].

### 9.2 On-page
One H1 per page (service + city in title/H1 line 2 or sub). `<html lang="ru|uz">`. `hreflang` `ru-UZ`, `uz-UZ`, `x-default`→RU with self-canonicals. Descriptive `alt`s. Internal links via tickets. Per-page OG image 1200×630 generated at build in the yellow style (service, price, plate).

### 9.3 JSON-LD (from `business.ts`)
`AutomotiveBusiness` (name, legalName, url, telephone, `PostalAddress` UZ, geo, `openingHoursSpecification`, `sameAs` incl. Google/Yandex/Instagram/Facebook/Telegram, `hasMap`, ML1016 in description) with `makesOffer` → `Offer` per service; "от" prices as `PriceSpecification` with `minPrice`, `priceCurrency: "UZS"`. Service pages: `Service` + `BreadcrumbList` + `FAQPage`. **Don't** add `aggregateRating` from Google/Yandex data (self-serving review markup isn't eligible and risks a manual action). Validate with Rich Results Test.

### 9.4 Technical
`@astrojs/sitemap` with i18n alternates (exclude noindex pages); `robots.txt` (disallow `/api/`); www→apex and http→https 301; custom 404 with phone, tickets and home link; Search Console + Yandex Webmaster verification and sitemap submission; Google Business Profile and Yandex Business NAP identical to the site, services list updated (remove автоподбор, add опрессовка), website link with `?utm_source=google&utm_medium=organic&utm_campaign=gbp`.

---

## 10. Design system: Direction C · Номер (approved)

### 10.1 Principles
- **Bold in one place:** yellow band (hero), giant H1, the phone plate. Everything below is white and black with thick black rules.
- Yellow only for: hero band, primary button text on black (or yellow fill in the sticky bar), the price marker on the main ticket, the selected chip, the feedback send button.
- Left-aligned text. Base font 16–17 px mobile.
- **Banned:** auto-opening pop-ups (except the opt-in desktop rule in §6.8), chat bubbles, bouncing/pulsing, countdowns, fake scarcity, autoplay, parallax, scroll-jacking, carousels for essential info, cookie walls, stock photos.
- Motion: 150–200 ms, `transform`/`opacity`, for press/hover, dialog/sheet open, feedback expand. Off under `prefers-reduced-motion`.

### 10.2 Tokens
```css
:root{
  --signal:#FFD400;   /* hero band, highlights */
  --ink:#0B0B0B;      /* text, borders, footer, sticky bar */
  --paper:#FFFFFF;
  --panel:#F4F4F1;    /* bundle note, quiet surfaces */
  --muted:#55575C;    /* secondary text on paper (AA) */
  --ok:#0E7C43;       /* open dot */
  --ya:#FC3F1D;       /* Yandex tile only */
  --foot-card:#171717; --foot-line:#2B2B2B; --foot-muted:#A3A3A3; --foot-text:#F2F2F2;
  --font-sans:'Onest', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif;
  --font-mono:'IBM Plex Mono', ui-monospace, Menlo, monospace;
  --h1-mobile:44px; --h1-desktop:112px;   /* weight 800, letter-spacing -0.04/-0.05em, line-height .9 */
  --radius:12px; --radius-sm:10px; --tap:48px;
  --border-strong:3px; --border:2px; --border-thin:1.5px;
}
```
Uzbek flag on the plate: `#0099B5` / `#CE1126` thin lines / `#FFFFFF` / `#1EB53A`. Google pin icon in its own four colours; Yandex tile in `--ya`. The site is single-theme (light page, black footer); no dark mode.

### 10.3 Components (build once)
`PhonePlate` (sm/md/lg) · `OpenStatus` · `ServiceTicket` (main/normal/minor) · `BundleNote` · `YandexMap` · `RouteButton` (yandex/google) · `ReviewCard` (google/yandex) · `FeedbackForm` · `CallbackDialog` · `StickyBar` · `LangSwitch` · `Button` (black/outline/white) · `Chip` · `FAQ` (`<details>`).

### 10.4 Desktop layout (1200 px reference)
Content padding 64 px; header sticky yellow; hero 2 columns (`1.3fr 1fr`); tickets in one row; "Где мы" 2 columns (map `1.5fr` | info `1fr`); footer 3 columns. Max content width 1200 px, centred on wider screens; yellow band and black footer bleed full width.

### 10.5 Accessibility (WCAG 2.2 AA)
Black on yellow and yellow on black both pass AAA. Never yellow text on white. Visible focus ring (3 px yellow outline on dark, 2 px black on light). Tap targets ≥ 48 px. Labels visible or `aria-label`led; errors via `aria-live`. Dialog: `aria-labelledby`, focus trap, Esc. Skip link. Map iframe has a `title`.

---

## 11. Content
- Plain, short sentences; RU and UZ Latin written natively [native proofread CONFIRM].
- Reuse the good existing copy: documents for техосмотр, ПКМ 978 frequency table, accreditation, "мастера с опытом 5+ лет".
- Owner-provided content still needed: опрессовка details (what's checked, time, price tiers, the act), insurance details (product, documents, online process), the accreditation certificate scan (optional), the logo as SVG.
- No photos are required (the map replaces them). Don't use stock images.
- Remove: "Made on Tilda", the English template sentence, US phone mask, personal Telegram handle, junk URL params, "купить авто", all pre-purchase content.
- `/otzyv/`: neutral page for QR codes, with the same two "Оставить отзыв" buttons. No satisfaction filter.

---

## 12. QA and acceptance criteria

Automated (Playwright, CI on every PR):
- [ ] Every page: 200, one H1, `lang`, canonical, hreflang pair, meta description, valid JSON-LD; no mention of автоподбор/перед покупкой.
- [ ] Every `tel:` href equals `tel:+998950556555`.
- [ ] 360×640: status, H1, price, plate and "Перезвоните мне" inside the first viewport on `/`, `/opressovka-gbo/`, `/strahovanie/` and their UZ twins.
- [ ] Callback dialog: opens from each trigger with the right service preselected; Esc, ×, backdrop close it; focus returns; invalid phone → error; valid (endpoint mocked) → success + one `generate_lead`; **does not open by itself** with default config.
- [ ] Auto-open on: opens once per session on desktop only, after delay/scroll; never on mobile.
- [ ] Feedback: collapsed by default; expands; empty text → error; valid → success + `feedback_submit`; honeypot never reaches Telegram.
- [ ] Route links contain the correct coordinates / place id; open in a new tab.
- [ ] `/api/place` failure → page still shows fallback hours and review buttons, no console errors.
- [ ] OpenStatus correct for mocked times: Mon 08:59 closed, Mon 09:00 open, Sat 19:00 closed-until-Monday, Sun closed, special-hours day.
- [ ] Old Tilda URLs 301 to their targets; no horizontal scroll at 320 px.

Manual before launch:
- [ ] Lighthouse mobile meets §1 targets on main pages.
- [ ] Real test lead and complaint from Android + iPhone on mobile data reach the right Telegram chats in < 3 s, with UTM + gclid on the lead.
- [ ] Google rating/hours match the listing; Yandex badge and reviews widget render.
- [ ] GA4 DebugView, Ads Tag Assistant and Metrika see events.
- [ ] Prices identical on all pages, JSON-LD, OG images and in the Google Ads ads.

---

## 13. Deployment, migration, Google Ads follow-up

### 13.1 Launch
1. Build and review on the Cloudflare Pages preview URL.
2. Baseline on the old site: PageSpeed Insights, last 30 days of Ads conversions/CPL, Search Console impressions.
3. 24 h before cutover lower DNS TTL; moving the `.uz` domain's nameservers to Cloudflare is simplest (apex needs CNAME flattening).
4. Cutover → verify HTTPS, redirects, test lead + complaint, analytics, `/api/place`.
5. Update **all Google Ads final URLs** (техосмотр → `/`, опрессовка → `/opressovka-gbo/`, insurance → `/strahovanie/`, UZ ads → `/uz/…`). Update GBP, Yandex Business, Instagram bio.
6. Keep the Tilda project intact (unpublished) for 30 days as a rollback.

### 13.2 Google Ads checklist (once account access exists)
- **Pause all pre-purchase / автоподбор campaigns, ad groups and keywords.**
- Conversions per §8.2; primary = lead + phone click + calls from ads.
- Bidding: Maximise clicks with a CPC cap or Manual CPC until ~30 conversions/month; no Performance Max at $20/day.
- Structure: Техосмотр RU, Texnik koʻrik UZ, Опрессовка ГБО RU/UZ, Страховка (smallest budget share). Final URL = matching page.
- Keywords to research: техосмотр ташкент, пройти техосмотр, texnik koʻrik, опрессовка гбо, опрессовка метан, опрессовка пропан, акт опрессовки, gaz ballon opressovka, страховка авто ташкент, ОСГО.
- Location: Tashkent, **Presence** only. Languages: Russian, Uzbek, English. Schedule: Mon–Sat business hours full bid, reduced off-hours.
- Assets: call, location (GBP), sitelinks (3 services + Контакты), callouts ("Аккредитация ML1016", "Техосмотр за 15 минут", "Опрессовка и техосмотр за один визит"), price assets in UZS.
- Negatives: бесплатно, проверка по номеру, штраф(ы), вакансия, работа, курсы, своими руками, москва, россия, казахстан, купить, продажа, автоподбор, перед покупкой, запчасти.
- Economics: $20/day ≈ 240 000 сум/day ≈ 1.2 техосмотра. Track cost per paying customer per service; опрессовка (от 450 000) is the higher ticket and every gas car needs it before техосмотр.

---

## 14. Inputs needed from the owner

| # | Item | Needed for |
|---|---|---|
| 1 | Техосмотр price (200 000 vs 150 000) and time; opening hours incl. Sunday | `business.ts` |
| 2 | Опрессовка: what's checked, time, price tiers (метан/пропан, cylinders), what document is issued | `/opressovka-gbo/` |
| 3 | Insurance: product name, documents, online process | `/strahovanie/` |
| 4 | Exact gate coordinates and one landmark wording | Map, routes, JSON-LD |
| 5 | Google: access to the Business Profile (Place ID), Google Cloud project with billing + Places API key | Open status, rating, reviews |
| 6 | Yandex: confirm organisation ID `172968760916`; access to Yandex Business (widgets) | Map, rating, reviews |
| 7 | Telegram: bot token (new or existing), managers' group, owner's chat for complaints | Forms |
| 8 | Google Ads account ID + conversion ID/labels (or access) | Tracking |
| 9 | GA4 + Yandex Metrika access (confirm `G-MTLDQ7ZVL1`, `92182474`) | Tracking |
| 10 | Logo SVG; accreditation certificate scan (optional) | Design, trust |
| 11 | Domain registrar access (DNS) | Launch |
| 12 | GitHub repo + Cloudflare account | Build, deploy |
| 13 | Native Uzbek proofreader | UZ copy |

---

## 15. Build order for Claude Code
1. Scaffold Astro, folders, `business.ts`, i18n, `Base.astro` (meta, hreflang, JSON-LD, analytics shell).
2. Tokens + components: PhonePlate, OpenStatus (with fallback), ServiceTicket, RouteButton, Footer parts. Build `/` (RU) fully; screenshot at 360 px and 1200 px and compare with the approved mockups.
3. CallbackDialog + `/api/lead` + Telegram test mode + no-JS path.
4. FeedbackForm + `/api/feedback`.
5. `/api/place` + KV cache, wire OpenStatus and Google ReviewCard; Yandex map + widgets (click-to-load).
6. Remaining RU pages, then UZ pages.
7. Analytics + attribution + all events.
8. Redirects, sitemap, robots, OG images, 404, privacy, thank-you pages.
9. Playwright tests + Lighthouse; fix to targets.
10. Deploy preview; hand over the `[CONFIRM]`/`[VERIFY]` list and the launch checklist (§13.1).
