export interface ReservaData {
  id: string
  nombre: string
  email: string
  telefono: string
  fecha: string
  hora: string
  personas: number
  zona: string
  ocasion: string
  comentarios: string
  estado: 'Pendiente' | 'confirmada' | 'rechazada' | 'Cancelada'
  createdAt: string
}

export interface ReservaFormData {
  nombre: string
  email: string
  telefono: string
  fecha: string
  hora: string
  personas: number
  zona: string
  ocasion: string
  comentarios: string
}
