import { useState } from 'react'
import { Product, Client, Invoice, EquipmentStatus } from '@/types'

const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    sku: 'CMP-001',
    name: 'Compresor Tornillo 50HP',
    brand: 'Atlas Copco',
    category: 'Compresor',
    status: 'Disponible',
    stock: 5,
    minStock: 2,
    price: 15000000,
    hp: 50,
    bar: 8,
  },
  {
    id: '2',
    sku: 'CMP-002',
    name: 'Compresor Pistón 10HP',
    brand: 'Schulz',
    category: 'Compresor',
    status: 'En Mantención',
    stock: 1,
    minStock: 3,
    price: 2500000,
    hp: 10,
    bar: 10,
  },
  {
    id: '3',
    sku: 'SEC-001',
    name: 'Secador de Aire 100PCM',
    brand: 'Metalplan',
    category: 'Secador',
    status: 'Disponible',
    stock: 8,
    minStock: 5,
    price: 3200000,
  },
  {
    id: '4',
    sku: 'CHL-001',
    name: 'Chiller Industrial 20TR',
    brand: 'Atlas Copco',
    category: 'Chiller',
    status: 'Arrendado',
    stock: 0,
    minStock: 1,
    price: 18000000,
  },
]

const MOCK_CLIENTS: Client[] = [
  {
    id: '1',
    rut: '76.123.456-7',
    name: 'Minería Norte SpA',
    region: 'Antofagasta',
    phone: '+56 9 1234 5678',
    email: 'contacto@minerianorte.cl',
  },
  {
    id: '2',
    rut: '77.987.654-3',
    name: 'Construcciones Sur Ltda',
    region: 'Biobío',
    phone: '+56 9 8765 4321',
    email: 'operaciones@consur.cl',
  },
  {
    id: '3',
    rut: '88.111.222-K',
    name: 'Industrias Madereras SA',
    region: 'Los Lagos',
    phone: '+56 9 1111 2222',
    email: 'compras@madereras.cl',
  },
]

const MOCK_INVOICES: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'F-1001',
    date: '2023-10-01',
    clientId: '1',
    amount: 17850000,
    status: 'Pendiente',
    description: 'Venta - Compresor Tornillo 50HP',
  },
  {
    id: '2',
    invoiceNumber: 'F-1002',
    date: '2023-09-15',
    clientId: '2',
    amount: 2975000,
    status: 'Vencida',
    description: 'Servicio Técnico - Reparación Pistón',
  },
  {
    id: '3',
    invoiceNumber: 'F-1003',
    date: '2023-10-05',
    clientId: '1',
    amount: 3808000,
    status: 'Pagada',
    description: 'Venta - Secador de Aire 100PCM',
  },
  {
    id: '4',
    invoiceNumber: 'F-1004',
    date: '2023-10-10',
    clientId: '3',
    amount: 21420000,
    status: 'Pendiente',
    description: 'Arriendo - Chiller Industrial 20TR',
  },
]

export default function useMainStore() {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS)
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS)
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES)

  const updateProductStock = (id: string, newStock: number) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, stock: newStock } : p)))
  }

  const updateProductStatus = (id: string, newStatus: EquipmentStatus) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p)))
  }

  const addProduct = (product: Product) => setProducts((prev) => [product, ...prev])

  const addClient = (client: Client) => setClients((prev) => [client, ...prev])

  const addInvoice = (invoice: Invoice) => {
    setInvoices((prev) => [invoice, ...prev])
  }

  const updateInvoiceStatus = (id: string, status: 'Pendiente' | 'Pagada' | 'Vencida') => {
    setInvoices((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)))
  }

  return {
    products,
    clients,
    invoices,
    updateProductStock,
    updateProductStatus,
    addProduct,
    addClient,
    addInvoice,
    updateInvoiceStatus,
  }
}
