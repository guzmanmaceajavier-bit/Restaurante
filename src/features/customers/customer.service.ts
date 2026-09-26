import { customerStorage } from '../../services/storage/customerStorage';
import type { StoredCustomer } from '../../services/storage/customerStorage';

/** Fachada de clientes (vista admin). Hoy lee localStorage; mañana: /api/customers. */
export const customerService = {
  getAll: <T = StoredCustomer>(): T[] => customerStorage.getAll<T>(),
  saveAll: <T>(customers: T[]): void => {
    customerStorage.saveAll(customers);
    customerStorage.saveAdmin(customers);
  },
};
