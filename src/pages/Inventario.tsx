import { useState, useMemo } from 'react'
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
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatCLP, getEquipmentBadgeClass } from '@/lib/format'
import { InventarioAddModal } from '@/components/InventarioAddModal'
import { InventarioImportModal } from '@/components/InventarioImportModal'
import { InventarioImageModal } from '@/components/InventarioImageModal'
import { EquipmentStatus } from '@/types'
import { Search, FilterX } from 'lucide-react'
import { RestrictedAccess } from '@/components/RestrictedAccess'
import { toast } from '@/hooks/use-toast'

export default function Inventario() {
  const { products, updateProductStock, updateProductStatus, currentRole, permissions } = useStore()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Todas')
  const [brand, setBrand] = useState('Todas')

  const { filtered, categories, brands } = useMemo(() => {
    const s = search.toLowerCase()
    const f = products.filter((p) => {
      const matchS =
        p.name.toLowerCase().includes(s) ||
        p.sku.toLowerCase().includes(s) ||
        p.brand.toLowerCase().includes(s)
      const matchC = category === 'Todas' || p.category === category
      const matchB = brand === 'Todas' || p.brand === brand
      return matchS && matchC && matchB
    })
    const cats = Array.from(new Set(products.map((p) => p.category))).sort()
    const brnds = Array.from(new Set(products.map((p) => p.brand).filter(Boolean))).sort()
    return { filtered: f, categories: cats, brands: brnds }
  }, [products, search, category, brand])

  if (!permissions[currentRole].inventario) return <RestrictedAccess />

  const isAdmin = currentRole === 'Administrador'
  const resetFilters = () => {
    setSearch('')
    setCategory('Todas')
    setBrand('Todas')
  }

  const onStock = async (id: string, val: number, old: number) => {
    if (val === old) return
    try {
      await updateProductStock(id, val)
      toast({ title: 'Stock actualizado' })
    } catch {
      toast({ title: 'Error', variant: 'destructive' })
    }
  }

  const onStatus = async (id: string, v: string) => {
    try {
      await updateProductStatus(id, v as EquipmentStatus)
      toast({ title: 'Estado actualizado' })
    } catch {
      toast({ title: 'Error', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
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

      <div className="flex flex-col gap-4 bg-white p-4 rounded-xl border shadow-subtle">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, SKU o marca..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full md:w-48 h-11">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todas">Todas las categorías</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={brand} onValueChange={setBrand}>
            <SelectTrigger className="w-full md:w-48 h-11">
              <SelectValue placeholder="Marca" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todas">Todas las marcas</SelectItem>
              {brands.map((b) => (
                <SelectItem key={b} value={b}>
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={resetFilters} className="h-11 w-full md:w-auto gap-2">
            <FilterX className="h-4 w-4" /> Limpiar Filtros
          </Button>
        </div>
        <div className="text-sm font-medium text-slate-500">
          Mostrando <span className="text-slate-900">{filtered.length}</span> equipo
          {filtered.length !== 1 ? 's' : ''}
        </div>
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
                    onBlur={(e) => onStock(p.id, Number(e.target.value), p.stock)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getEquipmentBadgeClass(p.status)}>
                      {p.status}
                    </Badge>
                    <Select defaultValue={p.status} onValueChange={(v) => onStatus(p.id, v)}>
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
                <TableCell colSpan={isAdmin ? 6 : 5} className="text-center py-12 text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FilterX className="h-8 w-8 text-slate-300" />
                    <p>No se encontraron resultados para los filtros seleccionados.</p>
                  </div>
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
                  onBlur={(e) => onStock(p.id, Number(e.target.value), p.stock)}
                />
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-500 bg-slate-50 border border-dashed rounded-xl">
            <div className="flex flex-col items-center justify-center gap-2">
              <FilterX className="h-8 w-8 text-slate-300" />
              <p>No se encontraron resultados para los filtros seleccionados.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
