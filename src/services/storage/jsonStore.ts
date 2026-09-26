/** Acceso seguro a localStorage con fallback. Único punto de lectura/escritura. */
export function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null || raw === '') return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* almacenamiento no disponible (modo privado, cuota) */
  }
}

export function readString(key: string, fallback = ''): string {
  try {
    const value = localStorage.getItem(key);
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

export function writeString(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* noop */
  }
}

export function readNumber(key: string, fallback = 0): number {
  const value = Number(readString(key, ''));
  return Number.isNaN(value) ? fallback : value;
}

export function removeKeys(keys: string[]): void {
  try {
    keys.forEach((key) => localStorage.removeItem(key));
  } catch {
    /* noop */
  }
}
