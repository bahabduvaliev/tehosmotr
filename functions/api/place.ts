import { handlePlace } from '../../server/place';
import type { Ctx } from '../../server/shared';
export const onRequestGet = (ctx: Ctx) => handlePlace(ctx);
