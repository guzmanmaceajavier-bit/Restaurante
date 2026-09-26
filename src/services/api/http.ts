import { API_URL } from '../../constants';

/**
 * Cliente HTTP para el modo real (backend REST).
 * En modo demo no se usa: los features leen de services/storage.
 * Cuando el backend exista, cada feature cambia su servicio a estas
 * llamadas sin modificar componentes.
 */
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!response.ok) throw new ApiError(response.status, `API error ${response.status} en ${path}`);
  return (await response.json()) as T;
}

export const http = {
  get: <T>(path: string): Promise<T> => request<T>(path),
  post: <T>(path: string, body: unknown): Promise<T> =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown): Promise<T> =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  remove: <T>(path: string): Promise<T> => request<T>(path, { method: 'DELETE' }),
};
