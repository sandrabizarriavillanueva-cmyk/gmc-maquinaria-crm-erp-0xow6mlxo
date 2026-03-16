import { useStore } from '@/context/MainContext'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Bell, AlertTriangle, AlertCircle, Wrench } from 'lucide-react'

export function NotificationsDropdown() {
  const { products, invoices, currentRole } = useStore()

  const alertasStock = products.filter((p) => p.stock < p.minStock)
  const vencidas = invoices.filter((i) => i.status === 'Vencida')
  const enMantencion = products.filter((p) => p.status === 'En Mantención')

  const total =
    alertasStock.length + (currentRole !== 'Técnico' ? vencidas.length : 0) + enMantencion.length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hover:bg-slate-100">
          <Bell className="w-5 h-5 text-slate-600" />
          {total > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full animate-pulse border border-white"></span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notificaciones Recientes</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {total === 0 && (
          <div className="p-6 text-center text-sm text-slate-500">No hay nuevas alertas</div>
        )}
        {alertasStock.map((p) => (
          <DropdownMenuItem key={'s' + p.id} className="cursor-pointer gap-3 p-3 items-start">
            <div className="bg-red-100 p-2 rounded-full shrink-0">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm">Stock Crítico: {p.sku}</span>
              <span className="text-xs text-slate-500">
                Quedan {p.stock} unidades (Mín: {p.minStock})
              </span>
            </div>
          </DropdownMenuItem>
        ))}
        {currentRole !== 'Técnico' &&
          vencidas.map((i) => (
            <DropdownMenuItem key={'v' + i.id} className="cursor-pointer gap-3 p-3 items-start">
              <div className="bg-yellow-100 p-2 rounded-full shrink-0">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm">Factura Vencida: {i.invoiceNumber}</span>
                <span className="text-xs text-slate-500">Requiere gestión de cobro</span>
              </div>
            </DropdownMenuItem>
          ))}
        {enMantencion.map((p) => (
          <DropdownMenuItem key={'m' + p.id} className="cursor-pointer gap-3 p-3 items-start">
            <div className="bg-orange-100 p-2 rounded-full shrink-0">
              <Wrench className="w-4 h-4 text-orange-600" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm">Equipo en Taller: {p.sku}</span>
              <span className="text-xs text-slate-500">{p.name}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
