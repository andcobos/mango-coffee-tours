import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import NotasEditor from '@/components/admin/clientes/NotasEditor'
import DeleteButton from '@/components/admin/DeleteButton'
import { eliminarCliente } from '@/app/actions/clientes'

function formatDate(date: Date | null | undefined) {
  if (!date) return '—'
  return date.toLocaleDateString('es-CR', { day: '2-digit', month: 'long', year: 'numeric' })
}

function formatCurrency(value: unknown) {
  const num = Number(value)
  return `$${num.toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const ESTADO_STYLES: Record<string, string> = {
  GENERADA: 'bg-blue-50 text-blue-700 border-blue-200',
  CONFIRMADA: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  VENCIDA: 'bg-red-50 text-red-600 border-red-200',
}

async function getCliente(id: string) {
  return prisma.clientes.findUnique({
    where: { id },
    include: {
      cotizaciones: {
        orderBy: { fecha_creacion: 'desc' },
      },
    },
  })
}

type Cotizacion = NonNullable<Awaited<ReturnType<typeof getCliente>>>['cotizaciones'][number]

export default async function ClientePerfilPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const cliente = await getCliente(id)

  if (!cliente) notFound()

  return (
    <div className="p-8 max-w-6xl">
      {/* Back */}
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 transition-colors mb-6"
      >
        ← Volver al Dashboard
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">{cliente.nombre}</h1>
          <p className="text-zinc-400 text-sm mt-1">{cliente.correo}</p>
        </div>
        <DeleteButton
          action={eliminarCliente.bind(null, cliente.id)}
          confirmMessage={`¿Estás seguro de que deseas eliminar a ${cliente.nombre}? Se perderá su perfil y el vínculo con sus cotizaciones.`}
        />
      </div>

      {/* Grid 2 columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna izquierda: Notas */}
        <div className="space-y-6">
          <section className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm">
            <h2 className="text-sm font-bold text-[#004b23] uppercase tracking-wide mb-4">
              Información de Contacto
            </h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-0.5">Nombre</dt>
                <dd className="text-sm font-semibold text-zinc-800">{cliente.nombre}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-0.5">Correo</dt>
                <dd className="text-sm font-semibold text-zinc-800">{cliente.correo}</dd>
              </div>
              {cliente.telefono && (
                <div>
                  <dt className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-0.5">Teléfono</dt>
                  <dd className="text-sm font-semibold text-zinc-800">{cliente.telefono}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-0.5">Cliente desde</dt>
                <dd className="text-sm font-semibold text-zinc-800">
                  {formatDate(cliente.fecha_creacion ?? null)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-0.5">Cotizaciones</dt>
                <dd className="text-sm font-semibold text-zinc-800">{cliente.cotizaciones.length}</dd>
              </div>
            </dl>
          </section>

          <section className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm">
            <h2 className="text-sm font-bold text-[#004b23] uppercase tracking-wide mb-4">
              Notas Internas
            </h2>
            <NotasEditor clienteId={cliente.id} notasIniciales={cliente.notas ?? null} />
          </section>
        </div>

        {/* Columna derecha: Historial de cotizaciones */}
        <div>
          <section className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm h-full">
            <h2 className="text-sm font-bold text-[#004b23] uppercase tracking-wide mb-4">
              Historial de Cotizaciones
            </h2>

            {cliente.cotizaciones.length === 0 ? (
              <p className="text-sm text-zinc-400 text-center py-8">
                Este cliente aún no tiene cotizaciones.
              </p>
            ) : (
              <div className="space-y-3">
                {cliente.cotizaciones.map((cot: Cotizacion) => {
                  const estado = cot.estado ?? 'GENERADA'
                  const estadoStyle = ESTADO_STYLES[estado] ?? 'bg-zinc-50 text-zinc-600 border-zinc-200'
                  const ref = cot.codigo_referencia
                    ? `#${cot.codigo_referencia}`
                    : `#${cot.id.substring(0, 6).toUpperCase()}`

                  return (
                    <Link
                      key={cot.id}
                      href={`/admin/cotizaciones/${cot.id}`}
                      className="block rounded-xl border border-zinc-100 p-4 hover:border-zinc-300 hover:shadow-sm transition-all group"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <span className="font-mono text-sm font-bold text-zinc-700 group-hover:text-[#004b23] transition-colors">
                          {ref}
                        </span>
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${estadoStyle}`}
                        >
                          {estado}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-400">
                          {formatDate(cot.fecha_inicio)} — {formatDate(cot.fecha_fin)}
                        </span>
                        <span className="text-sm font-bold text-[#f77f00] tabular-nums">
                          {formatCurrency(cot.gran_total)}
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
