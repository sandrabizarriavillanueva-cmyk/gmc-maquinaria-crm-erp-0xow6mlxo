import { useState, useMemo, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
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
import { Skeleton } from '@/components/ui/skeleton'
import { formatCLP, getEquipmentBadgeClass } from '@/lib/format'
import { InventarioAddModal } from '@/components/InventarioAddModal'
import { InventarioImportModal } from '@/components/InventarioImportModal'
import { InventarioImageModal } from '@/components/InventarioImageModal'
import { EquipmentStatus, Product } from '@/types'
import { Search, FilterX, PackageOpen } from 'lucide-react'
import { RestrictedAccess } from '@/components/RestrictedAccess'
import { toast } from '@/hooks/use-toast'

export default function Inventario() {
  const { currentRole, permissions } = useStore()

  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Todas')
  const [brand, setBrand] = useState('Todas')

  const fetchProducts = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      if (data) {
        setProducts(
          data.map((d) => ({
            id: d.id,
            sku: d.code,
            name: d.name,
            brand: d.brand || 'Genérica',
            category: d.category || 'Sin Categoría',
            status: (d.status as EquipmentStatus) || 'Disponible',
            stock: d.stock || 0,
            minStock: d.min_stock || 0,
            price: d.price || 0,
            cost: d.cost || 0,
            specs: d.specs || '',
            imageUrl: d.image_url || undefined,
            clientId: d.client_id || undefined,
          })),
        )
      }
    } catch (e: any) {
      toast({
        title: 'Error al cargar inventario',
        description: e.message || 'No se pudo conectar con la base de datos.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

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
      const { error } = await supabase.from('products').update({ stock: val }).eq('id', id)
      if (error) throw error
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, stock: val } : p)))
      toast({ title: 'Stock actualizado correctamente' })
    } catch {
      toast({ title: 'Error al actualizar', variant: 'destructive' })
    }
  }

  const onStatus = async (id: string, v: string) => {
    try {
      const { error } = await supabase.from('products').update({ status: v }).eq('id', id)
      if (error) throw error
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: v as EquipmentStatus } : p)),
      )
      toast({ title: 'Estado actualizado' })
    } catch {
      toast({ title: 'Error al actualizar', variant: 'destructive' })
    }
  }

  const isTotallyEmpty =
    products.length === 0 && !isLoading && !search && category === 'Todas' && brand === 'Todas'

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Inventario y Stock</h1>
          <p className="text-slate-500">
            Administra equipos, repuestos y especificaciones técnicas en tiempo real.
          </p>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2 w-full md:w-auto">
            <InventarioImportModal onSuccess={fetchProducts} />
            <InventarioAddModal onSuccess={fetchProducts} />
          </div>
        )}
      </div>

      {isTotallyEmpty ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-200 rounded-xl bg-white shadow-subtle">
          <PackageOpen className="w-16 h-16 text-slate-300 mb-4" />
          <h3 className="text-xl font-bold text-slate-700">El inventario está vacío</h3>
          <p className="text-slate-500 max-w-md mt-2 mb-6">
            Aún no hay equipos ni repuestos registrados en la base de datos de Supabase. Puedes
            añadir tu primer equipo manualmente o importar un listado masivo desde un archivo CSV.
          </p>
          {isAdmin && (
            <div className="flex flex-wrap items-center justify-center gap-4">
              <InventarioImportModal onSuccess={fetchProducts} />
              <InventarioAddModal onSuccess={fetchProducts} />
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-4 bg-white p-4 rounded-xl border shadow-subtle">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, SKU o marca..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-11"
                  disabled={isLoading}
                />
              </div>
              <Select value={category} onValueChange={setCategory} disabled={isLoading}>
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
              <Select value={brand} onValueChange={setBrand} disabled={isLoading}>
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
              <Button
                variant="outline"
                onClick={resetFilters}
                disabled={isLoading}
                className="h-11 w-full md:w-auto gap-2"
              >
                <FilterX className="h-4 w-4" /> Limpiar Filtros
              </Button>
            </div>
            <div className="text-sm font-medium text-slate-500">
              Mostrando <span className="text-slate-900">{isLoading ? '-' : filtered.length}</span>{' '}
              equipo{filtered.length !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="hidden md:block rounded-xl border bg-white shadow-subtle overflow-x-auto">
            <Table className="min-w-[800px]">
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>SKU / Ref</TableHead>
                  <TableHead className="w-[25%]">Descripción</TableHead>
                  <TableHead>Marca & Categoría</TableHead>
                  <TableHead>Especificaciones</TableHead>
                  <TableHead>Stock Físico</TableHead>
                  <TableHead>Estado Actual</TableHead>
                  {isAdmin && <TableHead className="text-right">Costo / Precio</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className="h-10 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-10 w-full" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-10 w-28" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-10 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-10 w-20" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-8 w-24 rounded-full" />
                        </TableCell>
                        {isAdmin && (
                          <TableCell className="text-right">
                            <Skeleton className="h-10 w-24 ml-auto" />
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  : filtered.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <InventarioImageModal
                              productId={p.id}
                              imageUrl={p.imageUrl}
                              onSuccess={fetchProducts}
                            />
                            <span className="font-bold text-slate-800 tracking-tight">{p.sku}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-slate-700">{p.name}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-800">{p.brand}</span>
                            <span className="text-xs text-slate-500">{p.category}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-slate-600">{p.specs || '-'}</span>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            defaultValue={p.stock}
                            className="w-20 h-9 font-medium text-center"
                            onBlur={(e) => onStock(p.id, Number(e.target.value), p.stock)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={getEquipmentBadgeClass(p.status)}>
                              {p.status}
                            </Badge>
                            <Select
                              defaultValue={p.status}
                              onValueChange={(v) => onStatus(p.id, v)}
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
                          <TableCell className="text-right">
                            <div className="flex flex-col items-end">
                              <span className="text-xs text-slate-400 font-medium">
                                C: {formatCLP(p.cost || 0)}
                              </span>
                              <span className="font-bold text-slate-800">
                                P: {formatCLP(p.price)}
                              </span>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                {!isLoading && filtered.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={isAdmin ? 7 : 6}
                      className="text-center py-12 text-slate-500"
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FilterX className="h-8 w-8 text-slate-300" />
                        <p>No se encontraron equipos para los filtros seleccionados.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="grid grid-cols-1 gap-4 md:hidden">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="shadow-subtle border-slate-200">
                    <CardContent className="p-4 flex flex-col gap-3">
                      <div className="flex gap-3 items-center">
                        <Skeleton className="h-12 w-12 rounded" />
                        <Skeleton className="h-6 w-3/4" />
                      </div>
                      <Skeleton className="h-4 w-1/2 mt-2" />
                      <Skeleton className="h-10 w-full mt-2" />
                    </CardContent>
                  </Card>
                ))
              : filtered.map((p) => (
                  <Card key={p.id} className="shadow-subtle border-slate-200">
                    <CardContent className="p-4 flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <InventarioImageModal
                            productId={p.id}
                            imageUrl={p.imageUrl}
                            onSuccess={fetchProducts}
                          />
                          <div>
                            <div className="font-bold text-lg leading-tight text-slate-800">
                              {p.name}
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                              {p.brand} • {p.category}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium text-slate-600">SKU: {p.sku}</span>
                        <Badge variant="outline" className={getEquipmentBadgeClass(p.status)}>
                          {p.status}
                        </Badge>
                      </div>
                      {p.specs && (
                        <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded border">
                          <span className="font-semibold text-slate-700">Specs:</span> {p.specs}
                        </div>
                      )}
                      {isAdmin && (
                        <div className="flex justify-between text-sm mt-1">
                          <span className="text-slate-500">Precio Venta:</span>
                          <span className="font-bold">{formatCLP(p.price)}</span>
                        </div>
                      )}
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
            {!isLoading && filtered.length === 0 && (
              <div className="text-center py-12 text-slate-500 bg-slate-50 border border-dashed rounded-xl">
                <div className="flex flex-col items-center justify-center gap-2">
                  <FilterX className="h-8 w-8 text-slate-300" />
                  <p>No se encontraron resultados para los filtros seleccionados.</p>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
