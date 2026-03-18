import { useState, useEffect } from 'react'
import { useStore } from '@/context/MainContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCLP, getEquipmentBadgeClass } from '@/lib/format'
import { PackageX, Wrench, AlertTriangle, DollarSign, ArrowRight, ShoppingCart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { RestrictedAccess } from '@/components/RestrictedAccess'
import { supabase } from '@/lib/supabase/client'

export default function Index() {
  const { products, invoices, updateProductStock, currentRole, permissions } = useStore()
  const [zeroStockProducts, setZeroStockProducts] = useState<any[]>([])

  useEffect(() => {
    if (!permissions[currentRole]?.dashboard) return

    const fetchZeroStock = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, code, name')
          .eq('stock', 0)
          .order('name', { ascending: true })

        if (!error && data) {
          setZeroStockProducts(data)
        }
      } catch (err) {
        console.error('Error fetching zero stock products:', err)
      }
    }

    fetchZeroStock()

    const channel = supabase
      .channel('zero_stock_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () =>
        fetchZeroStock(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentRole, permissions])

  if (!permissions[currentRole].dashboard) return <RestrictedAccess />

  const ventasMes = invoices.reduce((acc, inv) => acc + inv.amount, 0)
  const alertasStock = products.filter((p) => p.stock < p.minStock)
  const pendientes = invoices.filter((i) => i.status !== 'Pagada')
  const enMantencion = products.filter((p) => p.status === 'En Mantención')

  const canSell = permissions[currentRole].ventas

  return (
    <div className="space-y-8 pb-20 md:pb-0 animate-fade-in-up">
      <div className="flex justify-between items-end md:items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Resumen Operativo
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
            Estado general de la compañía al día de hoy.
          </p>
        </div>
        {canSell && (
          <Button
            asChild
            className="hidden md:flex bg-orange-500 hover:bg-orange-600 shadow-elevation h-11 gap-2 px-6"
          >
            <Link to="/ventas">
              <ShoppingCart className="w-5 h-5" /> Registrar Operación
            </Link>
          </Button>
        )}
      </div>

      {zeroStockProducts.length > 0 && (
        <Card className="border-red-500 shadow-sm bg-red-50/40">
          <CardHeader className="pb-3 border-b border-red-100">
            <CardTitle className="text-red-700 flex items-center gap-2 text-lg">
              <AlertTriangle className="w-5 h-5" />
              Falta de Equipamento
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {zeroStockProducts.map((p) => (
              <div
                key={p.id}
                className="flex flex-col md:flex-row justify-between md:items-center bg-white p-4 rounded-lg border border-red-100 shadow-sm gap-4 transition-all hover:shadow-md"
              >
                <div>
                  <p className="font-bold text-slate-800 text-base">{p.name}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      SKU: {p.code}
                    </span>
                    <Badge
                      variant="destructive"
                      className="text-[10px] px-2 py-0 uppercase tracking-wider bg-red-500 hover:bg-red-600"
                    >
                      Falta de equipamento
                    </Badge>
                  </div>
                </div>
                <Button
                  asChild
                  size="sm"
                  variant="default"
                  className="bg-red-600 hover:bg-red-700 text-white w-full md:w-auto shadow-sm"
                >
                  <Link to="/inventario">Reposición de stock</Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {canSell && (
          <Card className="shadow-subtle border-l-4 border-l-emerald-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                Ventas del Mes
              </CardTitle>
              <DollarSign className="w-5 h-5 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-slate-800">{formatCLP(ventasMes)}</div>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-subtle border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              Alertas de Stock
            </CardTitle>
            <PackageX className="w-5 h-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-800">{alertasStock.length}</div>
          </CardContent>
        </Card>

        {canSell && (
          <Card className="shadow-subtle border-l-4 border-l-yellow-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                Facturas Pendientes
              </CardTitle>
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-slate-800">{pendientes.length}</div>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-subtle border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              En Mantención
            </CardTitle>
            <Wrench className="w-5 h-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-800">{enMantencion.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-elevation border-0">
          <CardHeader className="border-b bg-slate-50 rounded-t-lg">
            <CardTitle className="text-lg flex justify-between items-center text-slate-800">
              Alertas de Inventario Crítico
              {permissions[currentRole].inventario && (
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="text-orange-600 hover:text-orange-700"
                >
                  <Link to="/inventario">
                    Ver Todo <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-6">SKU</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="text-right px-6">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alertasStock.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-6">
                      Stock saludable
                    </TableCell>
                  </TableRow>
                )}
                {alertasStock.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="px-6 font-medium">{p.sku}</TableCell>
                    <TableCell className="text-red-600 font-bold">
                      {p.stock} / {p.minStock}
                    </TableCell>
                    <TableCell className="text-right px-6">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-orange-200 text-orange-700"
                        onClick={() => updateProductStock(p.id, p.stock + 5)}
                      >
                        + Ingreso
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="shadow-elevation border-0 bg-slate-800 text-white">
          <CardHeader className="border-b border-slate-700">
            <CardTitle className="text-lg">Equipos en Taller (Mantención)</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {enMantencion.length === 0 && (
              <div className="text-center py-6 text-slate-400">Sin equipos en taller</div>
            )}
            {enMantencion.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-lg bg-slate-700/50 flex justify-between items-center border border-slate-600"
              >
                <div>
                  <p className="font-bold text-[15px] text-slate-100">{p.name}</p>
                  <p className="text-xs font-mono text-slate-400 mt-1">SKU: {p.sku}</p>
                </div>
                <Badge variant="outline" className={getEquipmentBadgeClass(p.status)}>
                  {p.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {canSell && (
        <div className="fixed bottom-6 right-6 md:hidden z-50">
          <Button
            asChild
            size="icon"
            className="h-16 w-16 rounded-full bg-orange-500 hover:bg-orange-600 shadow-elevation"
          >
            <Link to="/ventas">
              <ShoppingCart className="w-7 h-7 text-white" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
