import { useStore } from '@/context/MainContext'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ShieldAlert } from 'lucide-react'

export default function Auditoria() {
  const { currentRole, auditLogs } = useStore()

  if (currentRole !== 'Administrador') {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <ShieldAlert className="w-16 h-16 text-slate-300" />
        <div className="text-xl font-bold text-slate-500">Acceso Restringido</div>
        <p className="text-slate-400">Solo administradores pueden ver el historial de auditoría.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Historial de Auditoría</h1>
        <p className="text-slate-500">
          Registro centralizado de actividades y cambios en el sistema.
        </p>
      </div>

      <div className="rounded-xl border bg-white shadow-subtle overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Fecha / Hora</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Acción</TableHead>
              <TableHead>Elemento Afectado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {auditLogs.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                  No hay registros disponibles.
                </TableCell>
              </TableRow>
            )}
            {auditLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="whitespace-nowrap text-sm text-slate-500">
                  {new Date(log.date).toLocaleString('es-CL')}
                </TableCell>
                <TableCell className="font-medium">{log.user}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-slate-50">
                    {log.role}
                  </Badge>
                </TableCell>
                <TableCell className="font-semibold text-slate-700">{log.action}</TableCell>
                <TableCell className="text-slate-600">{log.target}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
