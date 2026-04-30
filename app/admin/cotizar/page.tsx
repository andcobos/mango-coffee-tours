import QuoteForm from '@/components/QuoteForm'
import { prisma } from '@/lib/prisma'

export default async function AdminCotizarPage() {
  const raw = await prisma.catalogo_servicios.findMany({
    where: { activo: true },
    orderBy: { nombre_es: 'asc' },
  })

  const servicios = raw.map((s) => ({
    id: s.id,
    tipo: s.tipo,
    nombre_es: s.nombre_es,
    nombre_en: s.nombre_en,
    costo_operativo: Number(s.costo_operativo),
    rango_edad: s.rango_edad ?? null,
    empresa: s.empresa ?? null,
    tipo_vehiculo: s.tipo_vehiculo ?? null,
    capacidad_pasajeros: s.capacidad_pasajeros ?? null,
    costo_extra_nombre: s.costo_extra_nombre ?? null,
    costo_extra_valor: s.costo_extra_valor != null ? Number(s.costo_extra_valor) : null,
    descripcion: s.descripcion ?? null,
  }))

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Generar Cotización</h1>
        <p className="text-zinc-500 text-sm mt-1">
          Genera una cotización exprés para un cliente por teléfono o en persona.
        </p>
      </div>
      <QuoteForm servicios={servicios} isAdmin={true} />
    </div>
  )
}
