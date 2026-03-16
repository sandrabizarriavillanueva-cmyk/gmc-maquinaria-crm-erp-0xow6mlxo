export type EquipmentStatus = 'Disponible' | 'Arrendado' | 'En Mantención' | 'Inactivo'
export type UserRole = 'Administrador' | 'Vendedor' | 'Técnico'

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
  imageUrl?: string
}

export interface Document {
  id: string
  name: string
  url: string
  date: string
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
  documents?: Document[]
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

export interface AuditLog {
  id: string
  date: string
  user: string
  role: UserRole
  action: string
  target: string
}
