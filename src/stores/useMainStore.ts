import { useState } from 'react'
import { Product, Client, Invoice, EquipmentStatus, UserRole, AuditLog } from '@/types'

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

const MOCK_LOGS: AuditLog[] = [
  {
    id: '1',
    date: new Date().toISOString(),
    user: 'Juan Admin',
    role: 'Administrador',
    action: 'Inicio de Sistema',
    target: 'App',
  },
  {
    id: '2',
    date: new Date(Date.now() - 3600000).toISOString(),
    user: 'María Vendedor',
    role: 'Vendedor',
    action: 'Nueva Transacción',
    target: 'Folio: F-1004',
  },
]

export default function useMainStore() {
  const [currentUser, setCurrentUser] = useState('Juan Admin')
  const [currentRole, setCurrentRole] = useState<UserRole>('Administrador')

  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS)
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS)
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES)
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(MOCK_LOGS)

  const addLog = (action: string, target: string) => {
    setAuditLogs((prev) => [
      {
        id: Math.random().toString(),
        date: new Date().toISOString(),
        user: currentUser,
        role: currentRole,
        action,
        target,
      },
      ...prev,
    ])
  }

  const updateProductStock = (id: string, newStock: number) => {
    const p = products.find((x) => x.id === id)
    setProducts((prev) => prev.map((x) => (x.id === id ? { ...x, stock: newStock } : x)))
    addLog('Cambio de Stock', `${p?.name} (Nuevo: ${newStock})`)
  }

  const updateProductStatus = (id: string, newStatus: EquipmentStatus) => {
    const p = products.find((x) => x.id === id)
    setProducts((prev) => prev.map((x) => (x.id === id ? { ...x, status: newStatus } : x)))
    addLog('Cambio de Estado', `${p?.name} -> ${newStatus}`)
  }

  const updateProductImage = (id: string, imageUrl: string) => {
    const p = products.find((x) => x.id === id)
    setProducts((prev) => prev.map((x) => (x.id === id ? { ...x, imageUrl } : x)))
    addLog('Actualización de Imagen', p?.name || id)
  }

  const addProduct = (product: Product) => {
    setProducts((prev) => [product, ...prev])
    addLog('Nuevo Equipo', product.name)
  }

  const addClient = (client: Client) => {
    setClients((prev) => [client, ...prev])
    addLog('Nuevo Cliente', client.name)
  }

  const addClientDocument = (
    clientId: string,
    doc: { id: string; name: string; url: string; date: string },
  ) => {
    const c = clients.find((x) => x.id === clientId)
    setClients((prev) =>
      prev.map((x) =>
        x.id === clientId
          ? {
              ...x,
              documents: [...(x.documents || []), doc],
            }
          : x,
      ),
    )
    addLog('Nuevo Documento', `${doc.name} (Cliente: ${c?.name})`)
  }

  const addInvoice = (invoice: Invoice) => {
    setInvoices((prev) => [invoice, ...prev])
    addLog('Nueva Transacción', `Folio: ${invoice.invoiceNumber}`)
  }

  const updateInvoiceStatus = (id: string, status: 'Pendiente' | 'Pagada' | 'Vencida') => {
    const i = invoices.find((x) => x.id === id)
    setInvoices((prev) => prev.map((x) => (x.id === id ? { ...x, status } : x)))
    addLog('Cambio Estado Factura', `${i?.invoiceNumber} -> ${status}`)
  }

  return {
    currentUser,
    currentRole,
    setCurrentRole,
    products,
    clients,
    invoices,
    auditLogs,
    updateProductStock,
    updateProductStatus,
    updateProductImage,
    addProduct,
    addClient,
    addClientDocument,
    addInvoice,
    updateInvoiceStatus,
  }
}
