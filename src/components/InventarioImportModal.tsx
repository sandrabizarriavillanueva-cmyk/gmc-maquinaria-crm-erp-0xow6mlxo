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

export function InventarioImportModal() {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [importErrors, setImportErrors] = useState<string[]>([])
  const [importSuccess, setImportSuccess] = useState(0)

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
      'disponible',
    ]
    const csvContent = `${headers.join(';')}\n${row.join(';')}`
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'plantilla_inventario.csv'
    link.click()
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
        firstRowStr.includes('precio')

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
                for (let j = 0; j < headers.length; j++) {
                  if (names.some((n) => headers[j].includes(n))) return row[j]
                }
              }
              return row[fallbackIdx]
            }

            const sku = getVal(['sku', 'codigo'], 0)
            const brand = getVal(['marca', 'brand'], 1) || 'Genérica'
            const name = getVal(['descrip', 'nombre', 'producto'], 2) || 'Equipo Genérico'
            const category = getVal(['categoria', 'tipo'], 3) || 'Repuesto'
            const specs = getVal(['especificacion', 'detalle', 'specs'], 4) || ''
            const rawPrice = getVal(['precio', 'price', 'valor'], 5) || '0'
            const rawCost = getVal(['costo', 'cost'], 6) || '0'
            const rawStock = getVal(['stock', 'cantidad'], 7) || '1'
            const rawStatus = getVal(['estado', 'status'], 8) || 'Disponible'

            if (!sku) return null

            const price = parseInt(String(rawPrice).replace(/[^0-9]/g, ''), 10) || 0
            const cost = parseInt(String(rawCost).replace(/[^0-9]/g, ''), 10) || 0
            const stock = parseInt(String(rawStock).replace(/[^0-9-]/g, ''), 10) || 1

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
          // Usamos upsert para evitar violaciones de clave única/RLS si el producto ya existe.
          // Esto actualiza el producto si el SKU ya existe, o lo inserta si es nuevo.
          const { error } = await supabase
            .from('products')
            .upsert(dbRows as any[], { onConflict: 'code' })
          if (error) {
            errors += dbRows.length
            errorDetails.push(`Error en lote ${batchIdx + 1}: ${error.message}`)
          } else {
            imported += dbRows.length
          }
        }

        setProgress({ current: batchIdx + 1, total: totalBatches })
        await new Promise((r) => setTimeout(r, 200)) // Throttle to ensure stability
      }

      if (errors > 0) {
        setImportErrors(errorDetails)
        setImportSuccess(imported)
      } else {
        toast({
          title: 'Importación Completada',
          description: `Se han procesado ${imported} equipos correctamente sin errores.`,
        })
        handleOpenChange(false)
        setTimeout(() => window.location.reload(), 1500)
      }
    } catch (err: any) {
      setImportErrors([`No se pudo procesar el archivo CSV: ${err.message}`])
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
              Sube tu archivo delimitado por punto y coma (;) para actualizar la base de datos. Si
              un SKU ya existe, se actualizarán sus datos.
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
              onChange={(e) => setFile(e.target.files?.[0] || null)}
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
                    onClick={() => window.location.reload()}
                    className="mt-2 w-full border-red-300 text-red-700 hover:bg-red-100"
                  >
                    Continuar y recargar
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
            {isLoading ? 'Sincronizando Base de Datos...' : 'Procesar Importación'}
          </Button>
        )}
      </DialogContent>
    </Dialog>
  )
}
