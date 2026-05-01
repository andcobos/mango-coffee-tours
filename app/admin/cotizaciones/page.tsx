import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import SearchBar from '@/components/admin/SearchBar'

const ESTADO_STYLES: Record<string, string> = {
  GENERADA: 'bg-blue-100 text-blue-700',
  ENVIADA: 'bg-yellow-100 text-yellow-700',
  ACEPTADA: 'bg-green-100 text-green-700',
  RECHAZADA: 'bg-red-100 text-red-700',
  VENCIDA: 'bg-zinc-100 text-zinc-500',
}

function formatDate(date: Date | null) {
  if (!date) return '—'
  return date.toLocaleDateString('es-CR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatCurrency(value: unknown) {
  const num = Number(value)
  return `$${num.toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default async function CotizacionesDashboard({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>
}) {
  const { q } = (await searchParams) ?? {}

  const cotizaciones = await prisma.cotizaciones.findMany({
    orderBy: { fecha_creacion: 'desc' },
    where: q
      ? {
          OR: [
            { codigo_referencia: { contains: q, mode: 'insensitive' } },
            { cliente_nombre: { contains: q, mode: 'insensitive' } },
          ],
        }
      : undefined,
  })

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Cotizaciones</h1>
        <p className="text-zinc-500 text-sm mt-1">
          Historial de propuestas generadas para clientes.
        </p>
      </div>

      <div className="mb-4">
        <SearchBar placeholder="Buscar por código, nombre o cliente..." />
      </div>

      {cotizaciones.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-100 p-12 text-center">
          <p className="text-zinc-400 text-sm">Aún no hay cotizaciones registradas.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50 text-zinc-500 text-xs uppercase tracking-wide">
                <th className="px-5 py-3 text-left font-medium">Ref / Cliente</th>
                <th className="px-5 py-3 text-left font-medium">Correo</th>
                <th className="px-5 py-3 text-left font-medium">Fecha de Viaje</th>
                <th className="px-5 py-3 text-left font-medium">Pax</th>
                <th className="px-5 py-3 text-right font-medium">Total</th>
                <th className="px-5 py-3 text-left font-medium">Estado</th>
                <th className="px-5 py-3 text-right font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {cotizaciones.map((c: (typeof cotizaciones)[number]) => (
                <tr key={c.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-zinc-800">{c.cliente_nombre}</div>
                    <div className="text-xs text-zinc-400 font-mono">
                      {c.codigo_referencia ? `#${c.codigo_referencia}` : `#${c.id.substring(0, 6)}`}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-zinc-600">{c.cliente_email}</td>
                  <td className="px-5 py-4 text-zinc-600">
                    {formatDate(c.fecha_inicio)} → {formatDate(c.fecha_fin)}
                  </td>
                  <td className="px-5 py-4 text-zinc-600">{c.pax}</td>
                  <td className="px-5 py-4 text-right font-semibold text-zinc-800">
                    {formatCurrency(c.gran_total)}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                        ESTADO_STYLES[c.estado ?? 'GENERADA'] ?? ESTADO_STYLES.GENERADA
                      }`}
                    >
                      {c.estado ?? 'GENERADA'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/admin/cotizaciones/${c.id}`}
                      className="text-xs font-medium text-[#004b23] hover:underline"
                    >
                      Ver Detalles →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
