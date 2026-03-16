import { useStore } from '@/context/MainContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, PieChart, Pie, Cell } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { ShieldAlert } from 'lucide-react'

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
]

export default function Reportes() {
  const { currentRole, invoices, products } = useStore()

  if (currentRole !== 'Administrador') {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <ShieldAlert className="w-16 h-16 text-slate-300" />
        <div className="text-xl font-bold text-slate-500">Acceso Restringido</div>
        <p className="text-slate-400">Este módulo es exclusivo para Administradores.</p>
      </div>
    )
  }

  // Simulate historical data + current month
  const currentTotal = invoices.reduce((acc, i) => acc + i.amount, 0)
  const salesData = [
    { name: 'Julio', total: currentTotal * 0.7 },
    { name: 'Agosto', total: currentTotal * 0.9 },
    { name: 'Sept.', total: currentTotal * 1.1 },
    { name: 'Actual', total: currentTotal },
  ]

  const categories = products.reduce(
    (acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const inventoryData = Object.entries(categories).map(([name, value], i) => ({
    name,
    value,
    fill: COLORS[i % COLORS.length],
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">
          Reportes Avanzados (BI)
        </h1>
        <p className="text-slate-500">Métricas clave de rendimiento y estado de inventario.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-subtle">
          <CardHeader>
            <CardTitle>Evolución de Ventas (Últimos 4 Meses)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ total: { label: 'Ingresos CLP', color: 'hsl(var(--chart-2))' } }}
              className="h-[320px] w-full"
            >
              <BarChart data={salesData} margin={{ top: 20, right: 0, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis
                  tickFormatter={(val) => `$${(val / 1000000).toFixed(1)}M`}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="total"
                  fill="var(--color-total)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={60}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-subtle">
          <CardHeader>
            <CardTitle>Composición de Inventario por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[320px] w-full">
              <PieChart>
                <Pie
                  data={inventoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  labelLine={false}
                >
                  {inventoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} className="flex-wrap" />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
