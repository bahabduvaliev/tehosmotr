import { json, type Ctx } from './shared';

/** Что подключено на сервере. Только «да/нет», без значений. Открыть: /api/health */
export function handleHealth({ env }: Ctx): Response {
  return json({
    telegramBot: Boolean(env.TELEGRAM_BOT_TOKEN),
    leadsChat: Boolean(env.TELEGRAM_CHAT_ID),
    feedbackChat: Boolean(env.TELEGRAM_FEEDBACK_CHAT_ID),
    googlePlaces: Boolean(env.GOOGLE_PLACES_API_KEY && env.GOOGLE_PLACE_ID),
    cache: Boolean(env.PLACE_CACHE),
    dryRun: env.LEAD_DRY_RUN === '1',
  });
}
