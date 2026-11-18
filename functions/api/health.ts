import { handleHealth } from '../../server/health';
import type { Ctx } from '../../server/shared';
export const onRequestGet = (ctx: Ctx) => handleHealth(ctx);
