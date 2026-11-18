import type { APIRoute } from 'astro';
import { business } from '../data/business';
import { indexable, routes } from '../i18n';

export const GET: APIRoute = () => {
  const now = new Date().toISOString().slice(0, 10);
  const urls = indexable.flatMap((key) =>
    (['ru', 'uz'] as const).map(
      (lang) => `  <url>
    <loc>${business.domain}${routes[key][lang]}</loc>
    <lastmod>${now}</lastmod>
    <xhtml:link rel="alternate" hreflang="ru-UZ" href="${business.domain}${routes[key].ru}"/>
    <xhtml:link rel="alternate" hreflang="uz-UZ" href="${business.domain}${routes[key].uz}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${business.domain}${routes[key].ru}"/>
  </url>`,
    ),
  );
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
