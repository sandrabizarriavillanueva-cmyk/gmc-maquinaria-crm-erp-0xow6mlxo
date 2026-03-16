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
import { validateRUT, formatRUT } from '@/lib/format'
import { Upload, Download, FileUp } from 'lucide-react'

export function ClienteImportModal() {
  const { addClient } = useStore()
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  const downloadTemplate = () => {
    const headers = [
      'Razón Social',
      'RUT',
      'Ciudad/Región',
      'Nombre Contacto',
      'Email Contacto',
      'Teléfono Contacto',
      'Segmento de Industria',
    ]
    const row = [
      'Ejemplo S.A.',
      '76.123.456-7',
      'Antofagasta',
      'Juan Pérez',
      'jperez@ejemplo.cl',
      '+56912345678',
      'Minería',
    ]
    const csvContent = `${headers.join(';')}\n${row.join(';')}`
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'clientes_template.csv'
    link.click()
  }

  const handleImport = async () => {
    if (!file) return
    const text = await file.text()
    const data = parseCSV(text)

    let imported = 0
    let errors = 0

    data.forEach((row) => {
      const name = row['Razón Social'] || row['Razon Social']
      const rut = row['RUT']
      const region =
        row['Ciudad/Región'] || row['Ciudad'] || row['Region'] || row['Ciudad / Región']
      const contactName = row['Nombre Contacto']
      const email = row['Email Contacto']
      const phone = row['Teléfono Contacto'] || row['Telefono Contacto']
      const industry = row['Segmento de Industria']

      if (!name || !rut || !validateRUT(rut)) {
        errors++
        return
      }

      addClient({
        id: Math.random().toString(),
        name,
        rut: formatRUT(rut),
        region: region || '',
        contactName: contactName || '',
        email: email || '',
        phone: phone || '',
        industry: industry || '',
      })
      imported++
    })

    setOpen(false)
    setFile(null)

    if (imported > 0) {
      toast({
        title: 'Importación exitosa',
        description: `${imported} clientes importados correctamente.`,
      })
    }
    if (errors > 0) {
      toast({
        title: 'Errores en importación',
        description: `${errors} filas omitidas por datos inválidos o RUT incorrecto.`,
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-11 gap-2 border-slate-300">
          <Upload className="w-4 h-4" /> Importar Clientes
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Importar Clientes desde CSV</DialogTitle>
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
