import { business as b, fmt } from '../data/business';
import type { Dict } from './ru';

// Oʻzbek matnlari lotin yozuvida. Tutuq belgisi: ʻ (U+02BB). Matnni ona tilida soʻzlashuvchi tekshirishi kerak.
const price = (n: number, from: boolean) => (from ? `${fmt(n)} soʻmdan` : `${fmt(n)} soʻm`);
const s = b.services;
const mins = s.inspection.minutes;

export const uz: Dict = {
  lang: 'uz',
  htmlLang: 'uz',
  ogLocale: 'uz_UZ',
  price,
  from: { pre: '', post: 'dan' },
  sum: 'soʻm',

  a11y: { crumbs: 'Siz shu yerdasiz', skip: 'Asosiy matnga oʻtish', menu: 'Sayt boʻlimlari', close: 'Yopish', phone: 'Telefon raqami', lang: 'Til' },

  nav: { inspection: 'Texnik koʻrik', gas: 'GBO opressovkasi', insurance: 'Sugʻurta', contacts: 'Aloqa', home: 'Bosh sahifa' },

  cta: {
    call: 'Qoʻngʻiroq',
    callback: 'Menga qoʻngʻiroq qiling',
    telegram: 'Telegram',
    route: 'Marshrut',
    tap: '↑ qoʻngʻiroq qilish uchun bosing',
    copied: 'Raqam nusxalandi',
    callUs: 'Bizga qoʻngʻiroq qiling',
    callAria: `${b.phoneDisplay} raqamiga qoʻngʻiroq qilish`,
  },

  status: {
    hours: 'Du–Sha 9:00–19:00, Yak 11:00–16:00',
    noLunch: 'tushliksiz',
    openUntil: '{t} gacha ochiq',
    closedToday: 'Yopiq · {t} da ochiladi',
    closedTomorrow: 'Yopiq · ertaga {t} da ochiladi',
    closedDay: 'Yopiq · {d} {t} da ochiladi',
    closed: 'Hozir yopiq',
    days: ['yakshanba kuni', 'dushanba kuni', 'seshanba kuni', 'chorshanba kuni', 'payshanba kuni', 'juma kuni', 'shanba kuni'],
    title: 'Ish vaqti Google Xaritalardan olingan',
  },

  address: {
    city: 'Toshkent',
    district: 'Yunusobod tumani',
    street: 'Ziyolilar, 42',
    full: 'Toshkent, Ziyolilar, 42',
    landmark: 'Sobiq Lakokraska zavodi, «Horrot» restorani yonida',
  },

  services: {
    title: 'Xizmatlar va narxlar',
    inspection: {
      name: 'Texnik koʻrik',
      price: price(s.inspection.priceUZS, s.inspection.from),
      meta: `${mins} daqiqa · DAN bazasiga darhol kiritamiz`,
      need: 'Kerakli hujjat: texpasport',
      more: 'Nimalar kerak va qanday oʻtadi',
    },
    gas: {
      name: 'GBO va SPG opressovkasi',
      price: price(s.gas.priceUZS, s.gas.from),
      meta: 'Gazda yuradigan avtomobillarga texnik koʻrik uchun kerak',
      need: 'Opressovka dalolatnomasini beramiz',
      more: 'Batafsil',
    },
    insurance: {
      name: 'Avtosugʻurta',
      price: price(s.insurance.priceUZS, s.insurance.from),
      meta: 'Haydovchilar soni cheklanmagan',
      more: 'Telegram orqali rasmiylashtirish',
      tgText: 'Assalomu alaykum! Avtosugʻurta rasmiylashtirmoqchiman.',
    },
    bundle: 'Mashinangiz gazdami? Opressovka, texnik koʻrik va avtosugʻurta — hammasi bitta joyda.',
  },

  where: {
    title: 'Manzilimiz',
    mapTitle: 'Autocheck Lab Yandex Xaritalarda',
    yandex: 'Yandex Xaritalar',
    google: 'Google Maps',
    build: 'Marshrut tuzish',
    hoursLabel: 'Ish vaqti',
  },

  lead: {
    title: `${b.callbackSlaMin} daqiqa ichida qoʻngʻiroq qilamiz`,
    titleClosed: 'Ochilishimiz bilanoq qoʻngʻiroq qilamiz',
    inlineTitle: 'Raqamingizni qoldiring — oʻzimiz qoʻngʻiroq qilamiz',
    inlineSub: `Ish vaqtida ${b.callbackSlaMin} daqiqa ichida qoʻngʻiroq qilamiz.`,
    phoneLabel: 'Telefon raqamingiz',
    serviceLabel: 'Xizmat',
    chips: { inspection: 'Texnik koʻrik', gas_test: 'Opressovka', insurance: 'Sugʻurta' },
    submit: 'Qoʻngʻiroqni kutaman',
    sending: 'Yuborilmoqda…',
    or: 'yoki oʻzingiz qoʻngʻiroq qiling',
    ok: `Arizangiz qabul qilindi. ${b.phoneDisplay} raqamidan qoʻngʻiroq qilamiz.`,
    errPhone: '+998 dan keyin 9 ta raqam kiriting',
    errSend: 'Yuborilmadi. Bizga qoʻngʻiroq qiling:',
  },

  reviews: {
    title: 'Sharhlar',
    google: 'Google',
    yandex: 'Yandex Xaritalar',
    count: '{n} ta sharh',
    read: 'Oʻqish',
    write: 'Sharh qoldirish',
    googleHint: 'Google Xaritalardagi reyting va sharhlar',
    badgeTitle: 'Autocheck Lab reytingi Yandex Xaritalarda',
  },

  feedback: {
    title: 'Fikr-mulohaza',
    q: 'Shikoyat yoki taklifingiz bormi?',
    sub: 'Rahbarning oʻzi oʻqiydi',
    open: 'Yozish',
    hide: 'Yopish',
    complaint: 'Shikoyat',
    suggestion: 'Taklif',
    textLabel: 'Xabar',
    textPh: 'Nima boʻldi yoki nimani yaxshilash kerak?',
    phonePh: 'Javob kerak boʻlsa, telefon raqamingiz',
    send: 'Yuborish',
    ok: 'Rahmat, xabaringiz rahbarga yetkazildi.',
    errText: 'Kamida bir necha soʻz yozing.',
    errSend: 'Yuborilmadi. Qayta urinib koʻring yoki bizga qoʻngʻiroq qiling.',
  },

  footer: {
    contacts: 'Aloqa',
    accr: `Akkreditatsiya ${b.accreditation}`,
    privacy: 'Maxfiylik siyosati',
  },

  faqTitle: 'Koʻp beriladigan savollar',

  home: {
    title: 'Toshkentda navbatsiz texnik koʻrik · Autocheck Lab',
    description: `Toshkentda avtomobil texnik koʻrigi ${mins} daqiqada: navbatsiz, ortiqcha toʻlovsiz, DAN bazasiga darhol kiritamiz. GBO opressovkasi, avtosugʻurta. Yunusobod, Ziyolilar, 42.`,
    h1a: 'Texnik koʻrik',
    h1b: 'Toshkentda',
    sub: 'Navbatsiz, ortiqcha toʻlovsiz — DAN bazasiga shu zahoti kiritamiz.',
    whyTitle: 'Toshkentda navbatsiz texnik koʻrik',
    why: [
      { t: 'Navbatsiz', d: 'Raqamingizni qoldiring, sizga qulay vaqtni tanlab beramiz.' },
      { t: 'Ortiqcha toʻlovsiz', d: `Texnik koʻrik narxi qatʼiy: ${price(s.inspection.priceUZS, false)}.` },
      { t: 'DAN bazasiga shu zahoti', d: 'Maʼlumotlarni siz shu yerdaligingizda kiritamiz.' },
      { t: `${b.accreditation} akkreditatsiyasi`, d: 'Laboratoriyamiz avtomobillarning texnik holatini tekshirish boʻyicha akkreditatsiyadan oʻtgan.' },
    ],
    faq: [
      { q: 'Texnik koʻrik qancha turadi?', a: `${price(s.inspection.priceUZS, false)}. Taxminan ${mins} daqiqa vaqt oladi, maʼlumotlarni shu zahoti DAN bazasiga kiritamiz.` },
      { q: 'Texnik koʻrik uchun qanday hujjatlar kerak?', a: 'Avtomobil texpasporti. Mashinada gaz ballon uskunasi boʻlsa, opressovka dalolatnomasi ham kerak. Opressovkani ham shu yerning oʻzida, oʻsha kuni oʻtkazib beramiz.' },
      { q: 'Qanday yozilsa boʻladi?', a: `Raqamingizni qoldiring — qoʻngʻiroq qilib, sizga qulay vaqtni tanlab beramiz. Yoki oʻzingiz qoʻngʻiroq qiling: ${b.phoneDisplay}.` },
      { q: 'Qayerda joylashgansiz?', a: 'Toshkent, Ziyolilar, 42. Moʻljal: sobiq Lakokraska zavodi, «Horrot» restorani yonida. Tushliksiz ishlaymiz: dushanbadan shanbagacha 9:00 dan 19:00 gacha, yakshanba kuni 11:00 dan 16:00 gacha.' },
    ],
  },

  inspection: {
    title: 'Toshkentda texnik koʻrik: hujjatlar, muddat, narx',
    description: `Texnik koʻrik uchun texpasport, gazdagi avtomobilga esa opressovka dalolatnomasi kerak. ${mins} daqiqa, ${price(s.inspection.priceUZS, false)}. Autocheck Lab, Toshkent, Ziyolilar, 42.`,
    crumb: 'Texnik koʻrik',
    h1a: 'Texnik koʻrik',
    h1b: `Toshkentda · ${mins} daqiqa · ${price(s.inspection.priceUZS, false)}`,
    sub: `${b.accreditation} akkreditatsiyalangan laboratoriya. Maʼlumotlarni shu zahoti DAN bazasiga kiritamiz.`,
    facts: [
      { k: 'Narx', v: fmt(s.inspection.priceUZS), u: 'soʻm' },
      { k: 'Vaqt', v: String(mins), u: 'daqiqa' },
    ],
    docsTitle: 'Oʻzingiz bilan nimalarni olish kerak',
    docs: [
      { t: 'Texpasport', d: 'Avtomobilni qayd etish guvohnomasi.' },
      { t: 'Opressovka dalolatnomasi', d: 'Faqat avtomobilga gaz uskunasi oʻrnatilgan boʻlsa.' },
    ],
    docsNote: 'Opressovka dalolatnomasi yoʻqmi? Opressovka va texnik koʻrikni bitta joyda, oʻsha kunning oʻzida oʻtkazamiz.',
    docsLink: 'GBO va SPG opressovkasi haqida',
    stepsTitle: 'Texnik koʻrik qanday oʻtadi',
    steps: [
      { t: 'Bizga kelasiz', d: 'Toshkent, Ziyolilar, 42. Avval raqamingizni qoldirsangiz, qulay vaqtni tanlab beramiz.' },
      { t: 'Avtomobilni tekshiramiz', d: `Usta mashinaning texnik holatini tekshiradi. Bu taxminan ${mins} daqiqa davom etadi.` },
      { t: 'Maʼlumotlarni DAN bazasiga kiritamiz', d: 'Tekshiruv tugashi bilanoq, siz shu yerdaligingizda.' },
    ],
    freqTitle: 'Texnik koʻrikdan qancha vaqtda bir marta oʻtish kerak',
    freqLead: 'Bu avtomobil ishlab chiqarilgan yilga bogʻliq.',
    freq: [
      { k: 'Chiqarilganiga 10 yil toʻlmagan', v: 'Ixtiyoriy' },
      { k: '10 yildan 15 yilgacha', v: 'Ikki yilda bir marta' },
      { k: '15 yildan oshgan', v: 'Har yili' },
      { k: 'Taksi va yoʻlovchi tashuvchi avtomobillar', v: 'Har olti oyda' },
    ],
    freqSource: 'Asos:',
    formTitle: 'Texnik koʻrikka yoziling',
    faq: [
      { q: 'Texnik koʻrik qancha vaqt oladi?', a: `Taxminan ${mins} daqiqa. Maʼlumotlarni shu zahoti DAN bazasiga kiritamiz.` },
      { q: 'Texnik koʻrik qancha turadi?', a: `${price(s.inspection.priceUZS, false)}.` },
      { q: 'Qanday hujjatlar kerak?', a: 'Texpasport. Gaz ballon uskunasi oʻrnatilgan avtomobillar uchun opressovka dalolatnomasi ham kerak.' },
      { q: 'Mashinam gazda, lekin opressovka dalolatnomasi yoʻq. Nima qilish kerak?', a: `Opressovkani ham shu yerning oʻzida, oʻsha kuni oʻtkazib beramiz. Narxi ${price(s.gas.priceUZS, true)}.` },
      { q: 'Yangi mashina uchun texnik koʻrik majburiymi?', a: 'Chiqarilganiga 10 yil toʻlmagan avtomobillar texnik koʻrikdan ixtiyoriy ravishda oʻtadi. Taksi va yoʻlovchi tashuvchi mashinalar bundan mustasno: ular har olti oyda oʻtishi shart.' },
    ],
  },

  gas: {
    title: `Toshkentda GBO va SPG opressovkasi · ${price(s.gas.priceUZS, true)}`,
    description: `Texnik koʻrik uchun dalolatnoma bilan gaz ballon uskunasi opressovkasi. ${price(s.gas.priceUZS, true)}. Opressovka va texnik koʻrik bitta joyda. Autocheck Lab, Ziyolilar, 42.`,
    crumb: 'GBO opressovkasi',
    h1a: 'GBO va SPG opressovkasi',
    h1b: `Toshkentda · ${price(s.gas.priceUZS, true)}`,
    sub: 'Opressovka dalolatnomasini beramiz. U gaz uskunali avtomobilda texnik koʻrikdan oʻtish uchun kerak.',
    facts: [
      { k: 'Narx', v: fmt(s.gas.priceUZS), u: 'soʻmdan' },
      { k: 'Hujjat', v: 'Dalolatnoma', u: 'opressovka haqida' },
      { k: 'Texnik koʻrik', v: 'Shu yerda', u: 'oʻsha kunning oʻzida' },
    ],
    whoTitle: 'Opressovka kimga kerak',
    who: [
      { t: 'Gaz uskunali avtomobillarga', d: 'Opressovka dalolatnomasisiz GBO oʻrnatilgan avtomobil texnik koʻrikdan oʻta olmaydi.' },
      { t: 'Texnik koʻrikdan oldin', d: 'Hammasini bitta joyda qilish qulay: avval opressovka, keyin texnik koʻrik.' },
    ],
    priceTitle: 'Narxi qancha',
    priceText: `${price(s.gas.priceUZS, true)}. Avtomobilingiz uchun aniq narxni telefon orqali aytamiz.`,
    formTitle: 'Opressovkaga yoziling',
    faq: [
      { q: 'Opressovka nima?', a: 'Gaz balloni va uskunasini bosim ostida tekshirish. Shu yoʻl bilan tizim germetik va undan foydalanish xavfsiz ekaniga ishonch hosil qilinadi.' },
      { q: 'Texnik koʻrik uchun opressovka kerakmi?', a: 'Ha, agar avtomobilga gaz ballon uskunasi oʻrnatilgan boʻlsa. Texnik koʻrikka opressovka dalolatnomasini olib kelish kerak.' },
      { q: 'Opressovka va texnik koʻrikdan bir kunda oʻtsa boʻladimi?', a: 'Ha, hammasi bitta joyda va bir kunda.' },
      { q: 'Opressovka qancha turadi?', a: `${price(s.gas.priceUZS, true)}. Aniq narxni telefon orqali aytamiz: ${b.phoneDisplay}.` },
    ],
  },

  contacts: {
    title: 'Autocheck Lab manzili va telefoni · Toshkent',
    description: `Autocheck Lab manzili, telefoni va marshrut: Toshkent, Ziyolilar, 42. ${b.phoneDisplay}. Du–Sha 9:00–19:00, Yak 11:00–16:00.`,
    crumb: 'Aloqa',
    h1a: 'Aloqa',
    h1b: 'Toshkent, Ziyolilar, 42',
    sub: 'Qoʻngʻiroq qiling, Telegramga yozing yoki raqamingizni qoldiring.',
  },

  privacy: {
    title: 'Maxfiylik siyosati · Autocheck Lab',
    description: 'texnikorik.uz sayti qanday maʼlumotlarni yigʻadi va ulardan qanday foydalanamiz.',
    h1: 'Maxfiylik siyosati',
    updated: 'Yangilangan: 2026-yil noyabr',
    blocks: [
      { h: 'Biz kimmiz', p: [`texnikorik.uz sayti ${b.legalName} (Autocheck Lab) kompaniyasiga tegishli. Manzil: Toshkent, Ziyolilar, 42. Telefon: ${b.phoneDisplay}.`] },
      { h: 'Qanday maʼlumotlarni olamiz', p: [
        'Qayta qoʻngʻiroq uchun ariza qoldirganingizda: telefon raqamingiz va tanlangan xizmat.',
        'Shikoyat yoki taklif yuborganingizda: xabar matni va, agar koʻrsatgan boʻlsangiz, telefon raqamingiz.',
        'Shaxsi koʻrsatilmagan tashrif statistikasi: sahifalar, qurilma, oʻtish manbasi, reklama belgilari.',
      ] },
      { h: 'Nima uchun', p: [
        'Sizga qoʻngʻiroq qilib, xizmatga yozish uchun.',
        'Shikoyat yoki taklifni koʻrib chiqish uchun.',
        'Qaysi reklama ishlayotganini tushunish va saytni yaxshilash uchun.',
      ] },
      { h: 'Kimga beramiz', p: [
        'Arizalar va xabarlar Autocheck Lab xodimlariga Telegram orqali keladi. Saytda arizalar bazasini saqlamaymiz.',
        'Statistikani Google Analytics, Google Ads va Yandex Metrika yigʻadi. Saytga Yandex xaritasi va reytingi hamda Google Xaritalar maʼlumotlari ham joylangan. Bu xizmatlar oʻz qoidalariga koʻra cookie fayllaridan foydalanishi mumkin.',
        'Maʼlumotlaringizni boshqa kompaniyalarga sotmaymiz va bermaymiz.',
      ] },
      { h: 'Maʼlumotlarni qanday oʻchirish mumkin', p: [`${b.phoneDisplay} raqamiga qoʻngʻiroq qiling yoki sayt pastidagi «Shikoyat yoki taklif» shakli orqali yozing. Raqamingizni yozishmalardan oʻchirib tashlaymiz.`] },
    ],
  },

  review: {
    title: 'Sharh qoldiring · Autocheck Lab',
    description: 'Autocheck Lab ga tashrifingiz qanday oʻtganini aytib bering.',
    h1a: 'Hammasi qanday oʻtdi?',
    h1b: 'Oʻzingizga qulay joyda sharh qoldiring',
    sub: 'Biz uchun har qanday sharh muhim: yaxshisi ham, tanqidiysi ham.',
    google: 'Google da sharh',
    yandex: 'Yandex Xaritalarda sharh',
    direct: 'Faqat rahbarga yozmoqchimisiz? Quyida «Shikoyat yoki taklif» shakli bor.',
  },

  thanks: {
    title: 'Ariza qabul qilindi · Autocheck Lab',
    h1a: 'Ariza qabul qilindi',
    h1b: `${b.phoneDisplay} raqamidan qoʻngʻiroq qilamiz`,
    back: 'Bosh sahifaga',
  },

  notFound: {
    title: 'Sahifa topilmadi · Autocheck Lab',
    h1a: '404',
    h1b: 'Bunday sahifa yoʻq',
    sub: 'Havola eskirgan boʻlishi mumkin. Bizda mana bular bor:',
  },
};
