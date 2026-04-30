'use client'

import { eliminarServicio } from '@/app/actions/catalogo'

export default function EliminarServicioBtn({ id, nombre }: { id: string; nombre: string }) {
  const action = eliminarServicio.bind(null, id)

  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(`¿Eliminar "${nombre}"? Esta acción no se puede deshacer.`)) {
          e.preventDefault()
        }
      }}
    >
      <button
        type="submit"
        className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
      >
        Eliminar
      </button>
    </form>
  )
}
