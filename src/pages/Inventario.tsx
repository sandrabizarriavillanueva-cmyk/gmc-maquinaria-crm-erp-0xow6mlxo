import { useState } from 'react'
import { useStore } from '@/context/MainContext'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { formatCLP, getEquipmentBadgeClass } from '@/lib/format'
import { InventarioAddModal } from '@/components/InventarioAddModal'
import { InventarioImportModal } from '@/components/InventarioImportModal'
import { InventarioImageModal } from '@/components/InventarioImageModal'
import { EquipmentStatus } from '@/types'
import { Search } from 'lucide-react'
import { RestrictedAccess } from '@/components/RestrictedAccess'
import { toast } from '@/hooks/use-toast'

export default function Inventario() {
  const { products, updateProductStock, updateProductStatus, currentRole, permissions } = useStore()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Todas')

  if (!permissions[currentRole].inventario) return <RestrictedAccess />

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
    const matchesCat = category === 'Todas' || p.category === category
    return matchesSearch && matchesCat
  })

  const availableCategories = Array.from(new Set(products.map((p) => p.category))).sort()
  const isAdmin = currentRole === 'Administrador'

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Gestor de Stock</h1>
          <p className="text-slate-500">Administra equipos, repuestos y documentación visual.</p>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2 w-full md:w-auto">
            <InventarioImportModal />
            <InventarioAddModal />
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Buscar por SKU o descripción..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 text-base"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full md:w-56 h-11">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todas">Todas las categorías</SelectItem>
            {availableCategories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="hidden md:block rounded-xl border bg-white shadow-subtle overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Equipo / SKU</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Marca</TableHead>
              <TableHead>Stock Actual</TableHead>
              <TableHead>Estado Equipo</TableHead>
              {isAdmin && <TableHead className="text-right">Precio Neto</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <InventarioImageModal productId={p.id} imageUrl={p.imageUrl} />
                    <span className="font-semibold text-slate-800">{p.sku}</span>
                  </div>
                </TableCell>
                <TableCell>{p.name}</TableCell>
                <TableCell>{p.brand}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    defaultValue={p.stock}
                    className="w-24 h-9 font-medium"
                    onBlur={async (e) => {
                      const val = Number(e.target.value)
                      if (val === p.stock) return
                      try {
                        await updateProductStock(p.id, val)
                        toast({ title: 'Stock actualizado' })
                      } catch (err) {
                        toast({
                          title: 'Error de conexión',
                          description: 'No se pudo actualizar el stock en la base de datos.',
                          variant: 'destructive',
                        })
                      }
                    }}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getEquipmentBadgeClass(p.status)}>
                      {p.status}
                    </Badge>
                    <Select
                      defaultValue={p.status}
                      onValueChange={async (v) => {
                        try {
                          await updateProductStatus(p.id, v as EquipmentStatus)
                          toast({ title: 'Estado actualizado' })
                        } catch (err) {
                          toast({
                            title: 'Error',
                            description: 'No se pudo actualizar el estado.',
                            variant: 'destructive',
                          })
                        }
                      }}
                    >
                      <SelectTrigger className="w-8 h-8 p-0 border-0 shadow-none bg-slate-50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Disponible">Disponible</SelectItem>
                        <SelectItem value="Arrendado">Arrendado</SelectItem>
                        <SelectItem value="En Mantención">En Mantención</SelectItem>
                        <SelectItem value="Inactivo">Inactivo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TableCell>
                {isAdmin && (
                  <TableCell className="text-right font-medium">{formatCLP(p.price)}</TableCell>
                )}
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={isAdmin ? 6 : 5} className="text-center py-8 text-slate-500">
                  No se encontraron equipos.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="grid grid-cols-1 gap-4 md:hidden">
        {filtered.map((p) => (
          <Card key={p.id} className="shadow-subtle border-slate-200">
            <CardContent className="p-4 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <InventarioImageModal productId={p.id} imageUrl={p.imageUrl} />
                  <div className="font-bold text-lg leading-tight">{p.name}</div>
                </div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">
                  SKU: {p.sku} • {p.brand}
                </span>
                <Badge variant="outline" className={getEquipmentBadgeClass(p.status)}>
                  {p.status}
                </Badge>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg mt-2 border">
                <span className="font-semibold text-slate-700">Stock Físico:</span>
                <Input
                  type="number"
                  defaultValue={p.stock}
                  className="w-24 h-10 text-center font-bold bg-white"
                  onBlur={async (e) => {
                    const val = Number(e.target.value)
                    if (val === p.stock) return
                    try {
                      await updateProductStock(p.id, val)
                      toast({ title: 'Stock actualizado' })
                    } catch (err) {
                      toast({
                        title: 'Error',
                        description: 'No se pudo actualizar el stock.',
                        variant: 'destructive',
                      })
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
