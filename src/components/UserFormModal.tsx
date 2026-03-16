import { useState, useEffect } from 'react'
import { z } from 'zod'
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

const formSchema = z.object({
  name: z.string().min(2, 'El nombre es obligatorio'),
  email: z
    .string()
    .email('Formato de correo inválido')
    .refine((val) => !val.includes('.gmailcom'), {
      message: 'Formato de correo incorrecto, verifique el dominio (.com)',
    }),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .optional()
    .or(z.literal('')),
  role: z.enum(['Administrador', 'Vendedor', 'Técnico']),
})

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

  const buildPayload = (skipPassword = false) => {
    const payload: any = { name, email, role }

    if (!skipPassword && password && password.trim() !== '') {
      payload.password = password
    }

    if (avatarFile) {
      const formData = new FormData()
      Object.entries(payload).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          formData.append(key, val as any)
        }
      })
      formData.append('avatar', avatarFile)
      return formData
    }

    return payload
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      formSchema.parse({ name, email, password: password || undefined, role })
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return toast({
          title: 'Error de validación',
          description: err?.errors?.[0]?.message || 'Revise los datos ingresados',
          variant: 'destructive',
        })
      }
      return toast({
        title: 'Error de validación',
        description: 'Error inesperado al verificar el formulario.',
        variant: 'destructive',
      })
    }

    setIsLoading(true)
    const initialPayload = buildPayload(false)

    try {
      if (user) {
        await updateUser(user.id, initialPayload)
        toast({
          title: 'Colaborador actualizado',
          description: 'Los cambios se guardaron correctamente.',
        })
      } else {
        await addUser(initialPayload)
        toast({
          title: 'Colaborador creado',
          description: 'El nuevo miembro fue añadido al sistema.',
        })
      }
      onOpenChange(false)
    } catch (err: any) {
      toast({
        title: 'Error al procesar la solicitud',
        description: err?.message || 'No se pudo guardar la información del colaborador.',
        variant: 'destructive',
      })
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
              placeholder={user ? 'Dejar en blanco para mantener la actual' : 'Mínimo 6 caracteres'}
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
