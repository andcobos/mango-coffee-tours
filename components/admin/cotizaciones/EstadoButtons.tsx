'use client'

import { useTransition } from 'react'
import { actualizarEstadoCotizacion } from '@/app/actions/cotizaciones'

type Estado = 'GENERADA' | 'CONFIRMADA' | 'VENCIDA'

const ESTADOS: { value: Estado; label: string; activeClass: string; inactiveClass: string }[] = [
  {
    value: 'GENERADA',
    label: 'Generada',
    activeClass: 'bg-blue-600 text-white shadow-sm',
    inactiveClass: 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50',
  },
  {
    value: 'CONFIRMADA',
    label: 'Confirmada',
    activeClass: 'bg-green-600 text-white shadow-sm',
    inactiveClass: 'bg-white text-green-700 border border-green-200 hover:bg-green-50',
  },
  {
    value: 'VENCIDA',
    label: 'Vencida',
    activeClass: 'bg-zinc-500 text-white shadow-sm',
    inactiveClass: 'bg-white text-zinc-500 border border-zinc-200 hover:bg-zinc-50',
  },
]

interface Props {
  cotizacionId: string
  estadoActual: string
}

export default function EstadoButtons({ cotizacionId, estadoActual }: Props) {
  const [isPending, startTransition] = useTransition()

  function handleCambio(nuevoEstado: Estado) {
    if (nuevoEstado === estadoActual || isPending) return
    startTransition(() => {
      actualizarEstadoCotizacion(cotizacionId, nuevoEstado)
    })
  }

  return (
    <div className="flex items-center gap-2">
      {isPending && (
        <span className="text-xs text-zinc-400 mr-1">Actualizando...</span>
      )}
      {ESTADOS.map(({ value, label, activeClass, inactiveClass }) => {
        const isActive = estadoActual === value
        return (
          <button
            key={value}
            type="button"
            disabled={isActive || isPending}
            onClick={() => handleCambio(value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isActive ? activeClass : inactiveClass
            } ${isPending ? 'opacity-50 cursor-not-allowed' : ''} ${
              !isActive && !isPending ? 'cursor-pointer' : ''
            }`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
