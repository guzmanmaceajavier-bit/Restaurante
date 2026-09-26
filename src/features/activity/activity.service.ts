import { activityStorage } from '../../services/storage/activityStorage';

export interface RegistroActividad {
  id: string;
  action?: string;
  entity?: string;
  entityId?: string;
  details?: string;
  timestamp?: string;
  admin?: string;
}

export interface FiltroActividad {
  busqueda: string;
  entidad: string;
}

/**
 * Dominio de actividad del sistema (vista admin). Hoy lee localStorage
 * vía adapters; mañana: /api/activity. Las páginas no tocan storage.
 */
export const activityService = {
  getAll: (): RegistroActividad[] => activityStorage.getLog<RegistroActividad>(),

  clear: (): void => activityStorage.clear(),

  filterActividades: (
    actividades: RegistroActividad[],
    filtro: FiltroActividad,
  ): RegistroActividad[] =>
    actividades
      .filter((a) => {
        if (filtro.entidad && a.entity !== filtro.entidad) return false;
        if (filtro.busqueda) {
          const q = filtro.busqueda.toLowerCase();
          return a.action?.toLowerCase().includes(q) || a.details?.toLowerCase().includes(q);
        }
        return true;
      })
      .sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()),
};
