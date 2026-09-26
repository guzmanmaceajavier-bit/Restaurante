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

const DEFAULT_REWARDS: Recompensa[] = [
  { name: 'Descuento $10.000', cost: 100, icon: '🏷️', desc: '$10.000' },
  { name: 'Bebida gratis', cost: 50, icon: '🥤', desc: 'Bebida' },
  { name: 'Postre gratis', cost: 75, icon: '🍰', desc: 'Postre' },
  { name: 'Envío gratis', cost: 30, icon: '🚴', desc: 'Envío' },
];

/** Fachada de fidelización. Hoy lee localStorage; mañana: /api/loyalty. */
export const loyaltyService = {
  getConfig: (): LoyaltyConfig =>
    loyaltyStorage.getConfig({ pesosPorPunto: FIDELIDAD_CONFIG.pesosPorPunto, puntosCanje: FIDELIDAD_CONFIG.puntosCanje }),
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
};
