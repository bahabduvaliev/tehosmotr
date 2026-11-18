# texnikorik.uz — сайт Autocheck Lab

Русская и узбекская версии. Статический сайт на Astro, формы и данные Google Maps работают через Cloudflare Pages Functions.

## Страницы

| Страница | RU | UZ |
|---|---|---|
| Главная | `/` | `/uz/` |
| Техосмотр: что нужно, сколько длится, документы, форма | `/tehosmotr/` | `/uz/texnik-korik/` |
| Опрессовка ГБО и СПГ | `/opressovka-gbo/` | `/uz/gbo-opressovka/` |
| Контакты | `/kontakty/` | `/uz/kontaktlar/` |
| Конфиденциальность | `/privacy/` | `/uz/maxfiylik/` |
| Просьба об отзыве (для QR-кода, не индексируется) | `/otzyv/` | `/uz/sharh/` |

Страховка отдельной страницы не имеет: карточка и пункт меню открывают Telegram `@Botirkhon`.

## Где что менять

- **Цены, телефон, адрес, часы, ссылки, id счётчиков:** `src/data/business.ts`. Больше нигде цены не записаны.
- **Тексты:** `src/i18n/ru.ts` и `src/i18n/uz.ts`.
- **Цвета и размеры:** начало файла `src/styles/global.css`.
- **Адреса страниц:** `src/i18n/index.ts`. Старые адреса Tilda: `public/_redirects`.

## Запуск

```bash
npm install
npm run build      # проверка типов и сборка в dist/
npm run preview    # сайт с формами на http://localhost:8788
npm test           # 43 автотеста (нужна сборка)
npm run og         # перерисовать картинки для соцсетей после смены цен
```

Для локального запуска скопируйте `.dev.vars.example` в `.dev.vars`. С `LEAD_DRY_RUN=1` заявки не уходят в Telegram.

## Что нужно для запуска в интернете

Переменные в Cloudflare Pages → Settings → Environment variables:

| Переменная | Зачем |
|---|---|
| `TELEGRAM_BOT_TOKEN` | токен бота от @BotFather |
| `TELEGRAM_CHAT_ID` | чат, куда приходят заявки на звонок. Можно несколько id через запятую |
| `TELEGRAM_FEEDBACK_CHAT_ID` | чат руководителя для жалоб и предложений (если пусто, они идут в группу менеджеров) |
| `GOOGLE_PLACES_API_KEY` | ключ Places API (New): рейтинг, отзывы и часы работы из Google Maps |
| `GOOGLE_PLACE_ID` | id карточки Autocheck в Google Maps |

Плюс KV-пространство с привязкой `PLACE_CACHE` (кэш Google на 6 часов и защита форм от спама).

Id чатов: добавьте бота в группу, напишите там сообщение и запустите `TELEGRAM_BOT_TOKEN=… npm run tg:chat-id`.

После публикации откройте `/api/health`: там видно, что подключено (бот, чаты, Google, кэш).

Без токена бота формы показывают посетителю ошибку и телефон, заявка не теряется молча.
Без ключа Google сайт показывает часы из `business.ts`, а в карточке Google остаются кнопки без цифры рейтинга.
Рейтинг и карта Яндекса работают без ключей, по id организации `172968760916`.

## Публикация (Cloudflare Pages)

1. Код лежит в репозитории GitHub.
2. В Cloudflare: Workers & Pages → Create → Pages → Connect to Git → выбрать репозиторий.
   Framework preset: Astro. Build command: `npm run build`. Output directory: `dist`.
3. Settings → Environment variables: добавить переменные из таблицы выше.
4. Settings → Functions → KV namespace bindings: привязать пространство с именем переменной `PLACE_CACHE`.
5. Custom domains → добавить `texnikorik.uz` и `www.texnikorik.uz`, поменять DNS у регистратора.

Технический адрес `*.pages.dev` закрыт от поисковиков в `public/_headers`.

## Google Search Console и Яндекс Вебмастер

1. Добавьте сайт `https://texnikorik.uz` в Search Console и в Вебмастер, выберите подтверждение мета-тегом.
2. Вставьте коды в `src/data/business.ts`, поле `verification` (только значение `content`), и опубликуйте.
3. Отправьте карту сайта: `https://texnikorik.uz/sitemap.xml`.
4. Запросите индексацию главной, `/tehosmotr/`, `/opressovka-gbo/` и их узбекских версий.

Что уже сделано для поиска: один H1 на странице, уникальные title и description, canonical, связка
ru/uz через hreflang (в коде страницы и в карте сайта), разметка schema.org (организация, услуги с ценами,
вопросы-ответы, хлебные крошки), страница 404 с правильным кодом, 301 со старых адресов.
Lighthouse (телефон): скорость 99–100, SEO 100, LCP 0,8 с.

## Ждёт подтверждения владельцев

В `src/data/business.ts` эти места помечены `CONFIRM`:

- цена техосмотра 200 000 сум (на старой узбекской странице было 150 000) и время 15 минут;
- обещание «перезвоним за 15 минут»;
- общий Telegram `@texosmotr_ads_admin` в нижней панели;
- юридическое название;
- id рекламного аккаунта Google Ads и метки конверсий (`analytics.googleAds`, `adsLabels`);
- Place ID карточки Google.

Узбекский текст написан без носителя языка. Его нужно вычитать.
Политика конфиденциальности — черновик, покажите её юристу.

## Аналитика

GA4 `G-MTLDQ7ZVL1` и Яндекс Метрика `92182474` включаются только в продакшен-сборке.
События: `generate_lead`, `phone_click`, `telegram_click`, `insurance_click`, `callback_open`, `route_click`, `review_click`, `status_click`, `feedback_submit`, `lang_switch`.
В каждую заявку в Telegram попадают gclid и utm-метки рекламы.
