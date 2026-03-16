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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useStore } from '@/context/MainContext'
import { toast } from '@/hooks/use-toast'
import { Plus, Loader2 } from 'lucide-react'

export function InventarioAddModal() {
  const { addProduct } = useStore()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [sku, setSku] = useState('')
  const [name, setName] = useState('')
  const [brand, setBrand] = useState('')
  const [category, setCategory] = useState('Compresor')
  const [price, setPrice] = useState(0)
  const [stock, setStock] = useState(1)
  const [minStock, setMinStock] = useState(1)

  const submit = async () => {
    if (!sku || !name || !brand || price <= 0) {
      return toast({
        title: 'Error',
        description: 'Complete todos los campos obligatorios',
        variant: 'destructive',
      })
    }

    setIsLoading(true)
    try {
      await addProduct({
        sku,
        name,
        brand,
        category,
        price,
        stock,
        minStock,
        status: 'Disponible',
      })
      setOpen(false)
      toast({ title: 'Equipo registrado', description: `${sku} ha sido añadido al inventario.` })
    } catch (e) {
      toast({
        title: 'Error',
        description: 'No se pudo guardar el equipo en la base de datos.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-orange-500 hover:bg-orange-600 h-11 gap-2">
          <Plus className="w-4 h-4" /> Registrar Equipo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Registrar Nuevo Equipo</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="grid gap-2">
            <Label>SKU *</Label>
            <Input
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="Ej. CMP-005"
              className="h-11"
            />
          </div>
          <div className="grid gap-2">
            <Label>Categoría *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Compresor">Compresor</SelectItem>
                <SelectItem value="Secador">Secador de Aire</SelectItem>
                <SelectItem value="Chiller">Chiller</SelectItem>
                <SelectItem value="Filtro">Filtro / Repuesto</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2 grid gap-2">
            <Label>Descripción del Equipo *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Compresor Tornillo 20HP"
              className="h-11"
            />
          </div>
          <div className="grid gap-2">
            <Label>Marca *</Label>
            <Input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Ej. Atlas Copco"
              className="h-11"
            />
          </div>
          <div className="grid gap-2">
            <Label>Precio Unitario Neto (CLP) *</Label>
            <Input
              type="number"
              value={price || ''}
              onChange={(e) => setPrice(Number(e.target.value))}
              placeholder="0"
              className="h-11"
            />
          </div>
          <div className="grid gap-2">
            <Label>Stock Inicial</Label>
            <Input
              type="number"
              value={stock}
              onChange={(e) => setStock(Number(e.target.value))}
              className="h-11"
            />
          </div>
          <div className="grid gap-2">
            <Label>Alerta Stock Mínimo</Label>
            <Input
              type="number"
              value={minStock}
              onChange={(e) => setMinStock(Number(e.target.value))}
              className="h-11"
            />
          </div>
        </div>
        <Button
          onClick={submit}
          disabled={isLoading}
          className="w-full h-11 bg-slate-800 hover:bg-slate-700"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar en Inventario'}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
