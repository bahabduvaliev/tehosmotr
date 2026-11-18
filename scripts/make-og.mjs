// Рисует картинки для соцсетей (public/og/*.png), иконку и логотип. Запуск: npm run og
import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const font = (p) => `data:font/woff2;base64,${readFileSync(root + 'node_modules/' + p).toString('base64')}`;
const logoSrc = readFileSync(root + 'src/data/logo.ts', 'utf8');
const grab = (name) => {
  const m = logoSrc.match(new RegExp(`export const ${name} = \\{ w: (\\d+), h: (\\d+), d: '([^']+)' \\}`));
  return { w: +m[1], h: +m[2], d: m[3] };
};
const icon = grab('icon');
const word = grab('word');

const cards = {
  'ru-home': ['Техосмотр', 'в Ташкенте · без очередей и переплат', 'Ташкент, Зиёлилар, 42 · аккредитация ML1016'],
  'ru-inspection': ['Техосмотр авто', 'документы, сроки, цена', 'Ташкент, Зиёлилар, 42 · аккредитация ML1016'],
  'ru-gas': ['Опрессовка ГБО и СПГ', 'от 450 000 сум · акт для техосмотра', 'Ташкент, Зиёлилар, 42 · аккредитация ML1016'],
  'uz-home': ['Texnik koʻrik', 'Toshkentda · navbatsiz, ortiqcha toʻlovsiz', 'Toshkent, Ziyolilar, 42 · akkreditatsiya ML1016'],
  'uz-inspection': ['Texnik koʻrik', 'hujjatlar, muddat, narx', 'Toshkent, Ziyolilar, 42 · akkreditatsiya ML1016'],
  'uz-gas': ['GBO va SPG opressovkasi', '450 000 soʻmdan · texnik koʻrik uchun dalolatnoma', 'Toshkent, Ziyolilar, 42 · akkreditatsiya ML1016'],
};

const css = `
@font-face{font-family:Onest;src:url(${font('@fontsource-variable/onest/files/onest-cyrillic-wght-normal.woff2')}) format('woff2');font-weight:100 900;unicode-range:U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116}
@font-face{font-family:Onest;src:url(${font('@fontsource-variable/onest/files/onest-latin-wght-normal.woff2')}) format('woff2');font-weight:100 900}
@font-face{font-family:Plex;src:url(${font('@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-600-normal.woff2')}) format('woff2');font-weight:600}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;background:#FFD400;color:#0B0B0B;font-family:Onest,sans-serif;padding:64px 72px;display:flex;flex-direction:column}
.logo{height:52px;align-self:flex-start}
h1{margin-top:auto;font-size:var(--fs);line-height:.92;font-weight:800;letter-spacing:-.045em}
h2{font-size:44px;font-weight:700;margin-top:18px;letter-spacing:-.01em}
.row{display:flex;align-items:center;gap:28px;margin-top:40px}
.plate{display:inline-flex;height:76px;background:#fff;border:4px solid #0B0B0B;border-radius:10px;font:600 38px/1 Plex,monospace;box-shadow:0 4px 0 #0B0B0B}
.plate span{display:flex;align-items:center;padding:0 16px}
.plate .r{border-right:4px solid #0B0B0B}
p{font-size:25px;font-weight:600}
`;
const logoSvg = (color) => {
  const s = 1.55, gap = 56, W = Math.round(icon.w + gap + word.w * s), wy = Math.round((icon.h - word.h * s) / 2);
  return `<svg class="logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${icon.h}"><path fill="${color}" fill-rule="evenodd" d="${icon.d}"/><path fill="${color}" fill-rule="evenodd" transform="translate(${icon.w + gap} ${wy}) scale(${s})" d="${word.d}"/></svg>`;
};
const iconSvg = (size, pad) => {
  const k = (size - pad * 2) / icon.w, y = (size - icon.h * k) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" rx="${size * 0.18}" fill="#FFD400"/><path fill="#0B0B0B" fill-rule="evenodd" transform="translate(${pad} ${y.toFixed(1)}) scale(${k.toFixed(4)})" d="${icon.d}"/></svg>`;
};

mkdirSync(root + 'public/og', { recursive: true });
writeFileSync(root + 'public/favicon.svg', iconSvg(64, 7));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const [name, [h1, h2, foot]] of Object.entries(cards)) {
  const fs = h1.length > 16 ? 96 : h1.length > 11 ? 130 : 168;
  await page.setContent(`<style>${css}</style><body style="--fs:${fs}px">${logoSvg('#0B0B0B')}<h1>${h1}</h1><h2>${h2}</h2><div class="row"><div class="plate"><span class="r">95</span><span>055 65 55</span></div><p>${foot}</p></div></body>`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `${root}public/og/${name}.png` });
}
await page.setViewportSize({ width: 180, height: 180 });
await page.setContent(`<body style="margin:0">${iconSvg(180, 22).replace('rx="32.4"', 'rx="0"')}</body>`);
await page.screenshot({ path: root + 'public/apple-touch-icon.png' });
await page.setViewportSize({ width: 512, height: 512 });
await page.setContent(`<body style="margin:0">${iconSvg(512, 60).replace(/rx="[^"]+"/, 'rx="0"')}</body>`);
await page.screenshot({ path: root + 'public/logo.png' });
await browser.close();
console.log('Готово: public/og, favicon.svg, apple-touch-icon.png, logo.png');
