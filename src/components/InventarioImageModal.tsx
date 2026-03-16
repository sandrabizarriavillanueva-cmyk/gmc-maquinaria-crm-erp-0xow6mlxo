import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useStore } from '@/context/MainContext'
import { Image as ImageIcon } from 'lucide-react'

export function InventarioImageModal({
  productId,
  imageUrl,
}: {
  productId: string
  imageUrl?: string
}) {
  const { updateProductImage, currentRole } = useStore()
  const [open, setOpen] = useState(false)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const r = new FileReader()
      r.onloadend = () => {
        updateProductImage(productId, r.result as string)
        setOpen(false)
      }
      r.readAsDataURL(file)
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
        <div className="space-y-4 py-4">
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
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer"
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
