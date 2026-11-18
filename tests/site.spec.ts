import { test, expect, type Page } from '@playwright/test';
import { normalizePlace } from '../server/place';
import { leadMessage } from '../server/lead';
import { normalizePhone } from '../server/shared';

const PAGES = {
  ru: ['/', '/tehosmotr/', '/opressovka-gbo/', '/kontakty/', '/privacy/'],
  uz: ['/uz/', '/uz/texnik-korik/', '/uz/gbo-opressovka/', '/uz/kontaktlar/', '/uz/maxfiylik/'],
};
const ALL = [...PAGES.ru, ...PAGES.uz];
const TEL = 'tel:+998950556555';
const mobile = { viewport: { width: 360, height: 640 }, isMobile: true, hasTouch: true };

const events = (page: Page) =>
  page.evaluate(() => (window as any).dataLayer.filter((a: any) => a[0] === 'event').map((a: any) => a[1]));

for (const path of ALL) {
  test(`страница ${path}: SEO-основа`, async ({ page }) => {
    const res = await page.goto(path);
    expect(res!.status()).toBe(200);
    const lang = path.startsWith('/uz/') ? 'uz' : 'ru';
    await expect(page.locator('html')).toHaveAttribute('lang', lang);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://texnikorik.uz' + path);
    await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(3);
    const descr = await page.locator('meta[name="description"]').getAttribute('content');
    expect(descr!.length).toBeGreaterThan(50);
    expect(descr!.length).toBeLessThanOrEqual(170);
    expect((await page.title()).length).toBeLessThanOrEqual(62);
    for (const raw of await page.locator('script[type="application/ld+json"]').allTextContents()) JSON.parse(raw);
    // Снятой услуги на сайте нет
    const body = (await page.locator('body').innerText()).toLowerCase();
    expect(body).not.toContain('автоподбор');
    expect(body).not.toContain('перед покупкой');
    // Все телефонные ссылки ведут на правильный номер
    const tels = await page.locator('a[href^="tel:"]').evaluateAll((els) => els.map((e) => e.getAttribute('href')));
    expect(tels.length).toBeGreaterThan(2);
    for (const t of tels) expect(t).toBe(TEL);
  });
}

test.describe('телефон 360×640', () => {
  test.use(mobile);
  for (const path of ['/', '/tehosmotr/', '/opressovka-gbo/', '/uz/', '/uz/texnik-korik/', '/uz/gbo-opressovka/']) {
    test(`${path}: первый экран и ширина`, async ({ page }) => {
      await page.goto(path);
      for (const sel of ['h1', '.hero .plate', '[data-hero-cta] [data-callback]']) {
        const box = await page.locator(sel).first().boundingBox();
        expect(box, sel).not.toBeNull();
        expect(box!.y + box!.height, sel).toBeLessThanOrEqual(640);
      }
      await page.setViewportSize({ width: 320, height: 640 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    });
  }
});

test('техосмотр: карточка ведёт на отдельную страницу с документами и формой', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-ticket="inspection"]').click();
  await expect(page).toHaveURL(/\/tehosmotr\/$/);
  await expect(page.locator('#docs-h')).toBeVisible();
  await expect(page.locator('#steps-h')).toBeVisible();
  await expect(page.locator('#callback-form form[data-lead]')).toBeVisible();
  await expect(page.locator('.facts')).toContainText('15');
});

test('номер: на компьютере копируется и показывается подсказка; у ссылки понятное имя', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  const plate = page.locator('.hero .plate');
  await expect(plate).toHaveAttribute('href', TEL);
  await expect(plate).toHaveAccessibleName(/Позвонить \+998\s*95\s*055 65 55/);
  await page.evaluate(() => document.querySelector('.hero .plate')!.addEventListener('click', (e) => e.preventDefault()));
  await plate.click();
  await expect(page.locator('#toast')).toHaveText('Номер скопирован: +998 95 055 65 55');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('+998950556555');
  expect(await events(page)).toContain('phone_click');
});

test('счётчики Google и Яндекса стоят на каждой странице', async ({ request }) => {
  for (const path of ['/', '/tehosmotr/', '/uz/', '/uz/gbo-opressovka/']) {
    const html = await (await request.get(path)).text();
    expect(html).toContain('googletagmanager.com/gtag/js');
    expect(html).toContain('G-MTLDQ7ZVL1');
    expect(html).toContain('mc.yandex.ru/metrika/tag.js');
    expect(html).toContain('92182474');
  }
});

