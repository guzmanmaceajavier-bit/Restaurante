import type { Promocion } from '../../lib/config';
import { STORAGE_KEYS } from '../../services/storage/storageKeys';
import { readJson, writeJson } from '../../services/storage/jsonStore';

/** Fachada de promociones admin. Hoy lee localStorage; mañana: /api/promotions. */
export const promotionService = {
  getAdmin: (): Promocion[] => readJson<Promocion[]>(STORAGE_KEYS.PROMOTIONS_ADMIN, []),
  saveAdmin: (promotions: Promocion[]): void => writeJson(STORAGE_KEYS.PROMOTIONS_ADMIN, promotions),
};
