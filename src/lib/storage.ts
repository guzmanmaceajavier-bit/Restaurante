const STORAGE_KEYS = {
  RESERVAS: 'reservas',
  ORDENES: 'ordenes',
  RESENAS: 'resenas',
  IS_ADMIN: 'isAdmin',
  ADMIN_NAME: 'adminName',
} as const

export const storage = {
  getReservas: <T = unknown>(): T[] => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.RESERVAS) || '[]')
    } catch {
      return []
    }
  },
  setReservas: <T>(data: T[]): void => {
    localStorage.setItem(STORAGE_KEYS.RESERVAS, JSON.stringify(data))
  },
  getOrdenes: <T = unknown>(): T[] => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDENES) || '[]')
    } catch {
      return []
    }
  },
  setOrdenes: <T>(data: T[]): void => {
    localStorage.setItem(STORAGE_KEYS.ORDENES, JSON.stringify(data))
  },
  isAdmin: (): boolean => {
    return localStorage.getItem(STORAGE_KEYS.IS_ADMIN) === 'true'
  },
  setAdmin: (value: boolean, name?: string): void => {
    localStorage.setItem(STORAGE_KEYS.IS_ADMIN, String(value))
    if (name) localStorage.setItem(STORAGE_KEYS.ADMIN_NAME, name)
    if (!value) {
      localStorage.removeItem(STORAGE_KEYS.ADMIN_NAME)
    }
  },
  getAdminName: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.ADMIN_NAME)
  },
  clearAdmin: (): void => {
    localStorage.removeItem(STORAGE_KEYS.IS_ADMIN)
    localStorage.removeItem(STORAGE_KEYS.ADMIN_NAME)
  },
  getResenas: <T = unknown>(): T[] => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.RESENAS) || '[]')
    } catch {
      return []
    }
  },
  setResenas: <T>(data: T[]): void => {
    localStorage.setItem(STORAGE_KEYS.RESENAS, JSON.stringify(data))
  },
}
