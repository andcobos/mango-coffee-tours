'use client'

import { useState } from 'react'

interface Servicio {
  id: number
  descripcion: string
  precio_operativo: number
  personas: number
  dias: number
}

function formatCurrency(value: number) {
  return `$${value.toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function CalculadoraPage() {
  const [margen, setMargen] = useState(30)
  const [servicios, setServicios] = useState<Servicio[]>([
    { id: Date.now(), descripcion: '', precio_operativo: 0, personas: 1, dias: 1 },
  ])

  function addServicio() {
    setServicios((prev) => [
      ...prev,
      { id: Date.now(), descripcion: '', precio_operativo: 0, personas: 1, dias: 1 },
    ])
  }

  function removeServicio(id: number) {
    setServicios((prev) => prev.filter((s) => s.id !== id))
  }

  function updateServicio(id: number, field: keyof Omit<Servicio, 'id'>, value: string | number) {
    setServicios((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    )
  }

  // Cálculos
  const costoTotalOperativo = servicios.reduce(
    (sum, s) => sum + s.precio_operativo * s.personas * s.dias,
    0
  )
  const subtotal = costoTotalOperativo / (1 - Math.min(margen, 99.99) / 100)
  const margenDolares = subtotal - costoTotalOperativo
  const iva = subtotal * 0.13
  const granTotal = subtotal + iva

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Calculadora de Rentabilidad</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Herramienta temporal - calculos rápidos
        </p>
      </div>

      {/* Margen */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 mb-6">
        <h2 className="text-sm font-bold text-[#004b23] uppercase tracking-wide mb-4">
          Parámetros Globales
        </h2>
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-zinc-700 whitespace-nowrap">
            Margen de Ganancia (%)
          </label>
          <input
            type="number"
            min={0}
            max={100}
            step={1}
            value={margen}
            onChange={(e) => setMargen(Number(e.target.value))}
            className="w-24 px-3 py-2 rounded-xl border border-zinc-200 bg-zinc-50 text-sm font-semibold text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#004b23]/25 focus:border-[#004b23] transition"
          />
          <span className="text-sm text-zinc-400">
            Fórmula: Costo Total / (1 - {margen}%)
          </span>
        </div>
      </div>

      {/* Tabla de servicios */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                  Descripción
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                  Precio Op. ($)
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                  Pax
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                  Días
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                  Subtotal Op.
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {servicios.map((s) => {
                const subtotalLinea = s.precio_operativo * s.personas * s.dias
                return (
                  <tr key={s.id} className="group">
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        placeholder="Ej. Transporte aeropuerto"
                        value={s.descripcion}
                        onChange={(e) => updateServicio(s.id, 'descripcion', e.target.value)}
                        className="w-full min-w-[180px] px-3 py-1.5 rounded-lg border border-zinc-200 bg-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#004b23]/20 focus:border-[#004b23] transition"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={s.precio_operativo}
                        onChange={(e) => updateServicio(s.id, 'precio_operativo', Number(e.target.value))}
                        className="w-28 px-3 py-1.5 rounded-lg border border-zinc-200 bg-zinc-50 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-[#004b23]/20 focus:border-[#004b23] transition"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min={1}
                        value={s.personas}
                        onChange={(e) => updateServicio(s.id, 'personas', Number(e.target.value))}
                        className="w-20 px-3 py-1.5 rounded-lg border border-zinc-200 bg-zinc-50 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-[#004b23]/20 focus:border-[#004b23] transition"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min={1}
                        value={s.dias}
                        onChange={(e) => updateServicio(s.id, 'dias', Number(e.target.value))}
                        className="w-20 px-3 py-1.5 rounded-lg border border-zinc-200 bg-zinc-50 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-[#004b23]/20 focus:border-[#004b23] transition"
                      />
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-zinc-700 tabular-nums">
                      {formatCurrency(subtotalLinea)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => removeServicio(s.id)}
                        disabled={servicios.length === 1}
                        className="p-1.5 rounded-lg text-zinc-300 hover:text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Eliminar servicio"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-zinc-50">
          <button
            onClick={addServicio}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-[#004b23] border border-[#004b23]/30 hover:bg-[#004b23] hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Añadir Servicio
          </button>
        </div>
      </div>

      {/* Panel de resultados */}
      <div className="bg-[#004b23] rounded-2xl p-6 text-white">
        <h2 className="text-sm font-bold text-emerald-300 uppercase tracking-wide mb-5">
          Resumen Financiero
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-white/10">
            <span className="text-emerald-200 text-sm">Costo Total Operativo</span>
            <span className="font-semibold tabular-nums">{formatCurrency(costoTotalOperativo)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-white/10">
            <span className="text-emerald-200 text-sm">Margen Aplicado ({margen}%)</span>
            <span className="font-semibold tabular-nums text-emerald-300">
              + {formatCurrency(margenDolares)}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-white/10">
            <span className="text-emerald-200 text-sm">Subtotal (sin IVA)</span>
            <span className="font-semibold tabular-nums">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-white/10">
            <span className="text-emerald-200 text-sm">IVA (13%)</span>
            <span className="font-semibold tabular-nums">{formatCurrency(iva)}</span>
          </div>
          <div className="flex justify-between items-center pt-3">
            <span className="text-white font-bold text-lg">Gran Total</span>
            <span className="text-[#f77f00] font-bold text-2xl tabular-nums">
              {formatCurrency(granTotal)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
