import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '@/context/MainContext'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableRow,
  TableCell,
  TableHeader,
  TableHead,
  TableBody,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ClienteAddModal } from '@/components/ClienteAddModal'
import { Search, MapPin } from 'lucide-react'

export default function Clientes() {
  const { clients } = useStore()
  const [search, setSearch] = useState('')

  const filtered = clients.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.rut.includes(search),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">
            Directorio de Clientes
          </h1>
          <p className="text-slate-500">
            Visualiza y gestiona la cartera de clientes corporativos.
          </p>
        </div>
        <ClienteAddModal />
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Buscar por Razón Social o RUT..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-11 text-base"
        />
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block rounded-xl border bg-white shadow-subtle overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>RUT</TableHead>
              <TableHead>Razón Social</TableHead>
              <TableHead>Región</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium whitespace-nowrap">{c.rut}</TableCell>
                <TableCell className="font-semibold">{c.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-slate-500">
                    <MapPin className="w-4 h-4" /> {c.region}
                  </div>
                </TableCell>
                <TableCell>{c.phone}</TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="outline" size="sm" className="h-9">
                    <Link to={`/clientes/${c.id}`}>Ver Detalle</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {filtered.map((c) => (
          <Card key={c.id} className="shadow-subtle border-slate-200">
            <CardContent className="p-5 space-y-4">
              <div className="flex flex-col gap-1">
                <span className="font-bold text-lg text-slate-800">{c.name}</span>
                <span className="text-sm font-medium text-orange-600">{c.rut}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <MapPin className="w-4 h-4" /> {c.region}
              </div>
              <Button asChild variant="outline" className="w-full h-11 mt-2 border-slate-300">
                <Link to={`/clientes/${c.id}`}>Ver Detalle de Cliente</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
