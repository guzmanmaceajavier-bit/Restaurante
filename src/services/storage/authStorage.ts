import { STORAGE_KEYS } from './storageKeys';
import { readJson, readString, removeKeys, writeJson, writeString } from './jsonStore';

export interface AuthPersistState {
  state?: { clientes?: unknown[]; clienteActual?: unknown };
  version?: number;
  [key: string]: unknown;
}

export const favoritesKey = (phoneOrId: string): string => `${STORAGE_KEYS.FAVORITES_PREFIX}-${phoneOrId}`;

export const authStorage = {
  // Sesión admin (bandera local demo)
  isAdmin: (): boolean => readString(STORAGE_KEYS.IS_ADMIN) === 'true',
  setAdmin: (value: boolean, name?: string): void => {
    writeString(STORAGE_KEYS.IS_ADMIN, String(value));
    if (name) writeString(STORAGE_KEYS.ADMIN_NAME, name);
    if (!value) removeKeys([STORAGE_KEYS.ADMIN_NAME]);
  },
  getAdminName: (): string | null => {
    const name = readString(STORAGE_KEYS.ADMIN_NAME);
    return name === '' ? null : name;
  },
  clearAdmin: (): void => removeKeys([STORAGE_KEYS.IS_ADMIN, STORAGE_KEYS.ADMIN_NAME]),
  // Estado persistido de clientes (formato Zustand persist, no cambiar)
  readState: (): AuthPersistState => readJson<AuthPersistState>(STORAGE_KEYS.AUTH_CLIENT, {}),
  writeState: (state: AuthPersistState): void => writeJson(STORAGE_KEYS.AUTH_CLIENT, state),
  readClients: <T>(): T[] => readJson<AuthPersistState>(STORAGE_KEYS.AUTH_CLIENT, {}).state?.clientes as T[] ?? [],
  writeClients: <T>(clients: T[]): void => {
    const current = readJson<AuthPersistState>(STORAGE_KEYS.AUTH_CLIENT, {});
    writeJson(STORAGE_KEYS.AUTH_CLIENT, { ...current, state: { ...current.state, clientes: clients } });
  },
  // Favoritos por teléfono
  getFavorites: (phoneOrId: string): string[] => readJson<string[]>(favoritesKey(phoneOrId), []),
  setFavorites: (phoneOrId: string, favorites: string[]): void => writeJson(favoritesKey(phoneOrId), favorites),
};
