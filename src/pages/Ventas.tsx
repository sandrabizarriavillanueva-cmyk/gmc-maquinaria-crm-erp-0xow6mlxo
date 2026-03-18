import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'
import { formatCLP } from '@/lib/format'
import { CheckCircle2, FileText, ChevronsUpDown, Check, Loader2 } from 'lucide-react'
import { printInvoice } from '@/lib/pdf'
import { RestrictedAccess } from '@/components/RestrictedAccess'
import { SignaturePad } from '@/components/SignaturePad'
import { cn } from '@/lib/utils'

export default function Ventas() {
  const { clients, addInvoice, currentRole, permissions, companyLogo } = useStore()

  const [opType, setOpType] = useState('Venta')
  const [clientId, setClientId] = useState('')
  const [productId, setProductId] = useState('')
  const [qty, setQty] = useState(1)
  const [showSignature, setShowSignature] = useState(false)

  const [dbProducts, setDbProducts] = useState<any[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [openProductDropdown, setOpenProductDropdown] = useState(false)

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true })
      if (error) throw error
      if (data) setDbProducts(data)
    } catch (e: any) {
      toast({
        title: 'Error de conexión',
        description: 'No se pudo cargar el inventario desde la base de datos.',
        variant: 'destructive',
      })
    } finally {
      setIsLoadingProducts(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    setProductId('')
  }, [opType])

  if (!permissions[currentRole]?.ventas) return <RestrictedAccess />

  const selProd = dbProducts.find((p) => p.id === productId)
  const net = (selProd?.price || 0) * qty
  const iva = Math.round(net * 0.19)
  const total = net + iva

  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientId || !productId || !selProd) {
      return toast({
        title: 'Error',
        description: 'Debe seleccionar un cliente y un equipo.',
        variant: 'destructive',
      })
    }
    if (opType === 'Venta' && (selProd.stock || 0) < qty) {
      return toast({
        title: 'Error',
        description: 'Stock insuficiente para la venta.',
        variant: 'destructive',
      })
    }
    if (opType === 'Arriendo' && selProd.status !== 'Disponible') {
      return toast({
        title: 'Error',
        description: 'El equipo seleccionado no está disponible para arriendo.',
        variant: 'destructive',
      })
    }

    if (opType === 'Servicio Técnico') setShowSignature(true)
    else processTransaction()
  }

  const processTransaction = async (signatureUrl?: string) => {
    setIsSubmitting(true)
    try {
      if (opType === 'Venta') {
        const { error } = await supabase
          .from('products')
          .update({ stock: (selProd!.stock || 0) - qty })
          .eq('id', productId)
        if (error) throw error
      } else if (opType === 'Arriendo') {
        const { error } = await supabase
          .from('products')
          .update({ status: 'Arrendado', client_id: clientId })
          .eq('id', productId)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('products')
          .update({ status: 'En Mantención', client_id: clientId })
          .eq('id', productId)
        if (error) throw error
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

      await fetchProducts()

      setClientId('')
      setProductId('')
      setQty(1)
      setShowSignature(false)
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e.message || 'No se pudo completar la operación.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePrintQuote = () => {
    if (!clientId || !productId || !selProd) {
      return toast({
        title: 'Faltan datos',
        description: 'Seleccione cliente y equipo para generar cotización.',
        variant: 'destructive',
      })
    }
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
          description: `Cotización: ${opType} de ${selProd.name} (x${qty})`,
        },
        c,
        companyLogo,
      )
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in-up">
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
                  <Popover open={openProductDropdown} onOpenChange={setOpenProductDropdown}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openProductDropdown}
                        disabled={isLoadingProducts}
                        className="h-12 w-full justify-between bg-slate-50 border-input font-normal hover:bg-slate-50"
                      >
                        {isLoadingProducts ? (
                          <span className="flex items-center text-slate-500">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cargando inventario...
                          </span>
                        ) : productId ? (
                          <span className="truncate pr-4 font-medium text-slate-800">
                            {dbProducts.find((p) => p.id === productId)?.code} -{' '}
                            {dbProducts.find((p) => p.id === productId)?.name}
                          </span>
                        ) : (
                          <span className="text-slate-500">Buscar por código o nombre...</span>
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Filtrar equipos..." className="h-11" />
                        <CommandList>
                          <CommandEmpty>No se encontraron equipos en el inventario.</CommandEmpty>
                          <CommandGroup>
                            {dbProducts.map((p) => {
                              const isOutOfStock = opType === 'Venta' && (p.stock || 0) < 1
                              const isNotAvailableForRent =
                                opType === 'Arriendo' && p.status !== 'Disponible'
                              const isDisabled = isOutOfStock || isNotAvailableForRent

                              return (
                                <CommandItem
                                  key={p.id}
                                  value={`${p.code} ${p.name}`}
                                  disabled={isDisabled}
                                  onSelect={() => {
                                    setProductId(p.id)
                                    setOpenProductDropdown(false)
                                  }}
                                  className="flex flex-col items-start py-2.5 cursor-pointer"
                                >
                                  <div className="flex items-center w-full">
                                    <Check
                                      className={cn(
                                        'mr-2 h-4 w-4 shrink-0 text-orange-500',
                                        productId === p.id ? 'opacity-100' : 'opacity-0',
                                      )}
                                    />
                                    <span className="font-semibold text-slate-800">{p.code}</span>
                                    <span className="ml-2 text-slate-600 truncate">{p.name}</span>
                                  </div>
                                  <div className="flex items-center gap-2 pl-6 mt-1.5 text-[11px] font-medium text-slate-500">
                                    <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                      Stock: {p.stock || 0}
                                    </span>
                                    <span
                                      className={cn(
                                        'px-1.5 py-0.5 rounded border',
                                        p.status === 'Disponible'
                                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                          : 'bg-orange-50 text-orange-700 border-orange-200',
                                      )}
                                    >
                                      {p.status || 'Disponible'}
                                    </span>
                                    {isDisabled && (
                                      <span className="text-red-500 font-bold ml-1">
                                        {isOutOfStock ? '(Sin Stock)' : '(No Disponible)'}
                                      </span>
                                    )}
                                  </div>
                                </CommandItem>
                              )
                            })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid gap-2">
                  <Label>Cantidad</Label>
                  <Input
                    type="number"
                    min="1"
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                    className="h-12 text-lg font-bold bg-slate-50"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-14 text-base font-bold bg-orange-500 hover:bg-orange-600 gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5" />
                  )}
                  Confirmar Operación
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrintQuote}
                  disabled={isSubmitting}
                  className="h-14 px-6 border-slate-300 gap-2 bg-white"
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
            onSave={(url) => processTransaction(url)}
            onCancel={() => setShowSignature(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
