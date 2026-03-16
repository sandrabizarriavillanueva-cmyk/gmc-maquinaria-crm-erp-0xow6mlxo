export type EquipmentStatus = 'Disponible' | 'Arrendado' | 'En Mantención' | 'Inactivo'

export interface Product {
  id: string
  sku: string
  name: string
  brand: string
  category: string
  status: EquipmentStatus
  stock: number
  minStock: number
  price: number
  hp?: number
  bar?: number
  specs?: string
}

export interface Client {
  id: string
  rut: string
  name: string
  region: string
  phone: string
  email: string
  contactName?: string
  industry?: string
}

export interface Invoice {
  id: string
  invoiceNumber: string
  date: string
  clientId: string
  amount: number
  status: 'Pendiente' | 'Pagada' | 'Vencida'
  description?: string
}
