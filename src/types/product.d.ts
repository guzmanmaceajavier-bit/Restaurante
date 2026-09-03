export interface IProduct {
  nombre: string
  descripcion: string
  precio: number
  categoría: string
  imagen: string
  stock: number
  ingredientes?: string[]
  picante?: 0 | 1 | 2 | 3
  tiempoPreparacion?: number
  calorias?: number
  alergenos?: string[]
  destacado?: boolean
  masVendido?: boolean
  recomendado?: boolean
  nuevo?: boolean
  descuento?: number
  combo?: string
}

export interface IProductCart {
  nombre: string
  descripcion?: string
  precio: number
  imagen?: string
  quantity: number
}
