export interface Evento { id:string; titulo:string; descripcion:string; icono:string; features:string[]; activo:boolean }

const KEY='eventos_admin'
const defaults: Evento[] = [
  { id:'ev1', titulo:'Cumpleaños', descripcion:'Celebra tu día especial con nosotros. Menú personalizado, decoración y pastel incluido.', icono:'FaBirthdayCake', features:['Menú especial','Decoración temática','Pastel de cortesía','Música ambiental'], activo:true },
  { id:'ev2', titulo:'Eventos Empresariales', descripcion:'Reuniones de negocios, almuerzos corporativos y cenas de empresa.', icono:'FaBriefcase', features:['Salón privado','Equipo audiovisual','Menú ejecutivo','Atención personalizada'], activo:true },
  { id:'ev3', titulo:'Reuniones Familiares', descripcion:'Espacio perfecto para compartir en familia con un ambiente acogedor.', icono:'FaUsers', features:['Menú infantil','Zona privada','Precios especiales','Estacionamiento'], activo:true },
  { id:'ev4', titulo:'Catering para Eventos', descripcion:'Llevamos nuestros sabores a tus eventos. Bodas, fiestas y más.', icono:'FaGlassCheers', features:['Menú personalizado','Buffet o servicio a la mesa','Bebidas incluidas','Transporte'], activo:true },
]

export const eventService = {
  getAll: (): Evento[] => {
    try { const raw=localStorage.getItem(KEY); if(raw) return JSON.parse(raw); } catch {}
    return defaults
  },
  save: (data: Evento[]) => localStorage.setItem(KEY, JSON.stringify(data)),
  getActivos: (): Evento[] => eventService.getAll().filter(e=> e.activo),
}
