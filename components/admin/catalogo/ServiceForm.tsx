'use client'

import { useState } from 'react'
import { useActionState } from 'react'
import { crearServicio, actualizarServicio } from '@/app/actions/catalogo'
import Link from 'next/link'

const TIPOS = ['DESTINO', 'SEGURO', 'ALOJAMIENTO', 'PAQUETE', 'OTRO', 'EXTRA']
const TIPOS_VEHICULO = ['Sedan', 'SUV', 'Minivan', 'Microbus']

interface ServiceData {
  id: string
  tipo: string
  nombre_es: string
  nombre_en: string
  costo_operativo: number
  rango_edad: string | null
  empresa: string | null
  tipo_vehiculo: string | null
  capacidad_pasajeros: number | null
  costo_extra_nombre: string | null
  costo_extra_valor: number | null
  descripcion: string | null
  nivel_esfuerzo: string | null
  imagen_url: string | null
  link_google_maps: string | null
  link_punto_encuentro: string | null
}

interface Props {
  service?: ServiceData
}

const INPUT_CLASS = 'w-full px-3 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-[#004b23] focus:border-transparent outline-none transition-all text-black placeholder:text-gray-400'

function costoLabel(tipo: string): string {
  if (tipo === 'TRANSPORTE') return 'Costo por Día (USD)'
  if (tipo === 'PAQUETE') return 'Costo por Persona (USD)'
  if (tipo === 'EXTRA') return 'Tarifa Plana (USD)'
  return 'Costo Operativo (USD)'
}

export default function ServiceForm({ service }: Props) {
  const isEditing = !!service
  const action = isEditing ? actualizarServicio : crearServicio

  const [state, formAction, isPending] = useActionState(action, undefined)
  const [tipo, setTipo] = useState(service?.tipo ?? '')

  const isTransporte = tipo === 'TRANSPORTE'
  const isPaquete = tipo === 'PAQUETE'

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
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
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
            className={INPUT_CLASS}
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
            className={INPUT_CLASS}
          />
        </div>
      </div>

      {/* Descripción (solo PAQUETE) */}
      {isPaquete && (
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">
            Descripción <span className="text-zinc-400 text-xs">(opcional — puedes usar guiones o bullets)</span>
          </label>
          <textarea
            name="descripcion"
            defaultValue={service?.descripcion ?? ''}
            rows={4}
            placeholder={"- Traslado aeropuerto\n- Tour volcán 1 día\n- Seguro incluido"}
            className={`${INPUT_CLASS} resize-y`}
          />
        </div>
      )}

      {/* Campos exclusivos de PAQUETE */}
      {isPaquete && (
        <div className="border border-zinc-200 rounded-xl p-4 space-y-4 bg-zinc-50">
          <p className="text-sm font-semibold text-zinc-700">Detalles del Paquete</p>

          {/* Nivel de esfuerzo */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Nivel de Esfuerzo <span className="text-zinc-400 text-xs">(opcional)</span>
            </label>
            <select
              name="nivel_esfuerzo"
              defaultValue={service?.nivel_esfuerzo ?? ''}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-[#004b23] focus:border-transparent outline-none transition-all bg-white text-black"
            >
              <option value="">Sin especificar</option>
              <option value="BAJO">BAJO</option>
              <option value="INTERMEDIO">INTERMEDIO</option>
              <option value="ALTO">ALTO</option>
            </select>
          </div>

          {/* Imagen URL */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              URL de Imagen <span className="text-zinc-400 text-xs">(opcional)</span>
            </label>
            <input
              name="imagen_url"
              type="text"
              defaultValue={service?.imagen_url ?? ''}
              placeholder="https://..."
              className={INPUT_CLASS}
            />
          </div>

          {/* Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Link Google Maps <span className="text-zinc-400 text-xs">(opcional)</span>
              </label>
              <input
                name="link_google_maps"
                type="text"
                defaultValue={service?.link_google_maps ?? ''}
                placeholder="https://maps.google.com/..."
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Link Punto de Encuentro <span className="text-zinc-400 text-xs">(opcional)</span>
              </label>
              <input
                name="link_punto_encuentro"
                type="text"
                defaultValue={service?.link_punto_encuentro ?? ''}
                placeholder="https://..."
                className={INPUT_CLASS}
              />
            </div>
          </div>
        </div>
      )}

      {/* Costo y Rango de Edad */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">
            {costoLabel(tipo)} <span className="text-red-500">*</span>
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
            className={INPUT_CLASS}
          />
        </div>
      </div>

      {/* Campos exclusivos de TRANSPORTE */}
      {isTransporte && (
        <div className="border border-zinc-200 rounded-xl p-4 space-y-4 bg-zinc-50">
          <p className="text-sm font-semibold text-zinc-700">Detalles del Transporte</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Empresa <span className="text-zinc-400 text-xs">(opcional)</span>
              </label>
              <input
                name="empresa"
                defaultValue={service?.empresa ?? ''}
                placeholder="Ej. Eagle Rent a Car"
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Tipo de Vehículo <span className="text-zinc-400 text-xs">(opcional)</span>
              </label>
              <select
                name="tipo_vehiculo"
                defaultValue={service?.tipo_vehiculo ?? ''}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-[#004b23] focus:border-transparent outline-none transition-all bg-white text-black"
              >
                <option value="">Sin especificar</option>
                {TIPOS_VEHICULO.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Capacidad de Pasajeros <span className="text-zinc-400 text-xs">(opcional)</span>
              </label>
              <input
                name="capacidad_pasajeros"
                type="number"
                min="1"
                defaultValue={service?.capacidad_pasajeros ?? ''}
                placeholder="Ej. 8"
                className={INPUT_CLASS}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Nombre del Costo Extra <span className="text-zinc-400 text-xs">(opcional)</span>
              </label>
              <input
                name="costo_extra_nombre"
                defaultValue={service?.costo_extra_nombre ?? ''}
                placeholder="Ej. Conductor bilingüe"
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Valor del Costo Extra (USD) <span className="text-zinc-400 text-xs">(opcional)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
                <input
                  name="costo_extra_valor"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={service?.costo_extra_valor ?? ''}
                  placeholder="0.00"
                  className="w-full pl-7 pr-3 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-[#004b23] focus:border-transparent outline-none transition-all text-black placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>
        </div>
      )}

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
