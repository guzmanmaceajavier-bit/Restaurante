export interface Adicional {
  id: string
  nombre: string
  precio: number
  categoria?: string
  disponible?: boolean
}

export interface IProduct {
  id: string
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
  adicionales?: Adicional[]
}

export interface IProductCart {
  nombre: string
  descripcion?: string
  precio: number
  imagen?: string
  quantity: number
  adicionales?: { id: string; nombre: string; precio: number }[]
  precioUnitario?: number
}
