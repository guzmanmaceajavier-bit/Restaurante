import { STORAGE_KEYS } from './storageKeys';
import { readJson, writeJson } from './jsonStore';

export interface MensajeEnviado {
  id: string;
  mensaje: string;
  destinatarios: number;
  fecha: string;
}

export const whatsappStorage = {
  getHistorial: (): MensajeEnviado[] => readJson<MensajeEnviado[]>(STORAGE_KEYS.WHATSAPP_HISTORY, []),
  saveHistorial: (historial: MensajeEnviado[]): void =>
    writeJson(STORAGE_KEYS.WHATSAPP_HISTORY, historial),
};
