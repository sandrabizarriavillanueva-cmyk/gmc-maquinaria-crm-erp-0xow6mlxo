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
import { Label } from '@/components/ui/label'
import { useStore } from '@/context/MainContext'
import { formatRUT, validateRUT } from '@/lib/format'
import { toast } from '@/hooks/use-toast'
import { Plus } from 'lucide-react'

export function ClienteAddModal() {
  const { addClient } = useStore()
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({ rut: '', name: '', region: '', phone: '', email: '' })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name === 'rut') {
      setFormData({ ...formData, rut: formatRUT(value) })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const submit = () => {
    if (!validateRUT(formData.rut)) {
      return toast({
        title: 'RUT Inválido',
        description: 'Por favor, ingrese un RUT chileno válido',
        variant: 'destructive',
      })
    }
    if (!formData.name || !formData.region) {
      return toast({
        title: 'Error',
        description: 'Complete los campos obligatorios',
        variant: 'destructive',
      })
    }

    addClient({ id: Math.random().toString(), ...formData })
    setOpen(false)
    setFormData({ rut: '', name: '', region: '', phone: '', email: '' })
    toast({ title: 'Cliente agregado', description: `${formData.name} registrado con éxito.` })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-orange-500 hover:bg-orange-600 h-11 gap-2">
          <Plus className="w-4 h-4" /> Nuevo Cliente
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Registrar Nuevo Cliente</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Razón Social *</Label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ej. Minería Norte SpA"
              className="h-11"
            />
          </div>
          <div className="grid gap-2">
            <Label>RUT *</Label>
            <Input
              name="rut"
              value={formData.rut}
              onChange={handleChange}
              placeholder="12.345.678-9"
              className="h-11"
            />
          </div>
          <div className="grid gap-2">
            <Label>Región *</Label>
            <Input
              name="region"
              value={formData.region}
              onChange={handleChange}
              placeholder="Ej. Antofagasta"
              className="h-11"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Teléfono</Label>
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+56 9..."
                className="h-11"
              />
            </div>
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="contacto@..."
                className="h-11"
              />
            </div>
          </div>
        </div>
        <Button onClick={submit} className="w-full h-11 bg-slate-800 hover:bg-slate-700">
          Guardar Cliente
        </Button>
      </DialogContent>
    </Dialog>
  )
}