test('страховка ведёт в Telegram @Botirkhon', async ({ page }) => {
  await page.goto('/');
  const link = page.locator('[data-ticket="insurance"]');
  await expect(link).toHaveAttribute('href', /^https:\/\/t\.me\/Botirkhon\?text=/);
  await expect(link).toHaveAttribute('target', '_blank');
  await page.goto('/uz/');
  await expect(page.locator('[data-ticket="insurance"]')).toHaveAttribute('href', /^https:\/\/t\.me\/Botirkhon\?text=Assalomu/);
});

test('форма звонка: сама не открывается, проверяет номер, отправляет заявку', async ({ page }) => {
  let sent: any = null;
  await page.route('**/api/lead', async (route) => {
    sent = route.request().postDataJSON();
    await route.fulfill({ json: { ok: true, id: 'TEST' } });
  });
  await page.goto('/opressovka-gbo/?gclid=TESTCLICK&utm_source=google&utm_medium=cpc&utm_term=опрессовка');
  const dlg = page.locator('#callback');
  await page.waitForTimeout(1200);
  await expect(dlg).not.toBeVisible();

  await page.locator('[data-hero-cta] [data-callback]').click();
  await expect(dlg).toBeVisible();
  await expect(dlg.locator('input[name="service"][value="gas_test"]')).toBeChecked();
  await page.keyboard.press('Escape');
  await expect(dlg).not.toBeVisible();

  await page.locator('[data-hero-cta] [data-callback]').click();
  await dlg.locator('input[name="phone"]').fill('12345');
  await dlg.locator('button[type="submit"]').click();
  await expect(dlg.locator('[data-lead-msg]')).toBeVisible();
  expect(sent).toBeNull();

  await dlg.locator('input[name="phone"]').fill('+998 90 123-45-67');
  await expect(dlg.locator('input[name="phone"]')).toHaveValue('90 123 45 67');
  await page.waitForTimeout(100);
  await dlg.locator('button[type="submit"]').click();
  await expect(dlg.locator('[data-lead-ok]')).toBeVisible();
  expect(sent.phone).toBe('+998901234567');
  expect(sent.service).toBe('gas_test');
  expect(sent.gclid).toBe('TESTCLICK');
  expect(sent.utm_term).toBe('опрессовка');
  expect((await events(page)).filter((e: string) => e === 'generate_lead')).toHaveLength(1);
});

test('форма звонка: при сбое показывает ошибку и телефон', async ({ page }) => {
  await page.route('**/api/lead', (route) => route.fulfill({ status: 502, json: { ok: false } }));
  await page.goto('/tehosmotr/');
  const form = page.locator('#callback-form form[data-lead]');
  await form.locator('input[name="phone"]').fill('901234567');
  await form.locator('button[type="submit"]').click();
  await expect(form.locator('[data-lead-msg] a')).toHaveAttribute('href', TEL);
  await expect(form.locator('input[name="phone"]')).toHaveValue('90 123 45 67');
  expect(await events(page)).not.toContain('generate_lead');
});

test('жалоба или предложение: свёрнута, раскрывается, отправляется', async ({ page }) => {
  let sent: any = null;
  await page.route('**/api/feedback', async (route) => {
    sent = route.request().postDataJSON();
    await route.fulfill({ json: { ok: true } });
  });
  await page.goto('/');
  const form = page.locator('#fb-form');
  await expect(form).toBeHidden();
  await page.locator('[data-fb-toggle]').click();
  await expect(form).toBeVisible();
  await form.locator('button[type="submit"]').click();
  await expect(form.locator('[data-fb-msg]')).toBeVisible();
  expect(sent).toBeNull();
  await form.locator('input[value="complaint"]').check();
  await form.locator('textarea').fill('Долго ждал в очереди');
  await form.locator('button[type="submit"]').click();
  await expect(form.locator('[data-fb-msg]')).toHaveClass(/is-ok/);
  expect(sent.type).toBe('complaint');
  expect(await events(page)).toContain('feedback_submit');
});

test('маршруты и отзывы ведут в Яндекс и Google', async ({ page }) => {
  await page.goto('/');
  const ya = page.locator('.rbtn[data-provider="yandex"]');
  const gg = page.locator('.rbtn[data-provider="google"]');
  await expect(ya).toHaveAttribute('href', /yandex\.uz\/maps\/\?rtext=~41\.334837%2C69\.31327/);
  await expect(gg).toHaveAttribute('href', /google\.com\/maps\/dir\/\?api=1&destination=41\.334837%2C69\.31327/);
  // Карта не грузится, пока посетитель до неё не дошёл
  await expect(page.locator('.map > iframe')).not.toHaveAttribute('src', /.+/);
  await page.locator('#where').scrollIntoViewIfNeeded();
  await page.mouse.wheel(0, 50);
  await expect(page.locator('.map > iframe')).toHaveAttribute('src', /yandex\.uz\/map-widget\/v1\/.*oid=172968760916/);
  await expect(page.locator('.rev-wr[data-provider="yandex"]')).toHaveAttribute('href', /172968760916\/reviews\/\?add-review=true/);
  await expect(page.locator('.rev-wr[data-provider="google"]')).toHaveAttribute('href', /google/);
  await page.locator('.foot').scrollIntoViewIfNeeded();
  await page.mouse.wheel(0, 50);
  await expect(page.locator('iframe.ya-badge')).toHaveAttribute('src', /rating-badge\/172968760916/);
});

