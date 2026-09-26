import { CONFIG, type Promocion } from '../../lib/config';
import { STORAGE_KEYS } from '../../services/storage/storageKeys';
import { readJson, writeJson } from '../../services/storage/jsonStore';

export type PromocionForm = Omit<Promocion, 'id'>;
export type ResultadoPromocion =
  | { ok: true; promociones: Promocion[] }
  | { ok: false; error: string; promociones?: undefined };

/**
 * Dominio de promociones admin. Hoy persiste en localStorage vía adapters;
 * mañana: /api/promotions. Las páginas no tocan storage directamente.
 */
export const promotionService = {
  getAdmin: (): Promocion[] => readJson<Promocion[]>(STORAGE_KEYS.PROMOTIONS_ADMIN, []),
  saveAdmin: (promotions: Promocion[]): void => writeJson(STORAGE_KEYS.PROMOTIONS_ADMIN, promotions),

  /** Vigentes: override guardado o catálogo base de CONFIG. */
  getVigentes: (): Promocion[] => {
    const stored = readJson<Promocion[]>(STORAGE_KEYS.PROMOTIONS_ADMIN, []);
    if (stored.length) return stored.filter((p) => p.vigente);
    return CONFIG.promociones.filter((p) => p.vigente);
  },

  filterPromociones: (promociones: Promocion[], busqueda: string): Promocion[] => {
    if (!busqueda) return promociones;
    const q = busqueda.toLowerCase();
    return promociones.filter(
      (p) => p.titulo.toLowerCase().includes(q) || p.codigo?.toLowerCase().includes(q),
    );
  },

  guardarPromocion: (
    form: PromocionForm,
    editing: Promocion | null,
    actuales: Promocion[],
  ): ResultadoPromocion => {
    if (!form.titulo.trim()) return { ok: false, error: 'El título es requerido' };
    if (!form.descripcion.trim()) return { ok: false, error: 'La descripción es requerida' };
    if (form.descuento < 0 || form.descuento > 100) {
      return { ok: false, error: 'El descuento debe ser entre 0 y 100' };
    }
    const promociones = editing
      ? actuales.map((p) => (p.id === editing.id ? { ...p, ...form } : p))
      : [...actuales, { ...form, id: `promo_${Date.now()}` }];
    writeJson(STORAGE_KEYS.PROMOTIONS_ADMIN, promociones);
    return { ok: true, promociones };
  },

  toggleVigente: (id: string, actuales: Promocion[]): Promocion[] => {
    const promociones = actuales.map((p) => (p.id === id ? { ...p, vigente: !p.vigente } : p));
    writeJson(STORAGE_KEYS.PROMOTIONS_ADMIN, promociones);
    return promociones;
  },

  eliminarPromocion: (id: string, actuales: Promocion[]): Promocion[] => {
    const promociones = actuales.filter((p) => p.id !== id);
    writeJson(STORAGE_KEYS.PROMOTIONS_ADMIN, promociones);
    return promociones;
  },
};
