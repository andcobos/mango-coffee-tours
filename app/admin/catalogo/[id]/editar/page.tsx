import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ServiceForm from '@/components/admin/catalogo/ServiceForm'
import OpcionesServicioManager from '@/components/admin/catalogo/OpcionesServicioManager'
import Link from 'next/link'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditarServicioPage({ params }: Props) {
  const { id } = await params

  const servicio = await prisma.catalogo_servicios.findUnique({
    where: { id },
    include: { opciones_servicio: { orderBy: { creado_en: 'asc' } } },
  })

  if (!servicio) {
    notFound()
  }

  const serviceData = {
    id: servicio.id,
    tipo: servicio.tipo,
    nombre_es: servicio.nombre_es,
    nombre_en: servicio.nombre_en,
    costo_operativo: Number(servicio.costo_operativo),
    rango_edad: servicio.rango_edad ?? null,
    empresa: servicio.empresa ?? null,
    tipo_vehiculo: servicio.tipo_vehiculo ?? null,
    capacidad_pasajeros: servicio.capacidad_pasajeros ?? null,
    costo_extra_nombre: servicio.costo_extra_nombre ?? null,
    costo_extra_valor: servicio.costo_extra_valor != null ? Number(servicio.costo_extra_valor) : null,
    descripcion: servicio.descripcion ?? null,
    nivel_esfuerzo: servicio.nivel_esfuerzo ?? null,
    imagen_url: servicio.imagen_url ?? null,
    link_google_maps: servicio.link_google_maps ?? null,
    link_punto_encuentro: servicio.link_punto_encuentro ?? null,
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link
          href="/admin/catalogo"
          className="text-sm text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          ← Volver al Catálogo
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900 mt-2">Editar Servicio</h1>
        <p className="text-zinc-500 text-sm mt-1">{servicio.nombre_es}</p>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-8">
        <ServiceForm service={serviceData} />
        <OpcionesServicioManager
          servicioId={servicio.id}
          opciones={servicio.opciones_servicio.map((o) => ({
            id: o.id,
            nombre: o.nombre,
            descripcion: o.descripcion,
            link_google_maps: o.link_google_maps,
            precio_por_persona: Number(o.precio_por_persona ?? 0),
          }))}
        />
      </div>
    </div>
  )
}
