import { ShieldAlert } from 'lucide-react'

export function RestrictedAccess({ message = 'Acceso Restringido' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4 animate-fade-in-up">
      <ShieldAlert className="w-16 h-16 text-slate-300" />
      <div className="text-xl font-bold text-slate-500">{message}</div>
      <p className="text-slate-400">No tienes permisos suficientes para ver este módulo.</p>
    </div>
  )
}
