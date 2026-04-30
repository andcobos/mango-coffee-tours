import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import SearchBar from '@/components/admin/SearchBar'

function formatDate(date: Date | null | undefined) {
  if (!date) return '—'
  return date.toLocaleDateString('es-CR', { day: '2-digit', month: 'long', year: 'numeric' })
}

export default async function ClientesPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>
}) {
  const { q } = (await searchParams) ?? {}

  const clientes = await prisma.clientes.findMany({
    orderBy: { fecha_creacion: 'desc' },
    include: { _count: { select: { cotizaciones: true } } },
    where: q
      ? {
          OR: [
            { nombre: { contains: q, mode: 'insensitive' } },
            { correo: { contains: q, mode: 'insensitive' } },
          ],
        }
      : undefined,
  })

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Directorio de Clientes</h1>
        <p className="text-sm text-zinc-400 mt-1">
          {clientes.length} {clientes.length === 1 ? 'cliente registrado' : 'clientes registrados'}
        </p>
      </div>

      <div className="mb-4">
        <SearchBar placeholder="Buscar cliente por nombre o correo..." />
      </div>

      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        {clientes.length === 0 ? (
          <div className="py-16 text-center text-zinc-400 text-sm">
            Aún no hay clientes registrados.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                  Nombre
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                  Correo Electrónico
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                  Fecha de Registro
                </th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                  Cotizaciones
                </th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {clientes.map((cliente) => {
                const total = cliente._count.cotizaciones
                return (
                  <tr key={cliente.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-zinc-800">
                      {cliente.nombre}
                    </td>
                    <td className="px-6 py-4 text-zinc-500">
                      {cliente.correo}
                    </td>
                    <td className="px-6 py-4 text-zinc-500">
                      {formatDate(cliente.fecha_creacion ?? null)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {total > 0 ? (
                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#004b23]/10 text-[#004b23]">
                          {total}
                        </span>
                      ) : (
                        <span className="text-zinc-300">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/clientes/${cliente.id}`}
                        className="text-xs font-semibold text-[#004b23] hover:text-[#f77f00] transition-colors"
                      >
                        Ver Perfil →
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
