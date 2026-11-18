/**
 * Клиентский скрипт сайта: метки рекламы, события аналитики, статус «открыто/закрыто»,
 * всплывающая форма звонка, отправка форм, отзывы Google, нижняя панель.
 */
type Intervals = [string, string][];
interface StatusText { hours: string; openUntil: string; closedToday: string; closedTomorrow: string; closedDay: string; closed: string; days: string[] }
interface Config {
  lang: 'ru' | 'uz';
  page: string;
  service: string;
  offset: number;
  hours: Record<string, Intervals>;
  status: StatusText;
  popup: { autoOpen: boolean; delaySec: number; scrollRatio: number };
  ads: { id: string; labels: { lead: string; phone: string } };
  ym: number;
  phone: { e164: string; display: string; copied: string };
  leadTitle: { open: string; closed: string };
  googleWriteBase: string;
}
interface PlaceData {
  fallback?: boolean;
  rating?: number;
  count?: number;
  mapsUri?: string;
  placeId?: string;
  reviews?: { author: string; text: string; rating: number; when: string }[];
  hours?: { regular: Record<string, Intervals>; days?: Record<string, Intervals> };
}
type Tracker = (...a: unknown[]) => void;
const w = window as unknown as { gtag?: Tracker; ym?: Tracker };

const cfg: Config = JSON.parse(document.getElementById('app-config')!.textContent!);
const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => Array.from(root.querySelectorAll<T>(sel));

/* ---------- Метки рекламы (gclid, utm) ---------- */
const ATTR_KEYS = ['gclid', 'gbraid', 'wbraid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
function captureAttribution() {
  const p = new URLSearchParams(location.search);
  const found: Record<string, string> = {};
  for (const k of ATTR_KEYS) {
    const v = p.get(k);
    if (v) found[k] = v.slice(0, 200);
  }
  if (!Object.keys(found).length) return;
  const json = JSON.stringify(found);
  try { sessionStorage.setItem('_ac_attr', json); } catch { /* приватный режим */ }
  document.cookie = `_ac_attr=${encodeURIComponent(json)};path=/;max-age=${90 * 86400};SameSite=Lax`;
}
function getAttribution(): Record<string, string> {
  try {
    const s = sessionStorage.getItem('_ac_attr');
    if (s) return JSON.parse(s);
  } catch { /* нет доступа */ }
  const m = document.cookie.match(/(?:^|; )_ac_attr=([^;]+)/);
  if (m) { try { return JSON.parse(decodeURIComponent(m[1]!)); } catch { /* повреждённая кука */ } }
  return {};
}

/* ---------- Аналитика ---------- */
let acted = false; // посетитель уже позвонил, написал или отправил форму
function track(name: string, params: Record<string, unknown> = {}) {
  w.gtag?.('event', name, { lang: cfg.lang, service: cfg.service, ...params });
  w.ym?.(cfg.ym, 'reachGoal', name);
}
function adsConversion(label: string, phone?: string) {
  if (!cfg.ads.id || !label) return;
  if (phone) w.gtag?.('set', 'user_data', { phone_number: phone });
  w.gtag?.('event', 'conversion', { send_to: `${cfg.ads.id}/${label}` });
}
document.addEventListener('click', (e) => {
  const el = (e.target as Element).closest<HTMLElement>('a, button');
  if (!el) return;
  const href = el.getAttribute('href') ?? '';
  const place = el.dataset.place;
  if (href.startsWith('tel:')) {
    acted = true;
    copyPhoneOnDesktop();
    track('phone_click', { place });
    adsConversion(cfg.ads.labels.phone);
  } else if (/^https:\/\/t\.me\//.test(href)) {
    acted = true;
    track(el.dataset.track === 'insurance_click' ? 'insurance_click' : 'telegram_click', { place });
  } else if (el.dataset.local && document.getElementById(el.dataset.local)) {
    e.preventDefault(); // блок есть на этой странице: прокручиваем к нему, а не уходим на «Контакты»
    document.getElementById(el.dataset.local)!.scrollIntoView();
    track(el.dataset.track ?? 'scroll_to', { place });
  } else if (el.dataset.track) {
    if (el.dataset.track === 'route_click') acted = true;
    track(el.dataset.track, { place, provider: el.dataset.provider, action: el.dataset.action });
  }
});

/* ---------- На компьютере звонок по ссылке часто не срабатывает: копируем номер и говорим об этом ---------- */
let toastTimer = 0;
function toast(text: string) {
  let el = $('#toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.className = 'toast';
    el.setAttribute('role', 'status');
    document.body.append(el);
  }
  el.textContent = text;
  el.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => el!.classList.remove('is-on'), 3500);
}
function copyPhoneOnDesktop() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const done = () => toast(`${cfg.phone.copied}: ${cfg.phone.display}`);
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(cfg.phone.e164).then(done, done);
  else done();
}

