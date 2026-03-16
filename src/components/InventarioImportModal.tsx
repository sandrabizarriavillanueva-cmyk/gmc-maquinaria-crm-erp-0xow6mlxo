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
import { Upload, Download, FileUp } from 'lucide-react'
import { EquipmentStatus } from '@/types'

export function InventarioImportModal() {
  const { addProduct } = useStore()
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  const downloadTemplate = () => {
    const headers = [
      'SKU_Código',
      'Marca',
      'Nombre del Producto',
      'Categoría',
      'Especificaciones Técnicas',
      'Precio Unitario',
      'Stock Actual',
      'Stock Mínimo',
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
    link.download = 'inventario_template.csv'
    link.click()
  }

  const handleImport = async () => {
    if (!file) return
    const text = await file.text()
    const data = parseCSV(text)

    let imported = 0
    let errors = 0

    data.forEach((row) => {
      const sku = row['SKU_Código'] || row['SKU_Codigo'] || row['SKU']
      const brand = row['Marca']
      const name = row['Nombre del Producto'] || row['Nombre']
      const rawCategory = row['Categoría'] || row['Categoria']
      const specs = row['Especificaciones Técnicas'] || row['Especificaciones Tecnicas']
      const rawPrice = row['Precio Unitario']
      const rawStock = row['Stock Actual']
      const rawMinStock = row['Stock Mínimo'] || row['Stock Minimo']
      const rawStatus = row['Estado del Equipo']

      if (!sku || !name || !brand || !rawPrice) {
        errors++
        return
      }

      const price = parseInt(rawPrice.replace(/[^0-9]/g, ''), 10) || 0
      const stock = parseInt(rawStock, 10) || 0
      const minStock = parseInt(rawMinStock, 10) || 0

      let status: EquipmentStatus = 'Disponible'
      if (rawStatus === 'Inactivo') status = 'Inactivo'
      if (rawStatus === 'En Mantención' || rawStatus === 'En Mantencion') status = 'En Mantención'
      if (rawStatus?.includes('Arrendado') || rawStatus?.includes('Locación')) status = 'Arrendado'

      const validCategories = [
        'Compresor',
        'Secador',
        'Purgador',
        'Chiller',
        'Repuesto',
        'Consumible',
      ]
      const category = validCategories.includes(rawCategory) ? rawCategory : 'Repuesto'

      addProduct({
        id: Math.random().toString(),
        sku,
        name,
        brand,
        category,
        price,
        stock,
        minStock,
        status,
        specs,
      })
      imported++
    })

    setOpen(false)
    setFile(null)

    if (imported > 0) {
      toast({
        title: 'Importación exitosa',
        description: `${imported} productos importados correctamente.`,
      })
    }
    if (errors > 0) {
      toast({
        title: 'Errores en importación',
        description: `${errors} filas omitidas por datos obligatorios faltantes.`,
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-11 gap-2 border-slate-300">
          <Upload className="w-4 h-4" /> Importar Inventario
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Importar Inventario desde CSV</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <p className="text-sm text-slate-500">
              Descarga la plantilla para asegurarte de que tu archivo tiene el formato correcto.
            </p>
            <Button variant="secondary" onClick={downloadTemplate} className="w-full gap-2">
              <Download className="w-4 h-4" /> Descargar Plantilla
            </Button>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Subir Archivo CSV</p>
            <Input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="cursor-pointer h-11"
            />
          </div>
        </div>
        <Button
          onClick={handleImport}
          disabled={!file}
          className="w-full h-11 bg-slate-800 hover:bg-slate-700 gap-2"
        >
          <FileUp className="w-4 h-4" /> Procesar Importación
        </Button>
      </DialogContent>
    </Dialog>
  )
}
