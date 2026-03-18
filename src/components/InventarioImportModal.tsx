import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { toast } from '@/hooks/use-toast'
import { parseCSVRaw } from '@/lib/csv'
import { Upload, Download, FileUp, Loader2, AlertCircle } from 'lucide-react'
import { useStore } from '@/context/MainContext'

export function InventarioImportModal() {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [importErrors, setImportErrors] = useState<string[]>([])
  const [importSuccess, setImportSuccess] = useState(0)

  const store = useStore() as any

  const handleOpenChange = (val: boolean) => {
    setOpen(val)
    if (!val) {
      setFile(null)
      setImportErrors([])
      setImportSuccess(0)
      setProgress({ current: 0, total: 0 })
    }
  }

  const downloadTemplate = () => {
    const headers = [
      'SKU',
      'Brand',
      'Description',
      'Category',
      'Specs',
      'Price',
      'Cost',
      'Stock',
      'Status',
    ]
    const row = [
      'SAV-1000',
      'Metalplan',
      'Acumulador de Aire Vertical',
      'Equipo',
      '1.000 litros',
      '2980000',
      '0',
      '1',
      'Disponible',
    ]
    const csvContent = `${headers.join(';')}\n${row.join(';')}`
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'plantilla_inventario.csv'
    link.click()
  }

  const refreshData = async () => {
    if (typeof store.fetchProducts === 'function') {
      await store.fetchProducts()
    } else if (typeof store.fetchData === 'function') {
      await store.fetchData()
    } else if (typeof store.setProducts === 'function') {
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
      if (data) {
        const mapped = data.map((d) => ({
          id: d.id,
          sku: d.code,
          name: d.name,
          brand: d.brand || '',
          category: d.category || '',
          status: d.status || 'Disponible',
          stock: d.stock || 0,
          minStock: d.min_stock || 0,
          price: d.price || 0,
          cost: d.cost || 0,
          specs: d.specs || '',
          imageUrl: d.image_url || undefined,
          clientId: d.client_id || undefined,
        }))
        store.setProducts(mapped)
      }
    }
  }

  const handleImport = async () => {
    if (!file) return

    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      setImportErrors([
        'Por favor, convierte tu archivo Excel a formato "CSV (delimitado por comas o punto y coma)" antes de subirlo.',
      ])
      return
    }

    setIsLoading(true)
    setImportErrors([])
    setImportSuccess(0)

    try {
      const text = await file.text()
      const rawData = parseCSVRaw(text)

      if (rawData.length === 0) {
        setImportErrors(['El archivo está vacío o no tiene un formato CSV válido.'])
        setIsLoading(false)
        return
      }

      const firstRowStr = rawData[0].join('').toLowerCase()
      const hasHeaders =
        firstRowStr.includes('sku') ||
        firstRowStr.includes('marca') ||
        firstRowStr.includes('descripc') ||
        firstRowStr.includes('precio') ||
        firstRowStr.includes('code')

      const startIndex = hasHeaders ? 1 : 0
      const headers = hasHeaders
        ? rawData[0].map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''))
        : []

      const itemsToImport = rawData.slice(startIndex)

      const BATCH_SIZE = 50
      const totalBatches = Math.ceil(itemsToImport.length / BATCH_SIZE)
      setProgress({ current: 0, total: totalBatches })

      let imported = 0
      let errors = 0
      const errorDetails: string[] = []

      for (let batchIdx = 0; batchIdx < totalBatches; batchIdx++) {
        const chunk = itemsToImport.slice(batchIdx * BATCH_SIZE, (batchIdx + 1) * BATCH_SIZE)

        const dbRows = chunk
          .map((row) => {
            if (row.length < 2) return null

            const getVal = (names: string[], fallbackIdx: number) => {
              if (hasHeaders) {
                const idx = headers.findIndex((h) => names.some((n) => h.includes(n)))
                if (idx !== -1) return row[idx]
                return undefined
              }
              return row[fallbackIdx]
            }

            const sku = getVal(['sku', 'codigo', 'code'], 0)
            if (!sku || String(sku).trim() === '') return null

            const brand = getVal(['marca', 'brand'], 1) || 'Genérica'
            const name = getVal(['descrip', 'nombre', 'producto', 'name'], 2) || 'Equipo Genérico'
            const category = getVal(['categoria', 'tipo', 'category'], 3) || 'Repuesto'
            const specs = getVal(['especificacion', 'detalle', 'specs'], 4) || ''

            const rawPrice = getVal(['precio', 'price', 'valor'], 5)
            const rawCost = getVal(['costo', 'cost'], 6)
            const rawStock = getVal(['stock', 'cantidad'], 7)
            const rawStatus = getVal(['estado', 'status'], 8) || 'Disponible'

            const parseNum = (val: any) => {
              if (val === undefined || val === null || val === '') return undefined
              const parsed = parseInt(String(val).replace(/[^0-9-]/g, ''), 10)
              return isNaN(parsed) ? undefined : parsed
            }

            const price = parseNum(rawPrice) ?? 0
            const cost = parseNum(rawCost) ?? 0
            const stock = parseNum(rawStock) ?? 0

            let status = 'Disponible'
            const lowerStatus = String(rawStatus).toLowerCase()
            if (lowerStatus.includes('inactiv') || lowerStatus.includes('baja')) status = 'Inactivo'
            else if (lowerStatus.includes('mantenci') || lowerStatus.includes('reparaci'))
              status = 'En Mantención'
            else if (lowerStatus.includes('arrend') || lowerStatus.includes('locaci'))
              status = 'Arrendado'

            return {
              code: String(sku).trim(),
              name: String(name).trim(),
              brand: String(brand).trim(),
              category: String(category).trim(),
              specs: String(specs).trim(),
              price,
              cost,
              stock,
              min_stock: 0,
              status,
            }
          })
          .filter((r) => r !== null)

        if (dbRows.length > 0) {
          try {
            const { error } = await supabase.from('products').upsert(dbRows, { onConflict: 'code' })

            if (error) {
              let msg = error.message
              if (
                msg.includes('<') ||
                msg.includes('Unexpected token') ||
                msg.includes('DOCTYPE') ||
                msg.includes('JSON')
              ) {
                throw new Error(
                  'El servidor devolvió una respuesta no válida (HTML). Verifica la conexión o la API.',
                )
              }

              for (const row of dbRows) {
                const { error: rowError } = await supabase
                  .from('products')
                  .upsert(row, { onConflict: 'code' })
                if (rowError) {
                  let rMsg = rowError.message
                  if (
                    rMsg.includes('<') ||
                    rMsg.includes('Unexpected token') ||
                    rMsg.includes('DOCTYPE') ||
                    rMsg.includes('JSON')
                  ) {
                    throw new Error(
                      'El servidor devolvió una respuesta no válida (HTML). Verifica la conexión o la API.',
                    )
                  }
                  errors++
                  errorDetails.push(`SKU ${row.code}: ${rMsg}`)
                } else {
                  imported++
                }
              }
            } else {
              imported += dbRows.length
            }
          } catch (innerErr: any) {
            let msg = innerErr.message || String(innerErr)
            if (
              msg.includes('<') ||
              msg.includes('Unexpected token') ||
              msg.includes('DOCTYPE') ||
              msg.includes('JSON')
            ) {
              msg =
                'El servidor devolvió una respuesta no válida (HTML). Verifica la conexión o la API.'
            }
            throw new Error(msg)
          }
        }

        setProgress({ current: batchIdx + 1, total: totalBatches })
      }

      await refreshData()

      if (errors > 0) {
        setImportErrors(errorDetails)
        setImportSuccess(imported)
        toast({
          title: 'Importación con advertencias',
          description: `Se procesaron ${imported} equipos, pero hubo ${errors} errores.`,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Importación Completada',
          description: `Se han procesado ${imported} equipos correctamente sin errores.`,
        })
        handleOpenChange(false)
      }
    } catch (err: any) {
      let msg = err.message || String(err)
      if (
        msg.includes('Unexpected token') ||
        msg.includes('<!DOCTYPE') ||
        msg.includes('<!--') ||
        msg.includes('JSON')
      ) {
        msg = 'El servidor devolvió una respuesta no válida (HTML). Verifica la conexión o la API.'
      }
      setImportErrors([`No se pudo procesar el archivo CSV: ${msg}`])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-11 gap-2 border-slate-300">
          <Upload className="w-4 h-4" /> Importar Inventario
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Carga Masiva de Equipos</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <p className="text-sm text-slate-500">
              Sube tu archivo delimitado por comas o punto y coma para actualizar la base de datos.
              Si un SKU ya existe, se actualizarán sus datos automáticamente.
            </p>
            <Button variant="secondary" onClick={downloadTemplate} className="w-full gap-2">
              <Download className="w-4 h-4" /> Descargar Plantilla
            </Button>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Subir Archivo CSV</p>
            <Input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => {
                const files = e.target?.files
                if (files && files.length > 0) {
                  setFile(files[0])
                } else {
                  setFile(null)
                }
              }}
              className="cursor-pointer h-11"
              disabled={isLoading}
            />
          </div>

          {isLoading && progress.total > 0 && (
            <div className="space-y-2 animate-fade-in">
              <div className="flex justify-between text-sm font-medium text-slate-600">
                <span>
                  Procesando lote {progress.current} de {progress.total}...
                </span>
                <span>{Math.round((progress.current / progress.total) * 100)}%</span>
              </div>
              <Progress value={(progress.current / progress.total) * 100} className="h-2" />
            </div>
          )}

          {importErrors.length > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-800 flex flex-col gap-2">
              <div className="flex items-center gap-2 font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                Se encontraron advertencias en la importación:
              </div>
              <ul className="list-disc pl-5 max-h-32 overflow-y-auto space-y-1">
                {importErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
              {importSuccess > 0 && (
                <div className="pt-2 mt-1 border-t border-red-200">
                  <p className="text-emerald-700 font-medium">
                    Adicionalmente, se procesaron {importSuccess} equipos con éxito.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenChange(false)}
                    className="mt-2 w-full border-red-300 text-red-700 hover:bg-red-100"
                  >
                    Cerrar
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
        {!importErrors.length && (
          <Button
            onClick={handleImport}
            disabled={!file || isLoading}
            className="w-full h-11 bg-slate-800 hover:bg-slate-700 gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileUp className="w-4 h-4" />
            )}
            {isLoading ? 'Sincronizando con Supabase...' : 'Procesar Importación'}
          </Button>
        )}
      </DialogContent>
    </Dialog>
  )
}
