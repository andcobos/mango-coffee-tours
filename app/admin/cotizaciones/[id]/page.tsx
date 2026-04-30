import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import EstadoButtons from '@/components/admin/cotizaciones/EstadoButtons'
import DeleteButton from '@/components/admin/DeleteButton'
import { eliminarCotizacion } from '@/app/actions/cotizaciones'

function formatDate(date: Date | null) {
  if (!date) return '—'
  return date.toLocaleDateString('es-CR', { day: '2-digit', month: 'long', year: 'numeric' })
}

function formatCurrency(value: unknown) {
  const num = Number(value)
  return `$${num.toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function Campo({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-0.5">{label}</dt>
      <dd className="text-sm font-semibold text-zinc-800">{value}</dd>
    </div>
  )
}

export default async function CotizacionDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const cotizacion = await prisma.cotizaciones.findUnique({ where: { id } })

  if (!cotizacion) notFound()

  const detalles = Array.isArray(cotizacion.detalles)
    ? (cotizacion.detalles as { nombre: string; precio: number }[])
    : []

  const margenPct = (Number(cotizacion.margen_aplicado) * 100).toFixed(2)

  return (
    <div className="p-8 max-w-4xl">
      {/* Back */}
      <Link
        href="/admin/cotizaciones"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 transition-colors mb-6"
      >
        ← Volver al Dashboard
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">{cotizacion.cliente_nombre}</h1>
          <p className="text-zinc-400 font-mono text-sm mt-0.5">
            {cotizacion.codigo_referencia
              ? `#${cotizacion.codigo_referencia}`
              : `#${cotizacion.id.substring(0, 6)}`}
            {' · '}{cotizacion.id}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <EstadoButtons
            cotizacionId={cotizacion.id}
            estadoActual={cotizacion.estado ?? 'GENERADA'}
          />
          <DeleteButton
            action={eliminarCotizacion.bind(null, cotizacion.id)}
            confirmMessage="¿Estás seguro de que deseas eliminar esta cotización? Esta acción no se puede deshacer."
          />
        </div>
      </div>

      <div className="space-y-6">
        {/* Datos del cliente */}
        <section className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm">
          <h2 className="text-sm font-bold text-[#004b23] uppercase tracking-wide mb-4">
            Información del Cliente
          </h2>
          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-5">
            <Campo label="Nombre" value={cotizacion.cliente_nombre} />
            <Campo label="Correo" value={cotizacion.cliente_email} />
            <Campo label="Pasajeros" value={`${cotizacion.pax} pax`} />
            <Campo label="Fecha Inicio" value={formatDate(cotizacion.fecha_inicio)} />
            <Campo label="Fecha Fin" value={formatDate(cotizacion.fecha_fin)} />
            <Campo label="Idioma" value={cotizacion.idioma_preferido ?? 'ES'} />
          </dl>
        </section>

        {/* Fechas administrativas */}
        <section className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm">
          <h2 className="text-sm font-bold text-[#004b23] uppercase tracking-wide mb-4">
            Información Administrativa
          </h2>
          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-5">
            <Campo label="Creada el" value={formatDate(cotizacion.fecha_creacion ?? null)} />
            <Campo label="Vence el" value={formatDate(cotizacion.fecha_vencimiento)} />
            <Campo label="Tipo" value={cotizacion.es_paquete ? 'Paquete' : 'A la Medida'} />
            <Campo label="Estado" value={cotizacion.estado ?? 'GENERADA'} />
          </dl>
          {cotizacion.notas_cliente && (
            <div className="mt-4 pt-4 border-t border-zinc-50">
              <dt className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">Notas del Cliente</dt>
              <dd className="text-sm text-zinc-600 whitespace-pre-line">{cotizacion.notas_cliente}</dd>
            </div>
          )}
        </section>

        {/* Desglose financiero */}
        <section className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm">
          <h2 className="text-sm font-bold text-[#004b23] uppercase tracking-wide mb-4">
            Desglose Financiero
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm py-2 border-b border-zinc-50">
              <span className="text-zinc-500">Costo Operativo</span>
              <span className="font-medium text-zinc-800">{formatCurrency(cotizacion.subtotal_costo)}</span>
            </div>
            <div className="flex justify-between text-sm py-2 border-b border-zinc-50">
              <span className="text-zinc-500">Margen Aplicado</span>
              <span className="font-medium text-zinc-800">{margenPct}%</span>
            </div>
            <div className="flex justify-between text-sm py-2 border-b border-zinc-50">
              <span className="text-zinc-500">Subtotal Venta</span>
              <span className="font-medium text-zinc-800">{formatCurrency(cotizacion.subtotal_venta)}</span>
            </div>
            <div className="flex justify-between text-sm py-2 border-b border-zinc-50">
              <span className="text-zinc-500">IVA (13%)</span>
              <span className="font-medium text-zinc-800">{formatCurrency(cotizacion.iva_total)}</span>
            </div>
            <div className="flex justify-between text-base py-3 font-bold">
              <span className="text-zinc-800">Gran Total</span>
              <span className="text-[#f77f00] text-lg">{formatCurrency(cotizacion.gran_total)}</span>
            </div>
          </div>
        </section>

        {/* Servicios incluidos */}
        {detalles.length > 0 && (
          <section className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm">
            <h2 className="text-sm font-bold text-[#004b23] uppercase tracking-wide mb-4">
              Servicios Incluidos
            </h2>
            <div className="space-y-1">
              {detalles.map((item, i) => (
                <div
                  key={i}
                  className={`flex justify-between items-center py-2.5 px-3 rounded-lg text-sm ${
                    i % 2 === 0 ? 'bg-zinc-50' : 'bg-white'
                  }`}
                >
                  <span className="text-zinc-700">{item.nombre}</span>
                  <span className="font-semibold text-zinc-800 tabular-nums">
                    {formatCurrency(item.precio)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
