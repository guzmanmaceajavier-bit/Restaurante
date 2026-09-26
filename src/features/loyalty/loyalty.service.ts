import { loyaltyStorage } from '../../services/storage/loyaltyStorage';
import type { LoyaltyConfig, LoyaltyHistoryEntry } from '../../services/storage/loyaltyStorage';
import { FIDELIDAD_CONFIG } from './fidelidad';

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
};
