import { prisma } from '@/lib/prisma'

type EstadoItem = { estado: string; count: number }

async function getDashboardData(): Promise<{ total: number; granTotalSum: number; byEstado: EstadoItem[] }> {
  const [total, aggregate, byEstado] = await Promise.all([
    prisma.cotizaciones.count(),
    prisma.cotizaciones.aggregate({ _sum: { gran_total: true } }),
    prisma.cotizaciones.groupBy({ by: ['estado'], _count: { id: true } }),
  ])

  return {
    total,
    granTotalSum: Number(aggregate._sum.gran_total ?? 0),
    byEstado: byEstado.map((g: (typeof byEstado)[number]): EstadoItem => ({ estado: g.estado ?? 'SIN ESTADO', count: g._count.id })),
  }
}

function MetricCard({
  title,
  value,
  sub,
  accent,
}: {
  title: string
  value: string
  sub?: string
  accent?: boolean
}) {
  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
      <p className="text-sm font-medium text-zinc-500">{title}</p>
      <p className={`text-3xl font-bold mt-2 ${accent ? 'text-[#f77f00]' : 'text-zinc-900'}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-zinc-400 mt-1">{sub}</p>}
    </div>
  )
}

export default async function AdminDashboard() {
  const { total, granTotalSum, byEstado } = await getDashboardData()

  const estadoColors: Record<string, string> = {
    GENERADA: 'bg-blue-100 text-blue-700',
    ENVIADA: 'bg-yellow-100 text-yellow-700',
    ACEPTADA: 'bg-emerald-100 text-emerald-700',
    RECHAZADA: 'bg-red-100 text-red-700',
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>
        <p className="text-zinc-500 text-sm mt-1">Métricas de conversión en tiempo real.</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        <MetricCard
          title="Total de Cotizaciones"
          value={total.toLocaleString('es-CR')}
          sub="Todas las cotizaciones generadas"
        />
        <MetricCard
          title="Ingresos Proyectados"
          value={`$${granTotalSum.toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          sub="Suma de gran total (USD)"
          accent
        />
        <MetricCard
          title="Estados registrados"
          value={byEstado.length.toString()}
          sub="Tipos de estado únicos"
        />
      </div>

      {/* Estado breakdown */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm">
        <div className="px-6 py-4 border-b border-zinc-100">
          <h2 className="text-base font-semibold text-zinc-800">Cotizaciones por Estado</h2>
        </div>
        {byEstado.length === 0 ? (
          <p className="px-6 py-8 text-sm text-zinc-400 text-center">
            No hay cotizaciones registradas aún.
          </p>
        ) : (
          <div className="divide-y divide-zinc-100">
            {byEstado.map(({ estado, count }: EstadoItem) => (
              <div key={estado} className="flex items-center justify-between px-6 py-4">
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    estadoColors[estado] ?? 'bg-zinc-100 text-zinc-600'
                  }`}
                >
                  {estado}
                </span>
                <span className="text-sm font-semibold text-zinc-700">
                  {count} {count === 1 ? 'cotización' : 'cotizaciones'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