/* ---------- Статус «открыто / закрыто» ---------- */
let hours: { regular: Record<string, Intervals>; days?: Record<string, Intervals> } = { regular: cfg.hours };
const toMin = (hm: string) => { const [h, m] = hm.split(':').map(Number); return h! * 60 + (m ?? 0); };
const showTime = (hm: string) => hm.replace(/^0/, '');
function computeStatus(nowMs: number) {
  const local = new Date(nowMs + cfg.offset * 3600_000); // время Ташкента в полях UTC
  const minutes = local.getUTCHours() * 60 + local.getUTCMinutes();
  const dayAt = (shift: number) => {
    const d = new Date(local.getTime() + shift * 86400_000);
    const iso = d.toISOString().slice(0, 10);
    const dow = d.getUTCDay();
    return { dow, list: hours.days?.[iso] ?? hours.regular[String(dow)] ?? [] };
  };
  const today = dayAt(0).list;
  for (const [o, c] of today) {
    if (minutes >= toMin(o) && minutes < toMin(c)) return { open: true, text: cfg.status.openUntil.replace('{t}', showTime(c)) };
  }
  const later = today.find(([o]) => toMin(o) > minutes);
  if (later) return { open: false, text: cfg.status.closedToday.replace('{t}', showTime(later[0])) };
  for (let i = 1; i <= 7; i++) {
    const { dow, list } = dayAt(i);
    if (!list.length) continue;
    const tpl = i === 1 ? cfg.status.closedTomorrow : cfg.status.closedDay;
    return { open: false, text: tpl.replace('{d}', cfg.status.days[dow]!).replace('{t}', showTime(list[0]![0])) };
  }
  return { open: false, text: cfg.status.closed };
}
function renderStatus() {
  const s = computeStatus(Date.now());
  for (const el of $$('[data-status]')) {
    el.classList.toggle('is-open', s.open);
    const text = $('[data-status-text]', el);
    if (text) text.textContent = s.text;
  }
}

/* ---------- Данные карточки Google Maps: часы, рейтинг, отзывы ---------- */
async function loadPlace() {
  let data: PlaceData;
  try {
    const res = await fetch('/api/place', { headers: { Accept: 'application/json' } });
    if (!res.ok) return;
    data = await res.json();
  } catch { return; }
  if (!data || data.fallback) return;
  if (data.hours?.regular && Object.keys(data.hours.regular).length) { hours = data.hours; renderStatus(); }
  if (data.mapsUri) {
    for (const a of $$<HTMLAnchorElement>('[data-status], [data-g-read]')) a.href = data.mapsUri;
  }
  if (typeof data.rating === 'number' && data.count) {
    for (const card of $$('[data-g-card]')) {
      $('[data-g-rating]', card)!.textContent = data.rating.toFixed(1).replace('.', ',');
      ($('[data-g-stars]', card) as HTMLElement).style.setProperty('--r', String(data.rating));
      const cnt = $('[data-g-count]', card)!;
      cnt.textContent = (cnt.dataset.tpl ?? '{n}').replace('{n}', String(data.count));
      $('[data-g-score]', card)!.hidden = false;
      $('[data-g-hint]', card)!.hidden = true;
      const box = $('[data-g-quotes]', card)!;
      for (const r of (data.reviews ?? []).slice(0, 2)) {
        const q = document.createElement('blockquote');
        const p = document.createElement('p');
        p.textContent = r.text;
        const c = document.createElement('cite');
        c.textContent = `${r.author} · ${r.when} · Google`;
        q.append(p, c);
        box.append(q);
      }
      box.hidden = !box.childElementCount;
    }
  }
}

/* ---------- Поле телефона ---------- */
function phoneDigits(raw: string) {
  let v = raw.replace(/\D/g, '');
  if (v.length > 9 && v.startsWith('998')) v = v.slice(3);
  if (v.length === 10 && v.startsWith('8')) v = v.slice(1);
  return v.slice(0, 9);
}
function formatPhone(v: string) {
  return [v.slice(0, 2), v.slice(2, 5), v.slice(5, 7), v.slice(7, 9)].filter(Boolean).join(' ');
}

