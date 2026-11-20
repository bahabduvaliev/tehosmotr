import { handleLead } from './lead';
import { handleFeedback } from './feedback';
import { handlePlace } from './place';
import { handleHealth } from './health';
import type { Ctx, Env } from './shared';

/** Точка входа для Cloudflare Workers: /api/* обрабатываем сами, остальное отдаём из dist/. */
interface WorkerEnv extends Env { ASSETS: { fetch(req: Request): Promise<Response> } }
interface ExecCtx { waitUntil(p: Promise<unknown>): void }

const routes: Record<string, { method: string; handle: (c: Ctx) => Response | Promise<Response> }> = {
  '/api/lead': { method: 'POST', handle: handleLead },
  '/api/feedback': { method: 'POST', handle: handleFeedback },
  '/api/place': { method: 'GET', handle: handlePlace },
  '/api/health': { method: 'GET', handle: handleHealth },
};

export default {
  async fetch(request: Request, env: WorkerEnv, ctx: ExecCtx): Promise<Response> {
    const url = new URL(request.url);
    const route = routes[url.pathname.replace(/\/$/, '')];
    if (route) {
      if (request.method !== route.method) return new Response('Method Not Allowed', { status: 405, headers: { Allow: route.method } });
      return route.handle({ request, env, waitUntil: (p) => ctx.waitUntil(p) });
    }
    if (url.pathname.startsWith('/api/')) return new Response('Not Found', { status: 404 });

    const res = await env.ASSETS.fetch(request);
    // Технические адреса Cloudflare не должны попадать в поиск вместо texnikorik.uz
    if (/\.(workers|pages)\.dev$/.test(url.hostname)) {
      const out = new Response(res.body, res);
      out.headers.set('X-Robots-Tag', 'noindex');
      return out;
    }
    return res;
  },
};
