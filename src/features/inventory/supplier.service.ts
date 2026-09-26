import { purchaseStorage } from '../../services/storage/purchaseStorage';

export interface Proveedor {
  id: string;
  nombre: string;
  contacto: string;
  telefono: string;
  email: string;
  categoria: string;
  estado: 'activo' | 'inactivo';
}

export type ProveedorInput = { id?: string } & Omit<Proveedor, 'id'>;
export type ResultadoProveedor =
  | { ok: true; proveedores: Proveedor[] }
  | { ok: false; error: string; proveedores?: undefined };

const DEFAULT_SUPPLIERS: Proveedor[] = [
  { id: 'p1', nombre: 'Distribuciones La Sabana', contacto: 'Carlos Ruiz', telefono: '3101234567', email: 'ventas@sabana.com', categoria: 'Carnes', estado: 'activo' },
  { id: 'p2', nombre: 'Frutas del Valle', contacto: 'María López', telefono: '3129876543', email: 'info@frutasvalle.com', categoria: 'Frutas/Verduras', estado: 'activo' },
  { id: 'p3', nombre: 'Lácteos Córdoba', contacto: 'Jorge Díaz', telefono: '3005551234', email: 'pedidos@lacteoscordoba.com', categoria: 'Lácteos', estado: 'activo' },
];

/**
 * Dominio de proveedores. Hoy persiste en localStorage vía adapters;
 * mañana: /api/suppliers. Las páginas no tocan storage directamente.
 */
export const supplierService = {
  getAll: (): Proveedor[] => purchaseStorage.getSuppliers<Proveedor>(),

  getOrSeed: (): Proveedor[] => {
    const stored = purchaseStorage.getSuppliers<Proveedor>();
    return stored.length ? stored : DEFAULT_SUPPLIERS;
  },

  saveAll: (proveedores: Proveedor[]): void => purchaseStorage.saveSuppliers(proveedores),

  filterProveedores: (proveedores: Proveedor[], busqueda: string): Proveedor[] =>
    proveedores.filter(
      (p) =>
        !busqueda ||
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.categoria.toLowerCase().includes(busqueda.toLowerCase()),
    ),

  guardarProveedor: (input: ProveedorInput, actuales: Proveedor[]): ResultadoProveedor => {
    if (!input.nombre.trim()) return { ok: false, error: 'Nombre requerido' };
    const { id, ...data } = input;
    const proveedores = id
      ? actuales.map((p) => (p.id === id ? { ...p, ...data } : p))
      : [...actuales, { ...data, id: `prov_${Date.now()}` }];
    purchaseStorage.saveSuppliers(proveedores);
    return { ok: true, proveedores };
  },

  eliminarProveedor: (id: string, actuales: Proveedor[]): Proveedor[] => {
    const proveedores = actuales.filter((p) => p.id !== id);
    purchaseStorage.saveSuppliers(proveedores);
    return proveedores;
  },
};
