'use client'

import { useActionState } from 'react'
import { crearServicio, actualizarServicio } from '@/app/actions/catalogo'
import Link from 'next/link'

const TIPOS = ['DESTINO', 'ENTRADA', 'SEGURO', 'TRANSPORTE', 'ALOJAMIENTO', 'OTRO']

interface ServiceData {
  id: string
  tipo: string
  nombre_es: string
  nombre_en: string
  costo_operativo: number
  rango_edad: string | null
}

interface Props {
  service?: ServiceData
}

export default function ServiceForm({ service }: Props) {
  const isEditing = !!service
  const action = isEditing ? actualizarServicio : crearServicio

  const [state, formAction, isPending] = useActionState(action, undefined)

  return (
    <form action={formAction} className="space-y-5 max-w-2xl">
      {isEditing && <input type="hidden" name="id" value={service.id} />}

      {state?.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {state.error}
        </div>
      )}

      {/* Tipo */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">
          Tipo de Servicio <span className="text-red-500">*</span>
        </label>
        <select
          name="tipo"
          defaultValue={service?.tipo ?? ''}
          required
          className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-[#004b23] focus:border-transparent outline-none transition-all bg-white text-black"
        >
          <option value="" disabled>Selecciona un tipo...</option>
          {TIPOS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Nombres */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">
            Nombre (Español) <span className="text-red-500">*</span>
          </label>
          <input
            name="nombre_es"
            defaultValue={service?.nombre_es ?? ''}
            required
            placeholder="Ej. Tour Volcán Arenal"
            className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-[#004b23] focus:border-transparent outline-none transition-all text-black placeholder:text-gray-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">
            Nombre (English) <span className="text-red-500">*</span>
          </label>
          <input
            name="nombre_en"
            defaultValue={service?.nombre_en ?? ''}
            required
            placeholder="Eg. Arenal Volcano Tour"
            className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-[#004b23] focus:border-transparent outline-none transition-all text-black placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Costo y Rango de Edad */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">
            Costo Operativo (USD) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
            <input
              name="costo_operativo"
              type="number"
              step="0.01"
              min="0"
              defaultValue={service?.costo_operativo ?? ''}
              required
              placeholder="0.00"
              className="w-full pl-7 pr-3 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-[#004b23] focus:border-transparent outline-none transition-all text-black placeholder:text-gray-400"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">
            Rango de Edad <span className="text-zinc-400 text-xs">(opcional)</span>
          </label>
          <input
            name="rango_edad"
            defaultValue={service?.rango_edad ?? ''}
            placeholder="Ej. 0-65, 65+"
            className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-[#004b23] focus:border-transparent outline-none transition-all text-black placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="bg-[#004b23] hover:bg-emerald-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Servicio'}
        </button>
        <Link
          href="/admin/catalogo"
          className="px-6 py-2.5 rounded-lg text-sm font-medium text-zinc-600 hover:bg-zinc-100 transition-colors"
        >
          Cancelar
        </Link>
      </div>
    </form>
  )
}
