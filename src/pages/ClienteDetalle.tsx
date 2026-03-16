import { useParams, Link } from 'react-router-dom'
import { useStore } from '@/context/MainContext'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
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
import { Phone, Mail, ArrowLeft, Building2, MapPin, Upload, FileText } from 'lucide-react'
import { formatCLP, getInvoiceBadgeClass } from '@/lib/format'
import { RestrictedAccess } from '@/components/RestrictedAccess'
import { printInvoice } from '@/lib/pdf'

export default function ClienteDetalle() {
  const { id } = useParams()
  const { clients, invoices, addClientDocument, currentRole, permissions, companyLogo } = useStore()

  if (!permissions[currentRole].clientes) return <RestrictedAccess />

  const client = clients.find((c) => c.id === id)
  if (!client) return <div className="p-8 text-center text-xl font-bold">Cliente no encontrado</div>

  const clientInvoices = invoices.filter((i) => i.clientId === id)

  const totalPagado = clientInvoices
    .filter((i) => i.status === 'Pagada')
    .reduce((acc, i) => acc + i.amount, 0)
  const totalPendiente = clientInvoices
    .filter((i) => i.status !== 'Pagada')
    .reduce((acc, i) => acc + i.amount, 0)

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target?.files
    if (!files || files.length === 0) return
    const file = files[0]
    if (file) {
      addClientDocument(client.id, {
        id: Math.random().toString(),
        name: file.name,
        url: URL.createObjectURL(file), // Mock URL for viewing
        date: new Date().toISOString().split('T')[0],
      })
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Button asChild variant="ghost" className="gap-2 pl-0 hover:bg-transparent text-slate-500">
        <Link to="/clientes">
          <ArrowLeft className="w-4 h-4" /> Volver al directorio
        </Link>
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card className="shadow-subtle border-slate-200">
            <CardHeader className="bg-slate-800 text-white rounded-t-lg pb-4">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-4 shadow-md">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl">{client.name}</CardTitle>
              <p className="text-slate-300 font-mono text-sm">{client.rut}</p>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-5 h-5 text-slate-400" />
                <span className="font-medium">{client.region}</span>
              </div>
              <div className="border-t pt-4 flex gap-2">
                <Button asChild variant="outline" className="flex-1 gap-2 h-11 border-slate-300">
                  <a href={`tel:${client.phone}`}>
                    <Phone className="w-4 h-4" /> Llamar
                  </a>
                </Button>
                <Button asChild variant="outline" className="flex-1 gap-2 h-11 border-slate-300">
                  <a href={`mailto:${client.email}`}>
                    <Mail className="w-4 h-4" /> Email
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-subtle border-slate-200">
            <CardHeader className="flex flex-row justify-between items-center pb-2">
              <CardTitle className="text-lg">Documentos</CardTitle>
              <div className="relative">
                <Button variant="outline" size="sm" className="gap-2 shrink-0">
                  <Upload className="w-4 h-4" /> Subir
                </Button>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleDocUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 pt-2">
                {!client.documents?.length && (
                  <p className="text-sm text-slate-500 text-center py-4">
                    No hay contratos o documentos.
                  </p>
                )}
                {client.documents?.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex flex-col gap-2 p-3 rounded-lg border bg-slate-50"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-red-500 shrink-0" />
                      <span className="font-medium text-sm text-slate-700 truncate">
                        {doc.name}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pl-8">
                      <span className="text-xs text-slate-500">{doc.date}</span>
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-orange-600"
                        asChild
                      >
                        <a href={doc.url} target="_blank" rel="noreferrer">
                          Ver
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Card className="shadow-subtle border-l-4 border-l-emerald-500">
              <CardContent className="p-6">
                <p className="text-sm font-medium text-slate-500 mb-1">Total Pagado</p>
                <p className="text-2xl font-bold text-slate-800">{formatCLP(totalPagado)}</p>
              </CardContent>
            </Card>
            <Card className="shadow-subtle border-l-4 border-l-orange-500">
              <CardContent className="p-6">
                <p className="text-sm font-medium text-slate-500 mb-1">Deuda Pendiente</p>
                <p className="text-2xl font-bold text-orange-600">{formatCLP(totalPendiente)}</p>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-subtle border-slate-200">
            <CardHeader>
              <CardTitle>Historial de Operaciones y Facturas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Monto Total</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientInvoices.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-slate-500 py-4">
                          Sin operaciones registradas
                        </TableCell>
                      </TableRow>
                    )}
                    {clientInvoices.map((inv) => (
                      <TableRow key={inv.id}>
                        <TableCell className="whitespace-nowrap">{inv.date}</TableCell>
                        <TableCell className="font-medium text-slate-700">
                          {inv.description}
                        </TableCell>
                        <TableCell className="font-bold">{formatCLP(inv.amount)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getInvoiceBadgeClass(inv.status)}>
                            {inv.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => printInvoice(inv, client, companyLogo)}
                            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                          >
                            PDF
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
