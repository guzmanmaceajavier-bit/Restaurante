import { authStorage } from '../../services/storage/authStorage';

/** Roles objetivo para el backend (RBAC básico). Hoy solo se usa ADMIN/CUSTOMER. */
export type UserRole = 'ADMIN' | 'MANAGER' | 'EMPLOYEE' | 'CUSTOMER';

/**
 * Sesión admin en modo demo (bandera local).
 * En modo real: POST /api/auth/login → JWT/sesión.
 */
export const authService = {
  isAdmin: (): boolean => authStorage.isAdmin(),
  loginAdmin: (name: string): void => authStorage.setAdmin(true, name),
  logoutAdmin: (): void => authStorage.clearAdmin(),
  getAdminName: (): string | null => authStorage.getAdminName(),
};