test('рейтинг Google и часы подставляются из /api/place', async ({ page }) => {
  await page.route('**/api/place', (route) =>
    route.fulfill({ json: { rating: 4.8, count: 120, mapsUri: 'https://maps.google.com/?cid=1', reviews: [{ author: 'Азиз', text: 'Быстро и вежливо', rating: 5, when: 'неделю назад' }], hours: { regular: {}, days: {} } } }),
  );
  await page.goto('/');
  await expect(page.locator('[data-g-rating]')).toHaveText('4,8');
  await expect(page.locator('[data-g-count]')).toHaveText('120 отзывов');
  await expect(page.locator('[data-g-quotes] blockquote')).toHaveCount(1);
  await expect(page.locator('[data-g-read]')).toHaveAttribute('href', 'https://maps.google.com/?cid=1');
});

test.describe('статус «открыто / закрыто» по времени Ташкента', () => {
  // 2026-11-09 — понедельник. Ташкент = UTC+5.
  const cases: [string, string, boolean, RegExp][] = [
    ['пн 08:59', '2026-11-09T03:59:00Z', false, /откроемся в 9:00/],
    ['пн 09:00', '2026-11-09T04:00:00Z', true, /Открыто до 19:00/],
    ['пн 18:59', '2026-11-09T13:59:00Z', true, /Открыто до 19:00/],
    ['пн 19:00', '2026-11-09T14:00:00Z', false, /завтра в 9:00/],
    ['сб 19:30', '2026-11-14T14:30:00Z', false, /завтра в 11:00/],
    ['вс 10:59', '2026-11-15T05:59:00Z', false, /откроемся в 11:00/],
    ['вс 12:00', '2026-11-15T07:00:00Z', true, /Открыто до 16:00/],
    ['вс 16:00', '2026-11-15T11:00:00Z', false, /завтра в 9:00/],
  ];
  for (const [name, iso, open, text] of cases) {
    test(name, async ({ page }) => {
      await page.clock.setFixedTime(new Date(iso));
      await page.goto('/');
      const pill = page.locator('.hdr [data-status]');
      await expect(pill.locator('[data-status-text]')).toHaveText(text);
      expect(await pill.evaluate((el) => el.classList.contains('is-open'))).toBe(open);
    });
  }
  test('особые часы из Google важнее обычных', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-11-09T06:00:00Z')); // пн 11:00
    await page.route('**/api/place', (route) =>
      route.fulfill({ json: { hours: { regular: { '1': [['09:00', '19:00']] }, days: { '2026-11-09': [['09:00', '15:00']] } } } }),
    );
    await page.goto('/');
    await expect(page.locator('.hdr [data-status-text]')).toHaveText(/Открыто до 15:00/);
  });
});

test('«Маршрут» в нижней панели работает на любой странице', async ({ browser }) => {
  const ctx = await browser.newContext(mobile);
  const page = await ctx.newPage();
  await page.goto('/privacy/');
  await page.evaluate(() => window.scrollTo(0, 400));
  await page.locator('[data-bar] a[data-local="where"]').click();
  await expect(page).toHaveURL(/\/kontakty\/#where$/);
  await expect(page.locator('#where')).toBeVisible();
  await page.goto('/tehosmotr/');
  await page.evaluate(() => window.scrollTo(0, 600));
  await page.locator('[data-bar] a[data-local="where"]').click();
  await expect(page).toHaveURL(/\/tehosmotr\/$/);
  await expect(page.locator('#where')).toBeInViewport();
  await ctx.close();
});

test('вне рабочих часов форма не обещает перезвонить за 15 минут', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-11-09T17:00:00Z')); // пн 22:00 в Ташкенте
  await page.goto('/');
  await page.locator('[data-hero-cta] [data-callback]').click();
  await expect(page.locator('#callback-t')).toHaveText('Перезвоним, как только откроемся');
});

