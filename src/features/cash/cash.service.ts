import { cashStorage } from '../../services/storage/cashStorage';
import type { CashExpense, CashMovement } from '../../services/storage/cashStorage';

/** Fachada de caja. Hoy lee localStorage; mañana: /api/cash. */
export const cashService = {
  getMovements: <T = CashMovement>(): T[] => cashStorage.getMovements<T>(),
  saveMovements: <T>(movements: T[]): void => cashStorage.saveMovements(movements),
  getExpenses: <T = CashExpense>(): T[] => cashStorage.getExpenses<T>(),
  isOpen: (): boolean => cashStorage.isOpen(),
  setOpen: (open: boolean): void => cashStorage.setOpen(open),
  getOpeningAmount: (): number => cashStorage.getOpeningAmount(),
  setOpeningAmount: (amount: number): void => cashStorage.setOpeningAmount(amount),
};
