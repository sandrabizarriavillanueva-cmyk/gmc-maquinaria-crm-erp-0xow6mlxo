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
import { Shield, Briefcase, Wrench } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function RoleSelector() {
  const { currentRole, setCurrentRole, currentUser, userAvatar, isLoadingProfile } = useStore()

  if (isLoadingProfile) {
    return (
      <Button variant="ghost" className="gap-2 px-2 sm:px-4 h-10 w-[140px] justify-start" disabled>
        <Skeleton className="w-8 h-8 rounded-full shrink-0" />
        <div className="hidden sm:flex flex-col gap-1 items-start w-full">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-2 w-12" />
        </div>
      </Button>
    )
  }

  const getInitials = (name: string) => {
    if (!name) return 'U'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="gap-2 font-medium text-slate-600 hover:text-slate-900 px-2 sm:px-4 h-10"
        >
          <Avatar className="w-8 h-8 border border-slate-200">
            <AvatarImage src={userAvatar || ''} alt={currentUser || 'User'} />
            <AvatarFallback className="bg-slate-100 text-slate-600 text-xs font-semibold">
              {getInitials(currentUser || 'User')}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:flex flex-col items-start text-left">
            <span
              className="text-sm leading-none max-w-[100px] truncate"
              title={currentUser || 'User'}
            >
              {currentUser || 'User'}
            </span>
            <span className="text-xs text-orange-600 leading-none mt-1 capitalize">
              {currentRole}
            </span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Cambiar Rol (Simulación)</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => setCurrentRole('Administrador')}
          className="cursor-pointer"
        >
          <Shield className="w-4 h-4 mr-2" /> Administrador
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setCurrentRole('Vendedor')} className="cursor-pointer">
          <Briefcase className="w-4 h-4 mr-2" /> Vendedor
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setCurrentRole('Técnico')} className="cursor-pointer">
          <Wrench className="w-4 h-4 mr-2" /> Técnico
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