test('старые адреса Tilda переадресуются', async ({ request }) => {
  const map: Record<string, string> = {
    '/autocheck': '/', '/landing_uz': '/uz/', '/landing_ru': '/', '/multilink/location': '/kontakty/',
    '/tolkopositivnieotzivi': '/otzyv/', '/tehosmotr': '/tehosmotr/',
  };
  for (const [from, to] of Object.entries(map)) {
    const res = await request.get(from, { maxRedirects: 0 });
    expect([301, 308], from).toContain(res.status());
    expect(new URL(res.headers().location!, 'http://x').pathname, from).toBe(to);
  }
});

test('служебные страницы закрыты от индексации, sitemap и robots на месте', async ({ page, request }) => {
  for (const path of ['/otzyv/', '/spasibo/', '/uz/sharh/', '/uz/rahmat/']) {
    await page.goto(path);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  }
  const sm = await (await request.get('/sitemap.xml')).text();
  expect(sm.match(/<loc>/g)).toHaveLength(10);
  expect(sm).not.toContain('otzyv');
  expect(await (await request.get('/robots.txt')).text()).toContain('Sitemap: https://texnikorik.uz/sitemap.xml');
});

test.describe('серверные функции', () => {
  test('заявка без JavaScript: форма → страница «спасибо»', async ({ request }) => {
    const res = await request.post('/api/lead', { form: { phone: '90 123 45 67', service: 'inspection', lang: 'uz', page: '/uz/' }, maxRedirects: 0 });
    expect(res.status()).toBe(303);
    expect(res.headers().location).toBe('/uz/rahmat/');
  });
  test('неверный номер отклоняется, бот получает «принято» без отправки', async ({ request }) => {
    const bad = await request.post('/api/lead', { data: { phone: '123', service: 'inspection' } });
    expect(bad.status()).toBe(400);
    const bot = await request.post('/api/lead', { data: { phone: '+998901234567', company: 'spam' } });
    expect(await bot.json()).toEqual({ ok: true });
  });
  test('/api/health показывает, что подключено, без секретов', async ({ request }) => {
    const h = await (await request.get('/api/health')).json();
    expect(h).toEqual({ telegramBot: false, leadsChat: false, feedbackChat: false, googlePlaces: false, cache: false, dryRun: true });
  });
  test('без ключа Google отдаётся запасной ответ', async ({ request }) => {
    expect(await (await request.get('/api/place')).json()).toEqual({ fallback: true });
  });
  test('номер, текст заявки и часы Google разбираются правильно', () => {
    expect(normalizePhone('95 055 65 55')).toBe('+998950556555');
    expect(normalizePhone('+998 (95) 055-65-55')).toBe('+998950556555');
    expect(normalizePhone('12345')).toBeNull();
    const msg = leadMessage({ service: 'gas_test', lang: 'uz', page: '/uz/', utm_source: 'google', utm_medium: 'cpc', utm_term: '<b>x</b>', gclid: 'abc' }, '+998901234567', 'A7K2', new Date('2026-11-09T06:42:00Z'));
    expect(msg).toContain('Заявка #A7K2 · Опрессовка ГБО и СПГ');
    expect(msg).toContain('+998 90 123 45 67');
    expect(msg).toContain('google / cpc');
    expect(msg).toContain('&lt;b&gt;x&lt;/b&gt;');
    expect(msg).toContain('09.11.2026 11:42 (Ташкент)');
    const place = normalizePlace({
      id: 'ChIJtest', rating: 4.8, userRatingCount: 120, googleMapsUri: 'https://maps.google.com/?cid=1',
      regularOpeningHours: { periods: [{ open: { day: 1, hour: 9, minute: 0 }, close: { day: 1, hour: 19, minute: 0 } }] },
      currentOpeningHours: { periods: [{ open: { day: 1, hour: 9, minute: 0, date: { year: 2026, month: 11, day: 9 } }, close: { day: 1, hour: 15, minute: 0, date: { year: 2026, month: 11, day: 9 } } }] },
      reviews: [{ rating: 5, text: { text: 'Отлично' }, authorAttribution: { displayName: 'Азиз' }, relativePublishTimeDescription: 'неделю назад' }],
    }, Date.parse('2026-11-09T06:00:00Z'));
    expect(place.hours.regular['1']).toEqual([['09:00', '19:00']]);
    expect(place.hours.days['2026-11-09']).toEqual([['09:00', '15:00']]);
    expect(place.hours.days['2026-11-10']).toEqual([]);
    expect(place.reviews[0]).toMatchObject({ author: 'Азиз', text: 'Отлично', rating: 5 });
  });
});
