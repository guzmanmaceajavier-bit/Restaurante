import { activityStorage } from '../services/storage/activityStorage';

export function logActivity(accion: string, detalle: string) {
  activityStorage.push(accion, detalle);
}
