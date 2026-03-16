import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useStore } from '@/context/MainContext'
import { toast } from '@/hooks/use-toast'
import { parseCSV } from '@/lib/csv'
import { Upload, Download, FileUp, Loader2, AlertCircle } from 'lucide-react'
import { EquipmentStatus } from '@/types'

export function InventarioImportModal() {
  const { addProduct } = useStore()
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [importErrors, setImportErrors] = useState<string[]>([])
  const [importSuccess, setImportSuccess] = useState(0)

  const handleOpenChange = (val: boolean) => {
    setOpen(val)
    if (!val) {
      setFile(null)
      setImportErrors([])
      setImportSuccess(0)
    }
  }

  const downloadTemplate = () => {
    const headers = [
      'SKU',
      'Marca',
      'Nombre del Producto',
      'Categoria',
      'Especificaciones Tecnicas',
      'Precio Unitario',
      'Stock Actual',
      'Stock Minimo',
      'Estado del Equipo',
    ]
    const row = [
      'COMP-001',
      'Metalplan',
      'Compresor de Aire',
      'Compresor',
      '10HP 10 Bar',
      '1500000',
      '5',
      '2',
      'Disponible',
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
        'Por favor, convierte tu archivo Excel a formato "CSV (delimitado por comas)" antes de subirlo para asegurar una correcta importación.',
      ])
      return
    }

    setIsLoading(true)
    setImportErrors([])
    setImportSuccess(0)

    try {
      const text = await file.text()
      const data = parseCSV(text)

      if (data.length === 0) {
        setImportErrors(['El archivo está vacío o no tiene un formato CSV válido.'])
        setIsLoading(false)
        return
      }

      let imported = 0
      let errors = 0
      const errorDetails: string[] = []

      for (const [index, row] of data.entries()) {
        const rowNum = index + 2

        const getCol = (names: string[]) => {
          for (const key of Object.keys(row)) {
            const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, '')
            if (names.some((n) => cleanKey === n.toLowerCase().replace(/[^a-z0-9]/g, ''))) {
              return row[key]
            }
          }
          return undefined
        }

        const sku = getCol(['SKUCodigo', 'SKU', 'Codigo'])
        const brand = getCol(['Marca']) || 'Genérica'
        const name = getCol(['NombredelProducto', 'Nombre', 'Producto', 'Descripcion'])
        const rawCategory = getCol(['Categoria', 'Tipo']) || 'Repuesto'
        const specs = getCol(['EspecificacionesTecnicas', 'Especificaciones', 'Detalles']) || ''
        const rawPrice = getCol(['PrecioUnitario', 'Precio', 'Valor', 'Neto']) || '0'
        const rawStock = getCol(['StockActual', 'Stock', 'Cantidad']) || '0'
        const rawMinStock = getCol(['StockMinimo', 'Minimo']) || '0'
        const rawStatus = getCol(['EstadodelEquipo', 'Estado']) || 'Disponible'

        if (!sku || !name) {
          errors++
          errorDetails.push(`Fila ${rowNum}: Faltan datos obligatorios (SKU o Nombre).`)
          continue
        }

        const price = parseInt(String(rawPrice).replace(/[^0-9]/g, ''), 10) || 0
        const stock = parseInt(String(rawStock).replace(/[^0-9-]/g, ''), 10) || 0
        const minStock = parseInt(String(rawMinStock).replace(/[^0-9-]/g, ''), 10) || 0

        let status: EquipmentStatus = 'Disponible'
        const lowerStatus = String(rawStatus).toLowerCase()
        if (lowerStatus.includes('inactivo')) status = 'Inactivo'
        else if (lowerStatus.includes('mantenci') || lowerStatus.includes('reparaci'))
          status = 'En Mantención'
        else if (lowerStatus.includes('arrendado') || lowerStatus.includes('locaci'))
          status = 'Arrendado'

        const validCategories = [
          'Compresor',
          'Secador',
          'Chiller',
          'Filtro',
          'Purgador',
          'Repuesto',
          'Consumible',
        ]
        const category =
          validCategories.find((c) => c.toLowerCase() === String(rawCategory).toLowerCase()) ||
          'Repuesto'

        try {
          await addProduct({
            sku: String(sku).trim(),
            name: String(name).trim(),
            brand: String(brand).trim(),
            category,
            price,
            stock,
            minStock,
            status,
            specs: String(specs).trim(),
          })
          imported++
        } catch (e: any) {
          errors++
          errorDetails.push(
            `Fila ${rowNum} (${sku}): El servidor rechazó los datos (posible SKU duplicado).`,
          )
        }
      }

      if (errors > 0) {
        setImportErrors(errorDetails)
        setImportSuccess(imported)
      } else {
        handleOpenChange(false)
        toast({
          title: 'Importación Completada',
          description: `Se han importado ${imported} equipos correctamente en el inventario.`,
        })
      }
    } catch (err: any) {
      setImportErrors([`No se pudo leer el archivo: ${err.message}`])
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
              Descarga la plantilla CSV y complétala con la información técnica de los equipos.
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
            />
          </div>

          {importErrors.length > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-800 flex flex-col gap-2">
              <div className="flex items-center gap-2 font-bold">
                <AlertCircle className="w-4 h-4" />
                Se encontraron {importErrors.length} advertencias:
              </div>
              <ul className="list-disc pl-5 max-h-32 overflow-y-auto space-y-1">
                {importErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
              {importSuccess > 0 && (
                <p className="text-emerald-700 font-medium pt-1 border-t border-red-200">
                  Adicionalmente, se importaron {importSuccess} equipos con éxito.
                </p>
              )}
            </div>
          )}
        </div>
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
          {isLoading ? 'Sincronizando con Base de Datos...' : 'Procesar Importación'}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
