'use client'

import { useState, useTransition } from 'react'
import { actualizarNotasCliente } from '@/app/actions/clientes'

interface NotasEditorProps {
  clienteId: string
  notasIniciales: string | null
}

export default function NotasEditor({ clienteId, notasIniciales }: NotasEditorProps) {
  const [notas, setNotas] = useState(notasIniciales ?? '')
  const [guardado, setGuardado] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleGuardar() {
    startTransition(async () => {
      await actualizarNotasCliente(clienteId, notas)
      setGuardado(true)
      setTimeout(() => setGuardado(false), 2500)
    })
  }

  return (
    <div className="space-y-3">
      <textarea
        value={notas}
        onChange={(e) => setNotas(e.target.value)}
        placeholder="Escribe notas internas sobre este cliente: preferencias, historial de comunicación, detalles especiales..."
        rows={8}
        className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#004b23]/30 focus:border-[#004b23] resize-none transition"
      />
      <div className="flex items-center gap-3">
        <button
          onClick={handleGuardar}
          disabled={isPending}
          className="px-4 py-2 rounded-lg bg-[#004b23] text-white text-sm font-semibold hover:bg-[#003518] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? 'Guardando...' : 'Guardar Notas'}
        </button>
        {guardado && (
          <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd" />
            </svg>
            Notas guardadas
          </span>
        )}
      </div>
    </div>
  )
}
