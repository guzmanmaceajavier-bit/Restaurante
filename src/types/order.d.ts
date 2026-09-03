export interface OrderItem {
  nombre: string
  quantity: number
  precio: number
  imagen?: string
}

export interface Order {
  id: string
  fullName: string
  phone: string
  typeOrder: string
  items: OrderItem[]
  total: number
  subtotal: number
  deliveryFee: number
  paymentMethod: string
  neighborhood?: string
  address?: string
  tableNumber?: string
  scheduled?: boolean
  scheduledTime?: string
  estado: string
  createdAt: string
}
