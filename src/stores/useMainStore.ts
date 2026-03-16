import { useState, useEffect } from 'react'
import { pb } from '@/lib/api'
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
  },
  {
    id: '3',
    name: 'Carlos Técnico',
    email: 'carlos.t@gmc.cl',
    role: 'Técnico',
    avatarUrl: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=8',
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

const isMockId = (id: string) => id.length < 10

export default function useMainStore() {
  const [currentUser, setCurrentUser] = useState('Juan Admin')
  const [currentRole, setCurrentRole] = useState<UserRole>('Administrador')
  const [companyLogo, setCompanyLogo] = useState<string | null>(null)
  const [userAvatar, setUserAvatar] = useState<string | null>(null)
  const [permissions, setPermissions] = useState<RolePermissions>(DEFAULT_PERMISSIONS)

  const [users, setUsers] = useState<User[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])

  useEffect(() => {
    const initData = async () => {
      try {
        const dbUsers = await pb.get('collaborators')
        if (dbUsers && dbUsers.length > 0) {
          const mappedUsers = dbUsers.map((u: any) => ({
            ...u,
            avatarUrl: u.avatar
              ? pb.getFileUrl('collaborators', u.id, u.avatar)
              : u.avatarUrl || null,
          }))
          setUsers(mappedUsers)
        } else {
          setUsers(MOCK_USERS)
        }
      } catch (err) {
        setUsers(MOCK_USERS)
      }

      try {
        const dbProducts = await pb.get('inventory')
        if (dbProducts && dbProducts.length > 0) {
          const mappedProducts = dbProducts.map((p: any) => ({
            ...p,
            imageUrl: p.image ? pb.getFileUrl('inventory', p.id, p.image) : p.imageUrl || null,
          }))
          setProducts(mappedProducts)
        } else {
          setProducts(MOCK_PRODUCTS)
        }
      } catch (err) {
        setProducts(MOCK_PRODUCTS)
      }
    }
    initData()
  }, [])

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

  const addUser = async (userPayload: any) => {
    const created = await pb.create('collaborators', userPayload)
    if (created && created.id) {
      created.avatarUrl = created.avatar
        ? pb.getFileUrl('collaborators', created.id, created.avatar)
        : created.avatarUrl || null
    }
    setUsers((prev) => [created, ...prev])
    const name = userPayload instanceof FormData ? userPayload.get('name') : userPayload.name
    addLog('Nuevo Colaborador', (name as string) || 'Usuario')
  }

  const updateUser = async (id: string, dataPayload: any) => {
    if (isMockId(id)) {
      const plainData =
        dataPayload instanceof FormData ? Object.fromEntries(dataPayload) : dataPayload
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...plainData } : u)))
      addLog('Actualización Colaborador (Mock)', (plainData.name as string) || id)
      return
    }
    const updated = await pb.update('collaborators', id, dataPayload)
    if (updated && updated.id) {
      updated.avatarUrl = updated.avatar
        ? pb.getFileUrl('collaborators', updated.id, updated.avatar)
        : updated.avatarUrl || null
    }
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updated } : u)))
    const name = dataPayload instanceof FormData ? dataPayload.get('name') : dataPayload.name
    addLog('Actualización Colaborador', (name as string) || id)
  }

  const deleteUser = async (id: string) => {
    const u = users.find((x) => x.id === id)
    if (!isMockId(id)) {
      await pb.delete('collaborators', id)
    }
    setUsers((prev) => prev.filter((x) => x.id !== id))
    addLog('Eliminación Colaborador', u?.name || id)
  }

  const addProduct = async (productPayload: any) => {
    const created = await pb.create('inventory', productPayload)
    if (created && created.id) {
      created.imageUrl = created.image
        ? pb.getFileUrl('inventory', created.id, created.image)
        : created.imageUrl || null
    }
    setProducts((prev) => [created, ...prev])
    addLog('Nuevo Equipo', created.name)
  }

  const updateProductStock = async (id: string, newStock: number) => {
    const p = products.find((x) => x.id === id)
    if (!isMockId(id)) await pb.update('inventory', id, { stock: newStock })
    setProducts((prev) => prev.map((x) => (x.id === id ? { ...x, stock: newStock } : x)))
    addLog('Cambio de Stock', `${p?.name} (Nuevo: ${newStock})`)
  }

  const updateProductStatus = async (id: string, newStatus: EquipmentStatus) => {
    const p = products.find((x) => x.id === id)
    if (!isMockId(id)) await pb.update('inventory', id, { status: newStatus })
    setProducts((prev) => prev.map((x) => (x.id === id ? { ...x, status: newStatus } : x)))
    addLog('Cambio de Estado', `${p?.name} -> ${newStatus}`)
  }

  const assignProductClient = async (id: string, clientId: string) => {
    if (!isMockId(id)) await pb.update('inventory', id, { clientId })
    setProducts((prev) => prev.map((x) => (x.id === id ? { ...x, clientId } : x)))
  }

  const updateProductImage = async (id: string, image: File | string) => {
    const p = products.find((x) => x.id === id)
    if (!isMockId(id)) {
      const payload = new FormData()
      if (image instanceof File) payload.append('image', image)
      else payload.append('imageUrl', image)
      const updated = await pb.update('inventory', id, payload)
      const finalUrl = updated.image
        ? pb.getFileUrl('inventory', updated.id, updated.image)
        : updated.imageUrl
      setProducts((prev) => prev.map((x) => (x.id === id ? { ...x, imageUrl: finalUrl } : x)))
    } else {
      const finalUrl = image instanceof File ? URL.createObjectURL(image) : image
      setProducts((prev) => prev.map((x) => (x.id === id ? { ...x, imageUrl: finalUrl } : x)))
    }
    addLog('Actualización de Imagen', p?.name || id)
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
