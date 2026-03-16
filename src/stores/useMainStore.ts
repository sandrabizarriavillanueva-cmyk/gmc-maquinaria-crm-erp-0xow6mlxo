import { useState } from 'react'
import {
  Product,
  Client,
  Invoice,
  EquipmentStatus,
  UserRole,
  AuditLog,
  RolePermissions,
  ModuleId,
  User,
} from '@/types'

const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Juan Admin',
    email: 'admin@gmc.cl',
    role: 'Administrador',
    avatarUrl: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=1',
    password: 'securepassword123',
  },
  {
    id: '2',
    name: 'Ana Vendedora',
    email: 'ana.v@gmc.cl',
    role: 'Vendedor',
    avatarUrl: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=5',
    password: 'securepassword123',
  },
  {
    id: '3',
    name: 'Carlos Técnico',
    email: 'carlos.t@gmc.cl',
    role: 'Técnico',
    avatarUrl: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=8',
    password: 'securepassword123',
  },
]

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
    clientId: '2',
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
    clientId: '1',
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
  {
    id: '4',
    rut: '79.555.444-1',
    name: 'Manufacturas RM S.A.',
    region: 'Santiago',
    phone: '+56 9 9999 8888',
    email: 'info@mrm.cl',
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
]

const DEFAULT_PERMISSIONS: RolePermissions = {
  Administrador: {
    dashboard: true,
    inventario: true,
    clientes: true,
    ventas: true,
    facturacion: true,
    reportes: true,
    auditoria: true,
    rutas: true,
    configuracion: true,
    usuarios: true,
  },
  Vendedor: {
    dashboard: true,
    inventario: false,
    clientes: true,
    ventas: true,
    facturacion: true,
    reportes: false,
    auditoria: false,
    rutas: true,
    configuracion: true,
    usuarios: false,
  },
  Técnico: {
    dashboard: true,
    inventario: true,
    clientes: false,
    ventas: false,
    facturacion: false,
    reportes: false,
    auditoria: false,
    rutas: true,
    configuracion: true,
    usuarios: false,
  },
}

export default function useMainStore() {
  const [currentUser, setCurrentUser] = useState('Juan Admin')
  const [currentRole, setCurrentRole] = useState<UserRole>('Administrador')
  const [companyLogo, setCompanyLogo] = useState<string | null>(null)
  const [userAvatar, setUserAvatar] = useState<string | null>(null)
  const [permissions, setPermissions] = useState<RolePermissions>(DEFAULT_PERMISSIONS)

  const [users, setUsers] = useState<User[]>(MOCK_USERS)
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

  const addUser = (user: User) => {
    setUsers((prev) => [user, ...prev])
    addLog('Nuevo Colaborador', user.name)
  }

  const updateUser = (id: string, data: Partial<User>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...data } : u)))
    addLog('Actualización Colaborador', data.name || id)
  }

  const deleteUser = (id: string) => {
    const u = users.find((x) => x.id === id)
    setUsers((prev) => prev.filter((x) => x.id !== id))
    addLog('Eliminación Colaborador', u?.name || id)
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

  const assignProductClient = (id: string, clientId: string) => {
    setProducts((prev) => prev.map((x) => (x.id === id ? { ...x, clientId } : x)))
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
    setClients((prev) =>
      prev.map((x) => (x.id === clientId ? { ...x, documents: [...(x.documents || []), doc] } : x)),
    )
    addLog('Nuevo Documento', `${doc.name} (Cliente ID: ${clientId})`)
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

  const updateRolePermission = (role: UserRole, module: ModuleId, value: boolean) => {
    setPermissions((prev) => ({ ...prev, [role]: { ...prev[role], [module]: value } }))
    addLog('Actualización Permisos', `${role} - ${module}: ${value}`)
  }

  return {
    currentUser,
    currentRole,
    setCurrentRole,
    companyLogo,
    setCompanyLogo,
    userAvatar,
    setUserAvatar,
    permissions,
    updateRolePermission,
    users,
    products,
    clients,
    invoices,
    auditLogs,
    addUser,
    updateUser,
    deleteUser,
    updateProductStock,
    updateProductStatus,
    assignProductClient,
    updateProductImage,
    addProduct,
    addClient,
    addClientDocument,
    addInvoice,
    updateInvoiceStatus,
  }
}
