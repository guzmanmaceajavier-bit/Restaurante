import { STORAGE_KEYS } from './storageKeys';
import { readJson, writeJson } from './jsonStore';

export interface LoyaltyConfig {
  pesosPorPunto: number;
  puntosCanje: number;
  descripcion?: string;
}

export interface LoyaltyHistoryEntry {
  id: string;
  [key: string]: unknown;
}

const historyKey = (clientId: string): string => `${STORAGE_KEYS.LOYALTY_HISTORY_PREFIX}${clientId}`;
const prefsKey = (clientId: string): string => `${STORAGE_KEYS.PREFS_PREFIX}${clientId}`;

export const loyaltyStorage = {
  getConfig: (fallback: LoyaltyConfig): LoyaltyConfig => readJson<LoyaltyConfig>(STORAGE_KEYS.LOYALTY_CONFIG, fallback),
  saveConfig: (config: LoyaltyConfig): void => writeJson(STORAGE_KEYS.LOYALTY_CONFIG, config),
  getRewards: <T>(): T[] => readJson<T[]>(STORAGE_KEYS.LOYALTY_REWARDS, []),
  saveRewards: <T>(rewards: T[]): void => writeJson(STORAGE_KEYS.LOYALTY_REWARDS, rewards),
  getHistory: (clientId: string): LoyaltyHistoryEntry[] => readJson<LoyaltyHistoryEntry[]>(historyKey(clientId), []),
  prependHistory: (clientId: string, entry: LoyaltyHistoryEntry, max = 20): void =>
    writeJson(historyKey(clientId), [entry, ...readJson<LoyaltyHistoryEntry[]>(historyKey(clientId), [])].slice(0, max)),
  historyKey,
  prefsKey,
};
