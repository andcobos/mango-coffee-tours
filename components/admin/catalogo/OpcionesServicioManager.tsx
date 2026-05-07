'use client'

import { useState, useTransition } from 'react'
import {
  agregarOpcionServicio,
  actualizarOpcionServicio,
  eliminarOpcionServicio,
} from '@/app/actions/catalogo'

interface OpcionData {
  id: string
  nombre: string
  descripcion: string | null
  link_google_maps: string | null
  precio_por_persona: number
}

interface Props {
  servicioId: string
  opciones: OpcionData[]
}

const INPUT = 'w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-[#004b23] focus:border-transparent outline-none'

export default function OpcionesServicioManager({ servicioId, opciones }: Props) {
  const [isPending, startTransition] = useTransition()
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleAgregar = (fd: FormData) => {
    startTransition(async () => {
      await agregarOpcionServicio(servicioId, fd)
      setShowAdd(false)
    })
  }

  const handleActualizar = (opcionId: string) => (fd: FormData) => {
    startTransition(async () => {
      await actualizarOpcionServicio(opcionId, servicioId, fd)
      setEditingId(null)
    })
  }

  const handleEliminar = (opcionId: string) => {
    if (!window.confirm('¿Eliminar esta opción? Esta acción no se puede deshacer.')) return
    startTransition(() => eliminarOpcionServicio(opcionId, servicioId))
  }

  return (
    <div className="border-t border-zinc-200 pt-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-zinc-800">Opciones / Lugares</h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Lugares, comidas o actividades extra disponibles para este servicio
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setShowAdd(!showAdd); setEditingId(null) }}
          className="bg-[#f77f00] hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Agregar Opción
        </button>
      </div>

      {/* Formulario para nueva opción */}
      {showAdd && (
        <form action={handleAgregar} className="mb-4 p-4 border border-[#f77f00]/30 rounded-lg bg-orange-50/40 space-y-3">
          <p className="text-sm font-semibold text-zinc-700">Nueva Opción</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-600 mb-1">Nombre <span className="text-red-500">*</span></label>
              <input name="nombre" required className={INPUT} placeholder="Ej. Parque Nacional" />
            </div>
            <div>
              <label className="block text-xs text-zinc-600 mb-1">
                Precio por persona ($) <span className="text-zinc-400">(0 = incluido)</span>
              </label>
              <input name="precio_por_persona" type="number" step="0.01" min="0" defaultValue="0" className={INPUT} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-zinc-600 mb-1">Descripción</label>
              <input name="descripcion" className={INPUT} placeholder="Descripción breve" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-zinc-600 mb-1">Link Google Maps <span className="text-zinc-400">(opcional)</span></label>
              <input name="link_google_maps" type="url" className={INPUT} placeholder="https://maps.google.com/..." />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={isPending} className="bg-[#004b23] text-white px-4 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50">
              Agregar
            </button>
            <button type="button" onClick={() => setShowAdd(false)} className="text-zinc-500 hover:text-zinc-700 px-4 py-1.5 rounded-lg text-sm">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Lista de opciones existentes */}
      {opciones.length === 0 && !showAdd ? (
        <p className="text-sm text-zinc-400 italic">No hay opciones aún.</p>
      ) : (
        <div className="space-y-3">
          {opciones.map((opt) =>
            editingId === opt.id ? (
              <form key={opt.id} action={handleActualizar(opt.id)} className="p-4 border border-zinc-300 rounded-lg bg-zinc-50 space-y-3">
                <p className="text-sm font-semibold text-zinc-700">Editar Opción</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-zinc-600 mb-1">Nombre *</label>
                    <input name="nombre" defaultValue={opt.nombre} required className={INPUT} />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-600 mb-1">Precio por persona ($)</label>
                    <input name="precio_por_persona" type="number" step="0.01" min="0" defaultValue={opt.precio_por_persona} className={INPUT} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-zinc-600 mb-1">Descripción</label>
                    <input name="descripcion" defaultValue={opt.descripcion ?? ''} className={INPUT} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-zinc-600 mb-1">Link Google Maps</label>
                    <input name="link_google_maps" type="url" defaultValue={opt.link_google_maps ?? ''} className={INPUT} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={isPending} className="bg-[#004b23] text-white px-4 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50">Guardar</button>
                  <button type="button" onClick={() => setEditingId(null)} className="text-zinc-500 hover:text-zinc-700 px-4 py-1.5 rounded-lg text-sm">Cancelar</button>
                </div>
              </form>
            ) : (
              <div key={opt.id} className="p-4 border border-zinc-200 rounded-lg bg-white flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-zinc-800">{opt.nombre}</p>
                  {opt.descripcion && <p className="text-xs text-zinc-500 mt-0.5">{opt.descripcion}</p>}
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    {opt.precio_por_persona > 0 ? (
                      <span className="text-xs font-semibold text-emerald-700">${opt.precio_por_persona.toFixed(2)} / pax</span>
                    ) : (
                      <span className="text-xs text-zinc-400">Incluido (sin costo extra)</span>
                    )}
                    {opt.link_google_maps && (
                      <a href={opt.link_google_maps} target="_blank" rel="noopener noreferrer" className="text-xs text-[#004b23] hover:underline">
                        Ver en Maps
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button type="button" onClick={() => { setEditingId(opt.id); setShowAdd(false) }} className="text-[#f77f00] hover:underline text-sm font-medium">
                    Editar
                  </button>
                  <button type="button" onClick={() => handleEliminar(opt.id)} disabled={isPending} className="text-red-400 hover:text-red-600 text-sm disabled:opacity-50">
                    Eliminar
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  )
}
