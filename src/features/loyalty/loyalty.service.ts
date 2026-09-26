import { loyaltyStorage } from '../../services/storage/loyaltyStorage';
import type { LoyaltyConfig, LoyaltyHistoryEntry } from '../../services/storage/loyaltyStorage';
import { FIDELIDAD_CONFIG } from './fidelidad';

export interface Recompensa {
  name?: string;
  nombre?: string;
  cost?: number;
  puntos?: number;
  icon?: string;
  desc?: string;
  descripcion?: string;
}

export interface RecompensaAdmin {
  id: string;
  nombre: string;
  puntos: number;
  descripcion: string;
  activa: boolean;
}

const ADMIN_DEFAULT_REWARDS: RecompensaAdmin[] = [
  { id: 'r1', nombre: 'Plato gratis', puntos: 100, descripcion: 'Canjea 100 puntos por un plato a elección', activa: true },
  { id: 'r2', nombre: 'Postre gratis', puntos: 50, descripcion: '50 puntos = postre', activa: true },
  { id: 'r3', nombre: 'Descuento 20%', puntos: 80, descripcion: '20% en tu próxima compra', activa: true },
];

const DEFAULT_REWARDS: Recompensa[] = [
  { name: 'Descuento $10.000', cost: 100, icon: '🏷️', desc: '$10.000' },
  { name: 'Bebida gratis', cost: 50, icon: '🥤', desc: 'Bebida' },
  { name: 'Postre gratis', cost: 75, icon: '🍰', desc: 'Postre' },
  { name: 'Envío gratis', cost: 30, icon: '🚴', desc: 'Envío' },
];

/** Fachada de fidelización. Hoy lee localStorage; mañana: /api/loyalty. */
export const loyaltyService = {
  getConfig: (fallback?: LoyaltyConfig): LoyaltyConfig =>
    loyaltyStorage.getConfig(
      fallback ?? { pesosPorPunto: FIDELIDAD_CONFIG.pesosPorPunto, puntosCanje: FIDELIDAD_CONFIG.puntosCanje },
    ),
  saveConfig: (config: LoyaltyConfig): void => loyaltyStorage.saveConfig(config),
  getRewards: <T>(): T[] => loyaltyStorage.getRewards<T>(),
  saveRewards: <T>(rewards: T[]): void => loyaltyStorage.saveRewards(rewards),
  getHistory: (clientId: string): LoyaltyHistoryEntry[] => loyaltyStorage.getHistory(clientId),
  prependHistory: (clientId: string, entry: LoyaltyHistoryEntry): void =>
    loyaltyStorage.prependHistory(clientId, entry),

  /** Recompensas guardadas o el catálogo por defecto. */
  getRewardsOrDefaults: (): Recompensa[] => {
    const stored = loyaltyStorage.getRewards<Recompensa>();
    return stored.length ? stored : DEFAULT_REWARDS;
  },

  registrarCanje: (clientId: string, nombre: string, costo: number): void =>
    loyaltyStorage.prependHistory(clientId, {
      id: `canje-${Date.now()}`,
      nombre,
      costo,
      fecha: new Date().toISOString(),
    }),

  getAdminRewardsOrDefaults: (): RecompensaAdmin[] => {
    const stored = loyaltyStorage.getRewards<RecompensaAdmin>();
    return stored.length ? stored : ADMIN_DEFAULT_REWARDS;
  },

  guardarRecompensa: (
    form: Omit<RecompensaAdmin, 'id'>,
    editing: RecompensaAdmin | null,
    actuales: RecompensaAdmin[],
  ): RecompensaAdmin[] => {
    const recompensas = editing
      ? actuales.map((r) => (r.id === editing.id ? { ...r, ...form } : r))
      : [...actuales, { ...form, id: `rew_${Date.now()}` }];
    loyaltyStorage.saveRewards(recompensas);
    return recompensas;
  },

  eliminarRecompensa: (id: string, actuales: RecompensaAdmin[]): RecompensaAdmin[] => {
    const recompensas = actuales.filter((r) => r.id !== id);
    loyaltyStorage.saveRewards(recompensas);
    return recompensas;
  },
};
