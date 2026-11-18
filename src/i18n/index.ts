import { ru, type Dict } from './ru';
import { uz } from './uz';

export type Lang = 'ru' | 'uz';
export type PageKey = 'home' | 'inspection' | 'gas' | 'contacts' | 'privacy' | 'review' | 'thanks';

export const dict: Record<Lang, Dict> = { ru, uz };
export const t = (lang: Lang) => dict[lang];

/** Адреса страниц в обеих языковых версиях. */
export const routes: Record<PageKey, Record<Lang, string>> = {
  home: { ru: '/', uz: '/uz/' },
  inspection: { ru: '/tehosmotr/', uz: '/uz/texnik-korik/' },
  gas: { ru: '/opressovka-gbo/', uz: '/uz/gbo-opressovka/' },
  contacts: { ru: '/kontakty/', uz: '/uz/kontaktlar/' },
  privacy: { ru: '/privacy/', uz: '/uz/maxfiylik/' },
  review: { ru: '/otzyv/', uz: '/uz/sharh/' },
  thanks: { ru: '/spasibo/', uz: '/uz/rahmat/' },
};

/** Страницы, которые попадают в sitemap и индексируются. */
export const indexable: PageKey[] = ['home', 'inspection', 'gas', 'contacts', 'privacy'];

export const lawName: Record<Lang, string> = { ru: 'ПКМ № 978', uz: 'VMQ 978-son' };
export type { Dict };
