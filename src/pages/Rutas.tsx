import { useState } from 'react'
import { useStore } from '@/context/MainContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Sun, CloudRain, Navigation, TrafficCone } from 'lucide-react'
import { RestrictedAccess } from '@/components/RestrictedAccess'

const REGIONS = ['Antofagasta', 'Atacama', 'Santiago', 'Biobío', 'Los Lagos']

const WEATHER_DATA: Record<string, any> = {
  Antofagasta: {
    icon: Sun,
    temp: '24°C',
    cond: 'Soleado',
    traffic: 'Fluido',
    color: 'text-orange-500',
  },
  Atacama: {
    icon: Sun,
    temp: '26°C',
    cond: 'Despejado',
    traffic: 'Normal',
    color: 'text-yellow-500',
  },
  Santiago: {
    icon: CloudRain,
    temp: '15°C',
    cond: 'Lluvioso',
    traffic: 'Alto Riesgo',
    color: 'text-blue-500',
  },
  Biobío: {
    icon: CloudRain,
    temp: '12°C',
    cond: 'Chubascos',
    traffic: 'Normal',
    color: 'text-blue-600',
  },
  'Los Lagos': {
    icon: CloudRain,
    temp: '8°C',
    cond: 'Lluvia Fuerte',
    traffic: 'Normal',
    color: 'text-slate-600',
  },
}

export default function Rutas() {
  const { clients, products, currentRole, permissions } = useStore()
  const [selectedRegion, setSelectedRegion] = useState('Antofagasta')

  if (!permissions[currentRole].rutas) return <RestrictedAccess />

  const targetClients = clients.filter((c) => c.region.includes(selectedRegion))
  const maintenanceProducts = products.filter((p) => p.status === 'En Mantención' && p.clientId)

  const WIcon = WEATHER_DATA[selectedRegion]?.icon || Sun

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Rutas de Terreno</h1>
        <p className="text-slate-500">Planificación de visitas técnicas y geolocalización.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        <Card className="w-full lg:w-1/3 shadow-subtle flex flex-col">
          <CardHeader className="pb-3 border-b bg-slate-50 rounded-t-xl">
            <CardTitle className="text-lg">Zonas Operativas</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-auto">
            <div className="flex flex-col">
              {REGIONS.map((r) => (
                <button
                  key={r}
                  onClick={() => setSelectedRegion(r)}
                  className={`p-4 text-left border-b last:border-0 transition-colors flex justify-between items-center ${selectedRegion === r ? 'bg-orange-50 border-l-4 border-l-orange-500' : 'hover:bg-slate-50 border-l-4 border-l-transparent'}`}
                >
                  <span
                    className={`font-semibold ${selectedRegion === r ? 'text-orange-700' : 'text-slate-700'}`}
                  >
                    {r}
                  </span>
                  <Navigation
                    className={`w-4 h-4 ${selectedRegion === r ? 'text-orange-500' : 'text-slate-300'}`}
                  />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="w-full lg:w-2/3 shadow-subtle overflow-hidden flex flex-col relative">
          <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-slate-200 min-w-48">
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">
              Clima y Tráfico Local
            </h3>
            <div className="flex items-center gap-3 mb-2">
              <WIcon className={`w-8 h-8 ${WEATHER_DATA[selectedRegion]?.color}`} />
              <div>
                <div className="font-bold text-xl leading-none">
                  {WEATHER_DATA[selectedRegion]?.temp}
                </div>
                <div className="text-sm text-slate-600">{WEATHER_DATA[selectedRegion]?.cond}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm pt-2 border-t mt-2">
              <TrafficCone className="w-4 h-4 text-slate-400" /> Tráfico:{' '}
              <span className="font-semibold">{WEATHER_DATA[selectedRegion]?.traffic}</span>
            </div>
          </div>

          <div className="w-full h-64 lg:h-full relative bg-slate-200">
            <img
              src="https://img.usecurling.com/p/1200/800?q=topographic%20map&color=blue"
              className="w-full h-full object-cover opacity-60 mix-blend-multiply"
              alt="Map"
            />
            {targetClients.map((c, i) => {
              const hasMaintenance = maintenanceProducts.some((p) => p.clientId === c.id)
              return (
                <div
                  key={c.id}
                  className="absolute flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2"
                  style={{ top: `${30 + i * 20}%`, left: `${40 + (i % 2) * 20}%` }}
                >
                  <div
                    className={`p-2 rounded-full shadow-lg border-2 border-white animate-bounce ${hasMaintenance ? 'bg-red-500' : 'bg-slate-700'}`}
                  >
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <Badge
                    variant="outline"
                    className="mt-1 bg-white/90 shadow-sm border-slate-200 whitespace-nowrap"
                  >
                    {c.name}
                  </Badge>
                </div>
              )
            })}
            {targetClients.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Badge variant="secondary" className="text-sm bg-white/80 backdrop-blur">
                  Sin operaciones en la zona
                </Badge>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
