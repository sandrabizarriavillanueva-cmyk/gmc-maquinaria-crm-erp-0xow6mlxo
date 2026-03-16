import { useState } from 'react'
import { useStore } from '@/context/MainContext'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ShieldAlert, LogOut, FileText, CheckCircle2, Wrench } from 'lucide-react'
import { Client } from '@/types'
import { formatCLP, getInvoiceBadgeClass } from '@/lib/format'
import { printInvoice } from '@/lib/pdf'

export default function PortalCliente() {
  const { clients, invoices, products, companyLogo } = useStore()
  const [rut, setRut] = useState('')
  const [loggedClient, setLoggedClient] = useState<Client | null>(null)
  const [error, setError] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const cleanRut = rut.replace(/[^0-9Kk]/g, '')
    const c = clients.find((x) => x.rut.replace(/[^0-9Kk]/g, '') === cleanRut)
    if (c) {
      setLoggedClient(c)
      setError(false)
    } else {
      setError(true)
    }
  }

  if (!loggedClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 font-sans">
        <Card className="w-full max-w-md shadow-elevation border-0">
          <CardHeader className="text-center pb-8 pt-10">
            {companyLogo ? (
              <img src={companyLogo} className="h-16 mx-auto mb-6 object-contain" />
            ) : (
              <ShieldAlert className="w-14 h-14 mx-auto text-orange-500 mb-6" />
            )}
            <CardTitle className="text-2xl font-bold">Portal de Clientes</CardTitle>
            <p className="text-slate-500 mt-2 font-medium">Autoservicio Corporativo</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4 pb-6">
              <div className="space-y-2">
                <Input
                  placeholder="Ingrese su RUT comercial"
                  value={rut}
                  onChange={(e) => {
                    setRut(e.target.value)
                    setError(false)
                  }}
                  className={`h-14 text-center text-lg shadow-inner bg-slate-50 ${error ? 'border-red-500 ring-red-500' : ''}`}
                />
                {error && (
                  <p className="text-sm text-red-500 text-center font-medium">
                    RUT no encontrado. Intente nuevamente.
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full h-14 text-lg bg-slate-800 hover:bg-slate-700">
                Acceder al Portal
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  const clientProducts = products.filter(
    (p) => p.clientId === loggedClient.id && p.status === 'En Mantención',
  )
  const clientInvoices = invoices.filter((i) => i.clientId === loggedClient.id)

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <header className="bg-white border-b h-16 flex items-center justify-between px-4 md:px-8 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          {companyLogo ? (
            <img src={companyLogo} className="h-8 object-contain" />
          ) : (
            <div className="font-bold text-xl text-orange-500">GMC</div>
          )}
          <div className="h-6 w-px bg-slate-200 mx-2 hidden sm:block"></div>
          <h1 className="font-bold text-slate-700 hidden sm:block">Portal Clientes</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-md hidden sm:block">
            {loggedClient.name}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLoggedClient(null)}
            className="gap-2 border-slate-300"
          >
            <LogOut className="w-4 h-4" /> Salir
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 flex-1 w-full animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">
            Hola, {loggedClient.contactName || loggedClient.name}
          </h2>
          <p className="text-slate-500">Este es el resumen de sus operaciones y equipos.</p>
        </div>

        <Card className="shadow-subtle border-t-4 border-t-orange-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wrench className="w-5 h-5 text-orange-500" /> Equipos en Taller (Servicio Técnico)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {clientProducts.length === 0 ? (
              <p className="text-slate-500 text-sm py-4">
                No tiene equipos ingresados en nuestro taller actualmente.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {clientProducts.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 border rounded-xl bg-white shadow-sm flex flex-col"
                  >
                    <span className="text-xs font-mono text-slate-400 mb-1">OT / SKU: {p.sku}</span>
                    <span className="font-bold text-slate-800 text-lg leading-tight mb-2">
                      {p.name}
                    </span>
                    <div className="mt-auto pt-2 border-t flex justify-between items-center">
                      <span className="text-sm text-slate-500">{p.brand}</span>
                      <Badge className="bg-orange-50 text-orange-600 border-orange-200 animate-pulse hover:bg-orange-100">
                        En Reparación
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-subtle border-0">
          <CardHeader className="bg-slate-800 text-white rounded-t-xl">
            <CardTitle className="text-lg">Documentos y Facturación</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-6">Documento</TableHead>
                  <TableHead>Concepto</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right px-6">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientInvoices.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                      No hay documentos registrados.
                    </TableCell>
                  </TableRow>
                )}
                {clientInvoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="px-6 font-mono font-bold text-slate-700">
                      {inv.invoiceNumber}{' '}
                      <div className="text-xs font-sans text-slate-400 font-normal">{inv.date}</div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{inv.description}</TableCell>
                    <TableCell className="text-right font-bold">{formatCLP(inv.amount)}</TableCell>
                    <TableCell>
                      {inv.status === 'Pagada' ? (
                        <div className="flex items-center text-emerald-600 font-medium text-sm">
                          <CheckCircle2 className="w-4 h-4 mr-1" /> Pagada
                        </div>
                      ) : (
                        <Badge variant="outline" className={getInvoiceBadgeClass(inv.status)}>
                          {inv.status}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right px-6">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => printInvoice(inv, loggedClient, companyLogo)}
                        className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                      >
                        <FileText className="w-4 h-4 mr-2" /> PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
