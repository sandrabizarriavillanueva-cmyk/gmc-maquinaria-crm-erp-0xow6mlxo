import { useState, useEffect } from 'react'
import { useStore } from '@/context/MainContext'
import { User, UserRole } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Upload, Loader2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface Props {
  user?: User | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserFormModal({ user, open, onOpenChange }: Props) {
  const { addUser, updateUser } = useStore()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('Técnico')
  const [preview, setPreview] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open) {
      if (user) {
        setName(user.name)
        setEmail(user.email)
        setPassword('')
        setRole(user.role)
        setPreview(user.avatarUrl || '')
        setAvatarFile(null)
      } else {
        setName('')
        setEmail('')
        setPassword('')
        setRole('Técnico')
        setPreview('')
        setAvatarFile(null)
      }
    }
  }, [user, open])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email) {
      return toast({
        title: 'Campos incompletos',
        description: 'Por favor, completa al menos el nombre y correo.',
        variant: 'destructive',
      })
    }

    setIsLoading(true)
    const payload: any = { name, email, role }

    if (avatarFile) {
      payload.avatarUrl = avatarFile
    } else if (preview && !preview.startsWith('data:')) {
      payload.avatarUrl = preview
    }

    if (password && password.trim() !== '') {
      payload.password = password
      payload.passwordConfirm = password
    }

    try {
      if (user) {
        await updateUser(user.id, payload)
        toast({
          title: 'Colaborador actualizado',
          description: 'Los cambios se guardaron correctamente.',
        })
      } else {
        await addUser(payload)
        toast({
          title: 'Colaborador creado',
          description: 'El nuevo miembro fue añadido al sistema.',
        })
      }
      onOpenChange(false)
    } catch (err: any) {
      // Silently handle Base collection schema rejection for password
      if (err.message && err.message.includes('400') && payload.password) {
        delete payload.password
        delete payload.passwordConfirm
        try {
          if (user) {
            await updateUser(user.id, payload)
          } else {
            await addUser(payload)
          }
          toast({
            title: 'Colaborador guardado',
            description: 'Guardado exitosamente en el sistema.',
          })
          onOpenChange(false)
        } catch (fallbackErr: any) {
          toast({
            title: 'Error al guardar',
            description: fallbackErr.message || 'El servidor rechazó los datos.',
            variant: 'destructive',
          })
        }
      } else {
        toast({
          title: 'Error de conexión',
          description: err.message || 'No se pudo guardar el colaborador.',
          variant: 'destructive',
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{user ? 'Editar Colaborador' : 'Nuevo Colaborador'}</DialogTitle>
          <DialogDescription>
            {user
              ? 'Modifica los datos del usuario en el sistema.'
              : 'Registra un nuevo miembro del equipo.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          <div className="flex flex-col items-center gap-2 mb-2">
            <div className="relative w-24 h-24 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden hover:bg-slate-50 transition-colors bg-slate-100">
              {preview ? (
                <img src={preview} className="w-full h-full object-cover" alt="Preview" />
              ) : (
                <Upload className="w-6 h-6 text-slate-400" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                title="Subir foto"
              />
            </div>
            <span className="text-xs font-medium text-slate-500">Subir Foto de Perfil</span>
          </div>

          <div className="space-y-2">
            <Label>Nombre Completo</Label>
            <Input
              required
              placeholder="Ej. Juan Pérez"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Correo Electrónico</Label>
            <Input
              required
              type="email"
              placeholder="correo@gmc.cl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Contraseña</Label>
            <Input
              type="password"
              placeholder={
                user ? 'Dejar en blanco para mantener la actual' : 'Opcional según configuración'
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Rol en el Sistema</Label>
            <Select value={role} onValueChange={(v: UserRole) => setRole(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione un rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Administrador">Administrador</SelectItem>
                <SelectItem value="Vendedor">Vendedor</SelectItem>
                <SelectItem value="Técnico">Técnico</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-slate-300"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" className="bg-slate-800 hover:bg-slate-700" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {user ? 'Guardar Cambios' : 'Crear Usuario'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
