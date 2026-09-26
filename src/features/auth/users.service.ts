import { STORAGE_KEYS } from '../../services/storage/storageKeys';
import { readJson, writeJson } from '../../services/storage/jsonStore';
import { activityStorage } from '../../services/storage/activityStorage';

export type RolUsuario = 'Administrador' | 'Gerente' | 'Cajero' | 'Cocina' | 'Mesero' | 'Marketing';

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: RolUsuario;
  permisos: string[];
  activo: boolean;
}

export type UsuarioInput = { id?: string } & Omit<Usuario, 'id'>;
export type ResultadoUsuario =
  | { ok: true; usuarios: Usuario[] }
  | { ok: false; error: string; usuarios?: undefined };

const DEFAULT_USERS: Usuario[] = [
  { id: 'u1', nombre: 'Javier (Admin)', email: 'admin@sabor.com', rol: 'Administrador', permisos: ['Ver', 'Crear', 'Editar', 'Eliminar'], activo: true },
  { id: 'u2', nombre: 'Ana Cajera', email: 'ana@sabor.com', rol: 'Cajero', permisos: ['Ver', 'Crear'], activo: true },
];

function persistir(usuarios: Usuario[]): void {
  writeJson(STORAGE_KEYS.USERS_ROLES, usuarios);
  activityStorage.push('Usuarios', 'Actualización de usuarios y roles');
}

/**
 * Dominio de usuarios y roles (RBAC básico demo). Hoy persiste en
 * localStorage vía adapters; mañana: /api/users.
 */
export const usersService = {
  getOrSeed: (): Usuario[] => {
    const stored = readJson<Usuario[]>(STORAGE_KEYS.USERS_ROLES, []);
    return stored.length ? stored : DEFAULT_USERS;
  },

  saveAll: (usuarios: Usuario[]): void => persistir(usuarios),

  filterUsuarios: (usuarios: Usuario[], busqueda: string): Usuario[] => {
    if (!busqueda) return usuarios;
    const q = busqueda.toLowerCase();
    return usuarios.filter(
      (u) => u.nombre.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
    );
  },

  guardarUsuario: (input: UsuarioInput, actuales: Usuario[]): ResultadoUsuario => {
    if (!input.nombre.trim() || !input.email.trim()) {
      return { ok: false, error: 'Nombre y email requeridos' };
    }
    const { id, ...data } = input;
    const usuarios = id
      ? actuales.map((u) => (u.id === id ? { ...u, ...data } : u))
      : [...actuales, { ...data, id: `usr_${Date.now()}` }];
    persistir(usuarios);
    return { ok: true, usuarios };
  },

  eliminarUsuario: (id: string, actuales: Usuario[]): Usuario[] => {
    const usuarios = actuales.filter((u) => u.id !== id);
    persistir(usuarios);
    return usuarios;
  },
};
