import { handleFeedback } from '../../server/feedback';
import type { Ctx } from '../../server/shared';
export const onRequestPost = (ctx: Ctx) => handleFeedback(ctx);
