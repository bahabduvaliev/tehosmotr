import { handleLead } from '../../server/lead';
import type { Ctx } from '../../server/shared';
export const onRequestPost = (ctx: Ctx) => handleLead(ctx);
