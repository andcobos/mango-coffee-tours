import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { toggleActivoServicio } from '@/app/actions/catalogo'
import EliminarServicioBtn from '@/components/admin/catalogo/EliminarServicioBtn'

async function getServicios() {
  return prisma.catalogo_servicios.findMany({
    orderBy: [{ tipo: 'asc' }, { nombre_es: 'asc' }],
  })
}

export default async function CatalogoPage() {
  const servicios = await getServicios()

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Catálogo de Servicios</h1>
          <p className="text-zinc-500 text-sm mt-1">{servicios.length} servicios registrados.</p>
        </div>
        <Link
          href="/admin/catalogo/nuevo"
          className="bg-[#004b23] hover:bg-emerald-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          + Nuevo Servicio
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        {servicios.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-zinc-400 text-sm">No hay servicios en el catálogo.</p>
            <Link
              href="/admin/catalogo/nuevo"
              className="mt-4 inline-block text-[#004b23] font-medium text-sm hover:underline"
            >
              Crear el primero
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50">
                  <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Tipo</th>
                  <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Nombre (ES)</th>
                  <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Nombre (EN)</th>
                  <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Costo Op.</th>
                  <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Estado</th>
                  <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {servicios.map((s) => (
                  <tr key={s.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="bg-emerald-100 text-[#004b23] text-xs font-bold px-2 py-1 rounded">
                        {s.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-800 font-medium">{s.nombre_es}</td>
                    <td className="px-6 py-4 text-sm text-zinc-500">{s.nombre_en}</td>
                    <td className="px-6 py-4 text-sm text-zinc-700 font-mono">
                      ${Number(s.costo_operativo).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      {s.activo ? (
                        <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          Activo
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-zinc-400 text-xs font-medium">
                          <span className="w-2 h-2 rounded-full bg-zinc-300" />
                          Inactivo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/admin/catalogo/${s.id}/editar`}
                          className="text-[#f77f00] hover:underline text-sm font-medium"
                        >
                          Editar
                        </Link>
                        <form action={toggleActivoServicio}>
                          <input type="hidden" name="id" value={s.id} />
                          <input type="hidden" name="activo" value={String(s.activo)} />
                          <button
                            type="submit"
                            className="text-zinc-400 hover:text-zinc-600 text-sm transition-colors"
                          >
                            {s.activo ? 'Desactivar' : 'Activar'}
                          </button>
                        </form>
                        <EliminarServicioBtn id={s.id} nombre={s.nombre_es} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
