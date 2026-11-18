import { business as b } from './business';
import { routes, t, type Lang, type PageKey } from '../i18n';

export const faqLd = (items: { q: string; a: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map((x) => ({ '@type': 'Question', name: x.q, acceptedAnswer: { '@type': 'Answer', text: x.a } })),
});

export const crumbLd = (lang: Lang, page: PageKey, name: string) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: t(lang).nav.home, item: b.domain + routes.home[lang] },
    { '@type': 'ListItem', position: 2, name, item: b.domain + routes[page][lang] },
  ],
});

export const serviceLd = (lang: Lang, key: 'inspection' | 'gas', name: string, description: string) => {
  const s = b.services[key];
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    serviceType: name,
    url: b.domain + routes[key][lang],
    provider: { '@id': `${b.domain}/#business` },
    areaServed: { '@type': 'City', name: t(lang).address.city },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'UZS',
      ...(s.from ? { priceSpecification: { '@type': 'PriceSpecification', minPrice: s.priceUZS, priceCurrency: 'UZS' } } : { price: s.priceUZS }),
    },
  };
};
