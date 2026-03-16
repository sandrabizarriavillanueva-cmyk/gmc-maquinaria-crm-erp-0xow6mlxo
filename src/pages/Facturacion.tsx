import { useState } from 'react'
import { useStore } from '@/context/MainContext'
import { formatCLP, getInvoiceBadgeClass } from '@/lib/format'
import {
  Table,
  TableRow,
  TableCell,
  TableHeader,
  TableHead,
  TableBody,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { FileText, CheckCircle2 } from 'lucide-react'
import { printInvoice } from '@/lib/pdf'
import { RestrictedAccess } from '@/components/RestrictedAccess'

export default function Facturacion() {
  const { invoices, clients, updateInvoiceStatus, currentRole, permissions, companyLogo } =
    useStore()
  const [filter, setFilter] = useState('Todas')

  if (!permissions[currentRole].facturacion) return <RestrictedAccess />

  const getClientName = (id: string) => clients.find((c) => c.id === id)?.name || 'Desconocido'
  const filtered = invoices.filter((i) => filter === 'Todas' || i.status === filter)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Cuentas por Cobrar</h1>
          <p className="text-slate-500">Gestión y control de pagos y generación de documentos.</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full md:w-48 h-11 border-orange-200">
            <SelectValue placeholder="Filtrar estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todas">Todas las facturas</SelectItem>
            <SelectItem value="Pendiente">Pendientes</SelectItem>
            <SelectItem value="Vencida">Vencidas</SelectItem>
            <SelectItem value="Pagada">Pagadas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="hidden lg:block rounded-xl border bg-white shadow-subtle overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Folio</TableHead>
              <TableHead>Emisión</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Concepto</TableHead>
              <TableHead className="text-right">Total CLP</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell className="font-mono font-bold text-slate-700">
                  {inv.invoiceNumber}
                </TableCell>
                <TableCell className="whitespace-nowrap">{inv.date}</TableCell>
                <TableCell className="font-medium text-slate-800">
                  {getClientName(inv.clientId)}
                </TableCell>
                <TableCell className="max-w-[200px] truncate" title={inv.description}>
                  {inv.description}
                </TableCell>
                <TableCell className="text-right font-bold">{formatCLP(inv.amount)}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={getInvoiceBadgeClass(inv.status)}>
                    {inv.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-slate-300 text-slate-600 hover:text-slate-900"
                      onClick={() => {
                        const c = clients.find((x) => x.id === inv.clientId)
                        if (c) printInvoice(inv, c, companyLogo)
                      }}
                    >
                      <FileText className="w-4 h-4 mr-1.5" /> PDF
                    </Button>
                    {inv.status !== 'Pagada' && (
                      <Button
                        size="sm"
                        onClick={() => updateInvoiceStatus(inv.id, 'Pagada')}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1.5" /> Pagada
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                  No hay facturas en esta categoría.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:hidden">
        {filtered.map((inv) => (
          <Card key={inv.id} className="shadow-subtle border-slate-200">
            <CardContent className="p-5 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div className="font-mono font-bold text-lg">{inv.invoiceNumber}</div>
                <Badge variant="outline" className={getInvoiceBadgeClass(inv.status)}>
                  {inv.status}
                </Badge>
              </div>
              <div className="text-slate-800 font-semibold">{getClientName(inv.clientId)}</div>
              <div className="text-sm text-slate-500 border-b pb-2">{inv.description}</div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-slate-500">{inv.date}</span>
                <span className="font-bold text-xl">{formatCLP(inv.amount)}</span>
              </div>
              <div className="flex gap-2 mt-2">
                <Button
                  variant="outline"
                  className="flex-1 border-slate-300"
                  onClick={() => {
                    const c = clients.find((x) => x.id === inv.clientId)
                    if (c) printInvoice(inv, c, companyLogo)
                  }}
                >
                  <FileText className="w-4 h-4 mr-2" /> PDF
                </Button>
                {inv.status !== 'Pagada' && (
                  <Button
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
                    onClick={() => updateInvoiceStatus(inv.id, 'Pagada')}
                  >
                    Marcar Pagada
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
