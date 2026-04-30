import { prisma } from '@/lib/prisma'
import ConfigForm from '@/components/admin/ajustes/ConfigForm'

export default async function AjustesPage() {
  const config = await prisma.configuracion.findFirst()
  const margenGlobal = config?.margen_ganancia ? Number(config.margen_ganancia) : 30

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Ajustes del Sistema</h1>
        <p className="text-zinc-500 text-sm mt-1">
          Gestiona la configuración global que afecta a todas las cotizaciones.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-zinc-800 mb-4">Precios y Márgenes</h2>
        <ConfigForm initialMargen={margenGlobal} />
      </div>
    </div>
  )
}
