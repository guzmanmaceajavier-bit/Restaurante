import { STORAGE_KEYS } from './storageKeys';
import { readJson, readNumber, readString, writeJson, writeString } from './jsonStore';

export interface CashMovement {
  id: string;
  tipo: string;
  concepto: string;
  monto: number;
  [key: string]: unknown;
}

export interface CashExpense {
  id: string;
  monto: number;
  [key: string]: unknown;
}

export const cashStorage = {
  getMovements: <T = CashMovement>(): T[] => readJson<T[]>(STORAGE_KEYS.CASH_MOVEMENTS, []),
  saveMovements: <T>(movements: T[]): void => writeJson(STORAGE_KEYS.CASH_MOVEMENTS, movements),
  getExpenses: <T = CashExpense>(): T[] => readJson<T[]>(STORAGE_KEYS.EXPENSES, []),
  saveExpenses: <T>(expenses: T[]): void => writeJson(STORAGE_KEYS.EXPENSES, expenses),
  isOpen: (): boolean => readString(STORAGE_KEYS.CASH_OPEN) === 'true',
  setOpen: (open: boolean): void => writeString(STORAGE_KEYS.CASH_OPEN, String(open)),
  getOpeningAmount: (): number => readNumber(STORAGE_KEYS.CASH_OPENING_AMOUNT, 0),
  setOpeningAmount: (amount: number): void => writeString(STORAGE_KEYS.CASH_OPENING_AMOUNT, String(amount)),
};
