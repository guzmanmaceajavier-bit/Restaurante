export interface MetodoPago {
  id: string
  nombre: string
  icono: string
  desc: string
  numero?: string
  tipo?: string
}

export interface RedSocial {
  nombre: string
  url: string
  icono: string
}

export interface Promocion {
  id: string
  titulo: string
  descripcion: string
  imagen?: string
  descuento: number
  codigo?: string
  vigente: boolean
}

export interface Combo {
  id: string
  nombre: string
  descripcion: string
  precio: number
  precioOriginal: number
  imagen: string
  productos: string[]
  paraCompartir: boolean
}

export interface PuntosConfig {
  enabled: boolean
  pesosPorPunto: number
  puntosCanje: number
  descripcion: string
}

export interface HorarioEntrega {
  apertura: string
  cierre: string
  tiempoDomicilio: number
  tiempoRecoger: number
  tiempoMesa: number
}

export interface ProductoDestacado {
  id: string
  titulo: string
  descripcion: string
  imagen: string
  link: string
}

export type OrderType = 'eatHere' | 'delivery' | 'pickup'

export const CONFIG = {
  restaurante: {
    nombre: 'Sabor y Origen',
    nombreLargo: 'Restaurante Sabor y Origen',
    descripcion: 'Creemos en la buena comida y el excelente servicio. Nuestra misión es ofrecer experiencias únicas en cada plato, usando ingredientes frescos y recetas tradicionales con un toque moderno.',
    slogan: 'Tradición con sabor moderno',
    logo: '/logo.png',
    fundacion: 2015,
  },
  contacto: {
    direccion: 'Avenida al hospital, Sahagún - Córdoba',
    telefono: '+57 300 123 4567',
    email: 'info@restaurante.com',
    horario: 'Lunes a Domingo: 10:00 AM - 10:00 PM',
    whatsapp: '573001234567',
    mapaUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3976.7084375432424!2d-74.08083322578918!3d4.651868595338637!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3f99bcd46b6a9f%3A0x4b9c8e672e65dc91!2sBogot%C3%A1%2C%20Colombia!5e0!3m2!1ses!2sco!4v1713126587612!5m2!1ses!2sco',
  },
  horarios: {
    apertura: '10:00',
    cierre: '22:00',
    dias: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
  },
  entrega: {
    apertura: '10:00',
    cierre: '21:30',
    tiempoDomicilio: 45,
    tiempoRecoger: 20,
    tiempoMesa: 15,
  },
  redes: [
    { nombre: 'Instagram', url: 'https://www.instagram.com/tu_restaurante', icono: '📷' },
    { nombre: 'Facebook', url: 'https://www.facebook.com/tu_restaurante', icono: '👍' },
    { nombre: 'WhatsApp', url: `https://wa.me/${atob('NTczMDAxMjM0NTY3')}`, icono: '💬' },
  ] as RedSocial[],
  admin: {
    usuario: atob('YWRtaW4='),
    clave: atob('MTIzNDU='),
    nombre: 'Javier',
  },
  reservas: {
    maxPersonas: 12,
    zonas: ['Terraza', 'Interior', 'Barra', 'Zona Privada'],
    ocasiones: ['Cumpleaños', 'Aniversario', 'Reunión empresarial', 'Romántica', 'Sin ocasión especial'],
    politica: 'La reserva se mantiene por 15 minutos después de la hora acordada.',
    horarioApertura: '10:00',
    horarioCierre: '22:00',
    extras: [
      { id: 'decoracion', nombre: 'Decoración especial', precio: 15000, descripcion: 'Globos y centros de mesa' },
      { id: 'torta', nombre: 'Torta personalizada', precio: 25000, descripcion: 'Torta según la ocasión' },
      { id: 'botella', nombre: 'Botella de vino o espumante', precio: 35000, descripcion: 'Vino tinto/blanco o espumante' },
      { id: 'menu', nombre: 'Menú especial', precio: 0, descripcion: 'Menú personalizado para el evento' },
    ],
  },
  delivery: {
    tarifa: 5000,
    minimoGratis: 50000,
    barrios: ['Centro', 'San José', 'La Pradera', 'Boca de la Ceiba', 'Villa Viena', 'La Floresta', 'Altos del Rosario', 'San Roque', 'El Carmen'],
    tiempoEstimado: '30-45 min',
  },
  metodosPago: [
    { id: 'efectivo', nombre: 'Efectivo', icono: '💵', desc: 'Paga en efectivo al recibir' },
    { id: 'nequi', nombre: 'Nequi', icono: '📱', desc: 'Nequi: 3001234567', numero: '3001234567', tipo: 'Nequi' },
    { id: 'bancolombia', nombre: 'Bancolombia', icono: '🏦', desc: 'Cuenta de ahorros: 123-456789-00', numero: '12345678900', tipo: 'Cuenta de ahorros' },
    { id: 'daviplata', nombre: 'Daviplata', icono: '💳', desc: 'Daviplata: 3001234567', numero: '3001234567', tipo: 'Daviplata' },
  ] as MetodoPago[],
  promociones: [
    { id: 'promo1', titulo: '2x1 en Bandeja Paisa', descripcion: 'Todos los martes, lleva dos bandejas al precio de una', descuento: 50, vigente: true },
    { id: 'promo2', titulo: '10% de descuento en tu primera orden', descripcion: 'Usa el código BIENVENIDO10', descuento: 10, codigo: 'BIENVENIDO10', vigente: true },
    { id: 'promo3', titulo: 'Envío gratis', descripcion: 'Pedidos superiores a $50,000', descuento: 0, vigente: true },
  ] as Promocion[],
  combos: [
    { id: 'combo1', nombre: 'Combo Familiar', descripcion: '2 Bandejas Paisas + 2 Jugos + Postre', precio: 55000, precioOriginal: 68000, imagen: '', productos: ['Bandeja Paisa', 'Jugo de Lulo', 'Arroz con Leche'], paraCompartir: true },
    { id: 'combo2', nombre: 'Combo Pareja', descripcion: 'Entrada + 2 Platos fuertes + 2 Bebidas', precio: 45000, precioOriginal: 56000, imagen: '', productos: ['Empanadas', 'Ajiaco', 'Pescado Frito', 'Limonada de Coco'], paraCompartir: true },
  ] as Combo[],
  puntos: {
    enabled: true,
    pesosPorPunto: 10000,
    puntosCanje: 100,
    descripcion: 'Acumula 1 punto por cada $10,000 en compras. Canjea 100 puntos por un plato gratis.',
  } as PuntosConfig,
  marketing: {
    googleAnalyticsId: '',
    facebookPixelId: '',
    schemaRestaurant: true,
  },
  productosDestacados: [
    { id: '1', titulo: 'Más vendidos', descripcion: 'Los favoritos de nuestros clientes', imagen: '', link: '/menu' },
    { id: '2', titulo: 'Recomendados del chef', descripcion: 'Selección especial del chef', imagen: '', link: '/menu' },
  ] as ProductoDestacado[],
}

