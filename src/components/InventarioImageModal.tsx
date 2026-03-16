import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useStore } from '@/context/MainContext'
import { Image as ImageIcon, Loader2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export function InventarioImageModal({
  productId,
  imageUrl,
}: {
  productId: string
  imageUrl?: string
}) {
  const { updateProductImage, currentRole } = useStore()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target?.files
    if (!files || files.length === 0) return
    const file = files[0]
    if (file) {
      setIsLoading(true)
      try {
        await updateProductImage(productId, file)
        setOpen(false)
        toast({ title: 'Imagen guardada correctamente' })
      } catch (err: any) {
        toast({
          title: 'Error al subir imagen',
          description: err.message || 'No se pudo guardar la fotografía.',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }
  }

  const canEdit = currentRole === 'Administrador' || currentRole === 'Técnico'

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="w-10 h-10 shrink-0 rounded overflow-hidden border bg-slate-50 flex items-center justify-center hover:ring-2 ring-orange-500 transition-all shadow-sm">
          {imageUrl ? (
            <img src={imageUrl} className="w-full h-full object-cover" alt="Preview" />
          ) : (
            <ImageIcon className="w-4 h-4 text-slate-400" />
          )}
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Fotografía Técnica del Equipo</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4 relative">
          {isLoading && (
            <div className="absolute inset-0 z-10 bg-white/50 flex items-center justify-center rounded-md">
              <Loader2 className="w-8 h-8 animate-spin text-slate-800" />
            </div>
          )}
          {imageUrl ? (
            <img
              src={imageUrl}
              className="w-full max-h-[300px] object-contain rounded-md border shadow-sm"
              alt="Preview"
            />
          ) : (
            <div className="w-full h-40 bg-slate-100 rounded-md border-2 border-dashed flex items-center justify-center text-slate-400">
              Sin imagen asignada
            </div>
          )}
          {canEdit && (
            <div className="grid w-full items-center gap-1.5 pt-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleFile}
                disabled={isLoading}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer disabled:opacity-50"
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
