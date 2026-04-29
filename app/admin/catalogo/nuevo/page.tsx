import ServiceForm from '@/components/admin/catalogo/ServiceForm'
import Link from 'next/link'

export default function NuevoServicioPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <Link
          href="/admin/catalogo"
          className="text-sm text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          ← Volver al Catálogo
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900 mt-2">Nuevo Servicio</h1>
        <p className="text-zinc-500 text-sm mt-1">Agrega un nuevo servicio al catálogo.</p>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-8">
        <ServiceForm />
      </div>
    </div>
  )
}