export interface RestaurantConfig {
  nombre: string
  slogan: string
  descripcion: string
  direccion: string
  telefono: string
  email: string
  whatsapp: string
  horarioApertura: string
  horarioCierre: string
  diasAtencion: string[]
  envioGratisMinimo: number
  costoDomicilio: number
  radioDomicilio: number
  moneda: string
  impuesto: number
  servicioMesa: number
  mapaUrl: string
  logoUrl: string
  bannerUrl: string
  faviconUrl: string
  redes: { instagram: string; facebook: string; tiktok: string; twitter: string }
  metodosPago: string[]
  maxReservasPorDia: number
  tiempoMinimoReserva: number
  politicaReserva: string
  tiempoDomicilio: number
  tiempoRecoger: number
  tiempoMesa: number
  barrios: string[]
  adminNombre: string
  colorPrimario: string
  monedaSimbolo: string
}

const defaultRestaurantConfig: RestaurantConfig = {
  nombre: CONFIG.restaurante.nombre,
  slogan: CONFIG.restaurante.slogan,
  descripcion: CONFIG.restaurante.descripcion,
  direccion: CONFIG.contacto.direccion,
  telefono: CONFIG.contacto.telefono,
  email: CONFIG.contacto.email,
  whatsapp: CONFIG.contacto.whatsapp,
  horarioApertura: CONFIG.horarios.apertura,
  horarioCierre: CONFIG.horarios.cierre,
  diasAtencion: CONFIG.horarios.dias,
  envioGratisMinimo: CONFIG.delivery.minimoGratis,
  costoDomicilio: CONFIG.delivery.tarifa,
  radioDomicilio: 5,
  moneda: 'COP',
  impuesto: 0,
  servicioMesa: 0,
  mapaUrl: CONFIG.contacto.mapaUrl,
  logoUrl: '',
  bannerUrl: '',
  faviconUrl: '',
  redes: { instagram: '', facebook: '', tiktok: '', twitter: '' },
  metodosPago: ['Efectivo', 'Nequi', 'Daviplata', 'Bancolombia'],
  maxReservasPorDia: 20,
  tiempoMinimoReserva: 60,
  politicaReserva: CONFIG.reservas.politica,
  tiempoDomicilio: CONFIG.entrega.tiempoDomicilio,
  tiempoRecoger: CONFIG.entrega.tiempoRecoger,
  tiempoMesa: CONFIG.entrega.tiempoMesa,
  barrios: CONFIG.delivery.barrios,
  adminNombre: CONFIG.admin.nombre,
  colorPrimario: '#667A22',
  monedaSimbolo: '$',
}

export function getRestaurantConfig(): RestaurantConfig {
  try {
    const stored = JSON.parse(localStorage.getItem('restaurant-config') || '{}')
    return { ...defaultRestaurantConfig, ...stored }
  } catch {
    return defaultRestaurantConfig
  }
}

export function saveRestaurantConfig(config: Partial<RestaurantConfig>) {
  const current = getRestaurantConfig()
  const updated = { ...current, ...config }
  localStorage.setItem('restaurant-config', JSON.stringify(updated))
  return updated
}
