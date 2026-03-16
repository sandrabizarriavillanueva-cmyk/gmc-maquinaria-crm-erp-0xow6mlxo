import { useStore } from '@/context/MainContext'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { UserCircle, Shield, Briefcase, Wrench } from 'lucide-react'
import { UserRole } from '@/types'

export function RoleSelector() {
  const { currentRole, setCurrentRole, currentUser } = useStore()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="gap-2 font-medium text-slate-600 hover:text-slate-900 px-2 sm:px-4"
        >
          <UserCircle className="w-6 h-6" />
          <div className="hidden sm:flex flex-col items-start text-left">
            <span className="text-sm leading-none">{currentUser}</span>
            <span className="text-xs text-orange-600 leading-none mt-1">{currentRole}</span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Cambiar Rol (Simulación)</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => setCurrentRole('Administrador' as UserRole)}
          className="cursor-pointer"
        >
          <Shield className="w-4 h-4 mr-2" /> Administrador
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setCurrentRole('Vendedor' as UserRole)}
          className="cursor-pointer"
        >
          <Briefcase className="w-4 h-4 mr-2" /> Vendedor
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setCurrentRole('Técnico' as UserRole)}
          className="cursor-pointer"
        >
          <Wrench className="w-4 h-4 mr-2" /> Técnico
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