/* ---------- Заявка на звонок ---------- */
function setupLeadForm(form: HTMLFormElement) {
  const input = $<HTMLInputElement>('input[name="phone"]', form)!;
  const field = input.closest('.phone-field')!;
  const msg = $('[data-lead-msg]', form)!;
  const btn = $<HTMLButtonElement>('button[type="submit"]', form)!;
  const started = $<HTMLInputElement>('input[name="ts_start"]', form)!;
  started.value = String(Date.now());

  input.addEventListener('input', () => {
    input.value = formatPhone(phoneDigits(input.value));
    field.classList.remove('is-invalid');
    msg.hidden = true;
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const digits = phoneDigits(input.value);
    if (digits.length !== 9) {
      field.classList.add('is-invalid');
      msg.textContent = form.dataset.errPhone!;
      msg.hidden = false;
      input.focus();
      return;
    }
    const fd = new FormData(form);
    const phone = `+998${digits}`;
    const service = String(fd.get('service') ?? cfg.service);
    btn.disabled = true;
    btn.textContent = btn.dataset.sending!;
    let ok = false;
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          phone, service, lang: cfg.lang, page: location.pathname,
          ts_start: Number(started.value), company: fd.get('company') ?? '',
          referrer: document.referrer.slice(0, 300), ...getAttribution(),
        }),
      });
      ok = res.ok && (await res.json()).ok === true;
    } catch { ok = false; }
    btn.disabled = false;
    btn.textContent = btn.dataset.label!;
    if (!ok) {
      msg.replaceChildren(document.createTextNode(form.dataset.errSend + ' '));
      const a = document.createElement('a');
      a.href = 'tel:+998950556555';
      a.textContent = '+998 95 055 65 55';
      msg.append(a);
      msg.hidden = false;
      return;
    }
    acted = true;
    $('[data-lead-fields]', form)!.hidden = true;
    const done = $('[data-lead-ok]', form)!;
    done.hidden = false;
    done.focus();
    track('generate_lead', { service, place: form.dataset.place });
    adsConversion(cfg.ads.labels.lead, phone);
  });
}
function resetLeadForm(form: HTMLFormElement, service?: string) {
  $('[data-lead-fields]', form)!.hidden = false;
  $('[data-lead-ok]', form)!.hidden = true;
  $('[data-lead-msg]', form)!.hidden = true;
  $<HTMLInputElement>('input[name="ts_start"]', form)!.value = String(Date.now());
  const want = service ?? cfg.service;
  const radio = $<HTMLInputElement>(`input[name="service"][value="${want}"]`, form);
  if (radio) radio.checked = true;
}

/* ---------- Всплывающая форма ---------- */
function setupDialog() {
  const dlg = $<HTMLDialogElement>('#callback');
  if (!dlg || typeof dlg.showModal !== 'function') return;
  const form = $<HTMLFormElement>('form', dlg)!;
  const open = (trigger: string, service?: string) => {
    if (dlg.open) return;
    resetLeadForm(form, service);
    const title = $('#callback-t', dlg);
    if (title) title.textContent = computeStatus(Date.now()).open ? cfg.leadTitle.open : cfg.leadTitle.closed;
    dlg.showModal();
    $<HTMLInputElement>('input[name="phone"]', dlg)!.focus();
    track('callback_open', { trigger });
  };
  document.addEventListener('click', (e) => {
    const tr = (e.target as Element).closest<HTMLElement>('[data-callback]');
    if (!tr) return;
    e.preventDefault();
    open(tr.dataset.place ?? 'button', tr.dataset.service);
  });
  dlg.addEventListener('click', (e) => {
    if (e.target === dlg || (e.target as Element).closest('[data-close]')) dlg.close();
  });
  // Держим форму над экранной клавиатурой
  const vv = window.visualViewport;
  if (vv) {
    const fix = () => dlg.style.setProperty('--kb', `${Math.max(0, window.innerHeight - vv.height - vv.offsetTop)}px`);
    vv.addEventListener('resize', fix);
    vv.addEventListener('scroll', fix);
  }
  // Автооткрытие: выключено по умолчанию, только десктоп, один раз за визит, не после действия
  if (cfg.popup.autoOpen && window.matchMedia('(min-width: 1024px)').matches) {
    let seen = false;
    try { seen = sessionStorage.getItem('_ac_popup') === '1'; } catch { seen = true; }
    if (!seen) {
      const fire = () => {
        if (acted || dlg.open) return;
        try { sessionStorage.setItem('_ac_popup', '1'); } catch { /* нет доступа */ }
        window.removeEventListener('scroll', onScroll);
        clearTimeout(timer);
        open('auto');
      };
      const onScroll = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        if (max > 0 && window.scrollY / max >= cfg.popup.scrollRatio) fire();
      };
      const timer = window.setTimeout(fire, cfg.popup.delaySec * 1000);
      window.addEventListener('scroll', onScroll, { passive: true });
    }
  }
}

