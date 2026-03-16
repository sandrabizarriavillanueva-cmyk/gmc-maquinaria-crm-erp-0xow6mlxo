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

export default function Index() {
  const { products, invoices, updateProductStock, currentRole } = useStore()

  const ventasMes = invoices.reduce((acc, inv) => acc + inv.amount, 0)
  const alertasStock = products.filter((p) => p.stock < p.minStock)
  const pendientes = invoices.filter((i) => i.status !== 'Pagada')
  const enMantencion = products.filter((p) => p.status === 'En Mantención')

  const isTecnico = currentRole === 'Técnico'

  return (
    <div className="space-y-8 pb-20 md:pb-0">
      <div className="flex justify-between items-end md:items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Resumen Operativo
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
            Estado general de la compañía al día de hoy.
          </p>
        </div>
        {!isTecnico && (
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {!isTecnico && (
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

        {!isTecnico && (
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

      {!isTecnico && (
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
