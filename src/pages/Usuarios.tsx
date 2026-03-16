import { useState } from 'react'
import { useStore } from '@/context/MainContext'
import { User } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableRow,
  TableCell,
  TableHeader,
  TableHead,
  TableBody,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { UserFormModal } from '@/components/UserFormModal'
import { RestrictedAccess } from '@/components/RestrictedAccess'
import { Search, UserPlus, Pencil, Trash2 } from 'lucide-react'

export default function Usuarios() {
  const { users, deleteUser, currentRole, permissions } = useStore()
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  if (!permissions[currentRole].usuarios)
    return <RestrictedAccess message="Módulo de Colaboradores" />

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  )

  const openAdd = () => {
    setEditingUser(null)
    setFormOpen(true)
  }

  const openEdit = (u: User) => {
    setEditingUser(u)
    setFormOpen(true)
  }

  const handleDelete = () => {
    if (userToDelete) {
      deleteUser(userToDelete.id)
      setUserToDelete(null)
    }
  }

  const getRoleColor = (role: string) => {
    if (role === 'Administrador') return 'bg-purple-100 text-purple-700 border-purple-200'
    if (role === 'Vendedor') return 'bg-emerald-100 text-emerald-700 border-emerald-200'
    return 'bg-blue-100 text-blue-700 border-blue-200'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">
            Directorio de Colaboradores
          </h1>
          <p className="text-slate-500">
            Gestiona los perfiles y niveles de acceso de todo el equipo.
          </p>
        </div>
        <Button
          onClick={openAdd}
          className="bg-orange-500 hover:bg-orange-600 shadow-elevation gap-2 w-full md:w-auto h-11"
        >
          <UserPlus className="w-5 h-5" /> Nuevo Usuario
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o correo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-11 text-base"
        />
      </div>

      <div className="hidden md:block rounded-xl border bg-white shadow-subtle overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-16"></TableHead>
              <TableHead>Nombre Completo</TableHead>
              <TableHead>Correo Electrónico</TableHead>
              <TableHead>Rol Asignado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <Avatar className="h-10 w-10 border border-slate-200 shadow-sm">
                    <AvatarImage src={u.avatarUrl} className="object-cover" />
                    <AvatarFallback className="bg-slate-100 font-semibold text-slate-600">
                      {u.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-semibold text-slate-800">{u.name}</TableCell>
                <TableCell className="text-slate-600">{u.email}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={getRoleColor(u.role)}>
                    {u.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-slate-500 hover:text-slate-800"
                      onClick={() => openEdit(u)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-red-400 hover:text-red-600 hover:bg-red-50"
                      onClick={() => setUserToDelete(u)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                  No se encontraron usuarios.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="grid grid-cols-1 gap-4 md:hidden">
        {filtered.map((u) => (
          <Card key={u.id} className="shadow-subtle border-slate-200">
            <CardContent className="p-4 flex gap-4 items-center">
              <Avatar className="w-14 h-14 shrink-0 border border-slate-200 shadow-sm">
                <AvatarImage src={u.avatarUrl} className="object-cover" />
                <AvatarFallback className="bg-slate-100 font-semibold text-slate-600">
                  {u.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-800 truncate">{u.name}</h3>
                <p className="text-sm text-slate-500 truncate">{u.email}</p>
                <Badge variant="outline" className={`mt-1.5 ${getRoleColor(u.role)}`}>
                  {u.role}
                </Badge>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-500 bg-slate-50"
                  onClick={() => openEdit(u)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500 hover:text-red-600 bg-red-50"
                  onClick={() => setUserToDelete(u)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <UserFormModal user={editingUser} open={formOpen} onOpenChange={setFormOpen} />

      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar colaborador?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción revocará el acceso permanente de <strong>{userToDelete?.name}</strong> al
              sistema. ¿Deseas continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="mt-2 sm:mt-0">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={handleDelete}
            >
              Eliminar Usuario
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
