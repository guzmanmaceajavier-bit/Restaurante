export function logActivity(accion: string, detalle: string) {
  try {
    const log = JSON.parse(localStorage.getItem('activity_log') || '[]')
    log.unshift({ id: 'act_' + Date.now(), accion, detalle, fecha: new Date().toISOString(), usuario: 'Admin' })
    localStorage.setItem('activity_log', JSON.stringify(log.slice(0, 120)))
  } catch {}
}