/* ---------- Жалоба или предложение ---------- */
function setupFeedback(box: HTMLElement) {
  const toggle = $<HTMLButtonElement>('[data-fb-toggle]', box)!;
  const form = $<HTMLFormElement>('form', box)!;
  const msg = $('[data-fb-msg]', form)!;
  const text = $<HTMLTextAreaElement>('textarea', form)!;
  const started = $<HTMLInputElement>('input[name="ts_start"]', form)!;
  toggle.addEventListener('click', () => {
    form.hidden = !form.hidden;
    toggle.setAttribute('aria-expanded', String(!form.hidden));
    toggle.textContent = form.hidden ? toggle.dataset.open! : toggle.dataset.hide!;
    if (!form.hidden) { started.value = String(Date.now()); text.focus(); }
  });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const say = (t: string, ok = false) => { msg.textContent = t; msg.classList.toggle('is-ok', ok); msg.hidden = false; };
    if (text.value.trim().length < 3) { say(form.dataset.errText!); text.focus(); return; }
    const fd = new FormData(form);
    const btn = $<HTMLButtonElement>('button[type="submit"]', form)!;
    btn.disabled = true;
    let ok = false;
    const type = String(fd.get('type') ?? 'message');
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          type, text: text.value.trim(), phone: fd.get('phone') ?? '', lang: cfg.lang,
          page: location.pathname, ts_start: Number(started.value), company: fd.get('company') ?? '',
        }),
      });
      ok = res.ok && (await res.json()).ok === true;
    } catch { ok = false; }
    btn.disabled = false;
    if (!ok) { say(form.dataset.errSend!); return; }
    form.reset();
    started.value = String(Date.now());
    say(form.dataset.ok!, true);
    track('feedback_submit', { type });
  });
}

/* ---------- Нижняя панель: прячем, пока видны кнопки первого экрана и пока человек печатает ---------- */
function setupBar() {
  const bar = $('[data-bar]');
  if (!bar) return;
  let heroVisible = false;
  let typing = false;
  const sync = () => bar.classList.toggle('is-hidden', heroVisible || typing);
  const cta = $('[data-hero-cta]');
  if (cta && 'IntersectionObserver' in window) {
    new IntersectionObserver(([en]) => { heroVisible = !!en?.isIntersecting; sync(); }).observe(cta);
  }
  document.addEventListener('focusin', (e) => { typing = (e.target as Element).matches('input, textarea'); sync(); });
  document.addEventListener('focusout', () => { typing = false; sync(); });
}

/* ---------- Карта и значок Яндекса: грузим, когда посетитель к ним подходит, чтобы не тормозить первый экран ---------- */
function setupLazyFrames() {
  const frames = $$<HTMLIFrameElement>('iframe[data-src]');
  if (!frames.length) return;
  const load = (f: HTMLIFrameElement) => {
    if (!f.dataset.src) return;
    f.src = f.dataset.src;
    delete f.dataset.src;
  };
  if (!('IntersectionObserver' in window)) { frames.forEach(load); return; }
  // То, что видно сразу, грузим сразу
  const first = new IntersectionObserver((entries, obs) => {
    entries.forEach((en) => { if (en.isIntersecting) load(en.target as HTMLIFrameElement); });
    obs.disconnect();
  });
  frames.forEach((f) => first.observe(f));
  // Остальное — после первого действия посетителя, с запасом в 600 px до блока
  const events = ['scroll', 'pointerdown', 'pointermove', 'touchstart', 'keydown'] as const;
  const arm = () => {
    events.forEach((ev) => window.removeEventListener(ev, arm));
    const near = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        load(en.target as HTMLIFrameElement);
        near.unobserve(en.target);
      });
    }, { rootMargin: '600px 0px' });
    frames.forEach((f) => { if (f.dataset.src) near.observe(f); });
  };
  events.forEach((ev) => window.addEventListener(ev, arm, { passive: true, once: true }));
}

captureAttribution();
setupLazyFrames();
renderStatus();
setInterval(renderStatus, 60_000);
$$<HTMLFormElement>('form[data-lead]').forEach(setupLeadForm);
$$('[data-fb]').forEach(setupFeedback);
setupDialog();
setupBar();
if ('requestIdleCallback' in window) requestIdleCallback(() => void loadPlace(), { timeout: 2500 });
else setTimeout(() => void loadPlace(), 800);
