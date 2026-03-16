import { useState } from 'react'
import { useStore } from '@/context/MainContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'
import { formatCLP } from '@/lib/format'
import { CheckCircle2, FileText } from 'lucide-react'
import { printInvoice } from '@/lib/pdf'
import { RestrictedAccess } from '@/components/RestrictedAccess'
import { SignaturePad } from '@/components/SignaturePad'

export default function Ventas() {
  const {
    clients,
    products,
    updateProductStock,
    updateProductStatus,
    assignProductClient,
    addInvoice,
    currentRole,
    permissions,
    companyLogo,
  } = useStore()
  const [opType, setOpType] = useState('Venta')
  const [clientId, setClientId] = useState('')
  const [productId, setProductId] = useState('')
  const [qty, setQty] = useState(1)
  const [showSignature, setShowSignature] = useState(false)

  if (!permissions[currentRole].ventas) return <RestrictedAccess />

  const selProd = products.find((p) => p.id === productId)
  const net = (selProd?.price || 0) * qty
  const iva = Math.round(net * 0.19)
  const total = net + iva

  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientId || !productId)
      return toast({
        title: 'Error',
        description: 'Debe seleccionar un cliente y un equipo.',
        variant: 'destructive',
      })
    if (opType === 'Venta' && selProd!.stock < qty)
      return toast({
        title: 'Error',
        description: 'Stock insuficiente para la venta.',
        variant: 'destructive',
      })

    if (opType === 'Servicio Técnico') setShowSignature(true)
    else processTransaction()
  }

  const processTransaction = (signatureUrl?: string) => {
    if (opType === 'Venta') {
      updateProductStock(productId, selProd!.stock - qty)
    } else if (opType === 'Arriendo') {
      updateProductStatus(productId, 'Arrendado')
      assignProductClient(productId, clientId)
    } else {
      updateProductStatus(productId, 'En Mantención')
      assignProductClient(productId, clientId)
    }

    addInvoice({
      id: Math.random().toString(),
      invoiceNumber: `F-${Math.floor(Math.random() * 10000)}`,
      date: new Date().toISOString().split('T')[0],
      clientId,
      amount: total,
      status: 'Pendiente',
      description: `${opType} - ${selProd!.name} (x${qty})`,
      signatureUrl,
    })

    toast({ title: 'Éxito', description: 'Transacción completada y factura generada.' })
    setClientId('')
    setProductId('')
    setQty(1)
  }

  const handlePrintQuote = () => {
    if (!clientId || !productId)
      return toast({
        title: 'Faltan datos',
        description: 'Seleccione cliente y equipo.',
        variant: 'destructive',
      })
    const c = clients.find((x) => x.id === clientId)
    if (c) {
      printInvoice(
        {
          id: 'cot',
          invoiceNumber: `COT-${Math.floor(Math.random() * 10000)}`,
          date: new Date().toLocaleDateString('es-CL'),
          clientId: c.id,
          amount: total,
          status: 'Pendiente',
          description: `Cotización: ${opType} de ${selProd!.name} (x${qty})`,
        },
        c,
        companyLogo,
      )
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">
          Control de Ventas y Arriendos
        </h1>
        <p className="text-slate-500">
          Genera cotizaciones y registra nuevas operaciones comerciales o servicios.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 shadow-subtle border-slate-200">
          <CardContent className="pt-6">
            <form onSubmit={handlePreSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label>Tipo de Operación</Label>
                  <Select value={opType} onValueChange={setOpType}>
                    <SelectTrigger className="h-12 bg-slate-50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Venta">Venta de Equipo</SelectItem>
                      <SelectItem value="Arriendo">Arriendo (Mensual)</SelectItem>
                      <SelectItem value="Servicio Técnico">Servicio Técnico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Cliente Asignado</Label>
                  <Select value={clientId} onValueChange={setClientId}>
                    <SelectTrigger className="h-12 bg-slate-50">
                      <SelectValue placeholder="Seleccione un cliente..." />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} ({c.rut})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Equipo / Item</Label>
                  <Select value={productId} onValueChange={setProductId}>
                    <SelectTrigger className="h-12 bg-slate-50">
                      <SelectValue placeholder="Seleccione un equipo..." />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((p) => (
                        <SelectItem
                          key={p.id}
                          value={p.id}
                          disabled={opType === 'Venta' && p.stock === 0}
                        >
                          {p.sku} - {p.name}{' '}
                          {p.stock === 0 && opType === 'Venta' ? '(Sin Stock)' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Cantidad</Label>
                  <Input
                    type="number"
                    min="1"
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                    className="h-12 text-lg font-bold"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button
                  type="submit"
                  className="flex-1 h-14 text-base font-bold bg-orange-500 hover:bg-orange-600 gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" /> Confirmar Operación
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrintQuote}
                  className="h-14 px-6 border-slate-300 gap-2"
                >
                  <FileText className="w-5 h-5" /> Cotización PDF
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 shadow-elevation border-0 bg-slate-800 text-white h-fit">
          <CardHeader>
            <CardTitle className="text-xl">Resumen Transacción</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center text-slate-300">
              <span>Valor Neto</span>
              <span className="font-mono text-lg">{formatCLP(net)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-300 border-b border-slate-700 pb-4">
              <span>IVA (19%)</span>
              <span className="font-mono text-lg">{formatCLP(iva)}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-lg font-semibold text-orange-400">Total CLP</span>
              <span className="font-bold font-mono text-3xl">{formatCLP(total)}</span>
            </div>
            {opType === 'Venta' && selProd && (
              <div className="mt-6 p-4 bg-slate-700/50 rounded-lg text-sm text-center border border-slate-600 text-slate-300">
                Al confirmar, el stock del equipo se reducirá y la factura quedará como Pendiente.
              </div>
            )}
            {opType === 'Servicio Técnico' && (
              <div className="mt-6 p-4 bg-slate-700/50 rounded-lg text-sm text-center border border-slate-600 text-slate-300">
                Se solicitará la Firma Digital del cliente al confirmar para respaldar el servicio.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showSignature} onOpenChange={setShowSignature}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl border-b pb-4">
              Firma Digital de Conformidad
            </DialogTitle>
          </DialogHeader>
          <SignaturePad
            onSave={(url) => {
              setShowSignature(false)
              processTransaction(url)
            }}
            onCancel={() => setShowSignature(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
