import { tableStorage } from '../../services/storage/tableStorage';

export interface Mesa {
  id: string;
  numero: number;
  ubicacion: string;
  estado: string;
  occupiedSince?: string;
}

export interface StatsMesas {
  total: number;
  libres: number;
  ocupadas: number;
  reservadas: number;
}

export interface MesaInput {
  id?: string;
  numero: number;
  ubicacion: string;
  estado: string;
}

export type ResultadoMesa =
  | { ok: true; mesas: Mesa[] }
  | { ok: false; error: string; mesas?: undefined };

const DEFAULT_TABLES: Mesa[] = [
  { id: 'm1', numero: 1, ubicacion: 'Interior', estado: 'disponible' },
  { id: 'm2', numero: 2, ubicacion: 'Interior', estado: 'disponible' },
  { id: 'm3', numero: 3, ubicacion: 'Interior', estado: 'ocupada' },
  { id: 'm4', numero: 4, ubicacion: 'Terraza', estado: 'disponible' },
  { id: 'm5', numero: 5, ubicacion: 'Terraza', estado: 'reservada' },
  { id: 'm6', numero: 6, ubicacion: 'Barra', estado: 'disponible' },
  { id: 'm7', numero: 7, ubicacion: 'Zona Privada', estado: 'disponible' },
  { id: 'm8', numero: 8, ubicacion: 'Interior', estado: 'mantenimiento' },
];

/** Marca temporal de ocupación: se fija al ocupar, se limpia al liberar. */
function stampOcupacion(estado: string, actual?: string): string | undefined {
  return estado === 'ocupada' ? actual || new Date().toISOString() : undefined;
}

/**
 * Dominio del salón/mesas. Hoy persiste en localStorage vía adapters;
 * mañana: /api/tables. Las páginas no tocan storage directamente.
 */
export const tableService = {
  getOrSeed: (): Mesa[] => {
    const stored = tableStorage.getAll<Mesa>();
    return stored.length ? stored : DEFAULT_TABLES;
  },

  saveAll: (mesas: Mesa[]): void => tableStorage.saveAll(mesas),

  getStats: (mesas: Mesa[]): StatsMesas => ({
    total: mesas.length,
    libres: mesas.filter((m) => m.estado === 'disponible').length,
    ocupadas: mesas.filter((m) => m.estado === 'ocupada').length,
    reservadas: mesas.filter((m) => m.estado === 'reservada').length,
  }),

  guardarMesa: (input: MesaInput, actuales: Mesa[]): ResultadoMesa => {
    if (!input.numero || input.numero <= 0) return { ok: false, error: 'Número válido' };
    if (actuales.some((m) => m.numero === input.numero && m.id !== input.id)) {
      return { ok: false, error: 'Número ya existe' };
    }
    if (!input.ubicacion) return { ok: false, error: 'Ubicación requerida' };
    let mesas: Mesa[];
    if (input.id) {
      mesas = actuales.map((m) =>
        m.id === input.id
          ? { ...m, numero: input.numero, ubicacion: input.ubicacion, estado: input.estado, occupiedSince: stampOcupacion(input.estado, m.occupiedSince) }
          : m,
      );
    } else {
      mesas = [
        ...actuales,
        {
          id: `mesa_${Date.now()}`,
          numero: input.numero,
          ubicacion: input.ubicacion,
          estado: input.estado,
          occupiedSince: stampOcupacion(input.estado),
        },
      ];
    }
    tableStorage.saveAll(mesas);
    return { ok: true, mesas };
  },

  cambiarEstado: (id: string, estado: string): Mesa[] => {
    const mesas = tableStorage.getAll<Mesa>().map((m) =>
      m.id === id ? { ...m, estado, occupiedSince: stampOcupacion(estado, m.occupiedSince) } : m,
    );
    tableStorage.saveAll(mesas);
    return mesas;
  },

  eliminarMesa: (id: string): Mesa[] => {
    const mesas = tableStorage.getAll<Mesa>().filter((m) => m.id !== id);
    tableStorage.saveAll(mesas);
    return mesas;
  },
};
