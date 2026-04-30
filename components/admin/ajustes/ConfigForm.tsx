'use client'

import { useActionState, useState, useEffect } from 'react'
import { actualizarConfiguracion } from '@/app/actions/configuracion'

interface Props {
  initialMargen: number
}

const initialState = { error: undefined, success: undefined }

export default function ConfigForm({ initialMargen }: Props) {
  const [state, formAction, isPending] = useActionState(actualizarConfiguracion, initialState)
  const [margen, setMargen] = useState(initialMargen)

  // Sincroniza cuando el Server Component re-renderiza con el nuevo valor desde la BD
  useEffect(() => {
    setMargen(initialMargen)
  }, [initialMargen])

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <label htmlFor="margen_ganancia" className="block text-sm font-medium text-zinc-700 mb-1">
          Margen Global de Ganancia (%)
        </label>
        <div className="flex items-center gap-3">
          <input
            id="margen_ganancia"
            name="margen_ganancia"
            type="number"
            min={0}
            max={100}
            step={0.01}
            value={margen}
            onChange={(e) => setMargen(Number(e.target.value))}
            required
            className="w-40 rounded-lg border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-[#004b23] focus:ring-1 focus:ring-[#004b23] outline-none"
          />
          <span className="text-zinc-500 text-sm">%</span>
        </div>
        <p className="mt-1.5 text-xs text-zinc-500">
          Este porcentaje se aplica sobre el costo operativo para calcular el precio de venta en todas las cotizaciones.
        </p>
      </div>

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          {state.error}
        </p>
      )}

      {state?.success && (
        <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2">
          Configuración guardada correctamente.
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center gap-2 rounded-lg bg-[#004b23] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#003a1b] disabled:opacity-60 transition-colors"
      >
        {isPending ? 'Guardando...' : 'Guardar Cambios'}
      </button>
    </form>
  )
}
