'use client'

import { useState, useTransition } from 'react'
import { crearTarifa, actualizarTarifa, eliminarTarifa } from '@/app/actions/tarifas'

export interface TarifaRow {
  id: string
  pax: number
  asientos: number
  costo_transporte: number
  costo_motorista: number
  costo_gasolina: number
  costo_guia: number
  costo_otros: number
  costo_kit: number
}

const EMPTY_FORM = {
  pax: '',
  asientos: '5',
  costo_transporte: '',
  costo_motorista: '',
  costo_gasolina: '',
  costo_guia: '',
  costo_otros: '',
  costo_kit: '',
}

const CAMPOS = [
  { field: 'pax',              label: 'PAX',          step: '1',    placeholder: 'Ej: 2' },
  { field: 'asientos',         label: 'Asientos',     step: '1',    placeholder: '5' },
  { field: 'costo_transporte', label: 'Transporte ($)',step: '0.01', placeholder: '0.00' },
  { field: 'costo_motorista',  label: 'Motorista ($)', step: '0.01', placeholder: '0.00' },
  { field: 'costo_gasolina',   label: 'Gasolina ($)',  step: '0.01', placeholder: '0.00' },
  { field: 'costo_guia',       label: 'Guía ($)',      step: '0.01', placeholder: '0.00' },
  { field: 'costo_otros',      label: 'Otros ($)',     step: '0.01', placeholder: '0.00' },
  { field: 'costo_kit',        label: 'Kit/pax ($)',   step: '0.01', placeholder: '0.00' },
]

function parseForm(form: Record<string, string>): Parameters<typeof crearTarifa>[0] {
  return {
    pax:              parseInt(form.pax, 10) || 0,
    asientos:         parseInt(form.asientos, 10) || 5,
    costo_transporte: parseFloat(form.costo_transporte) || 0,
    costo_motorista:  parseFloat(form.costo_motorista) || 0,
    costo_gasolina:   parseFloat(form.costo_gasolina) || 0,
    costo_guia:       parseFloat(form.costo_guia) || 0,
    costo_otros:      parseFloat(form.costo_otros) || 0,
    costo_kit:        parseFloat(form.costo_kit) || 0,
  }
}

export default function TarifasManager({ tarifas }: { tarifas: TarifaRow[] }) {
  const [isPending, startTransition] = useTransition()
  const [editingId, setEditingId]   = useState<string | null>(null)
  const [editForm, setEditForm]     = useState<Record<string, string>>({})
  const [addForm, setAddForm]       = useState<Record<string, string>>(EMPTY_FORM)
  const [showAdd, setShowAdd]       = useState(false)
  const [error, setError]           = useState<string | null>(null)

  function startEdit(t: TarifaRow) {
    setEditingId(t.id)
    setEditForm({
      pax:              String(t.pax),
      asientos:         String(t.asientos),
      costo_transporte: String(t.costo_transporte),
      costo_motorista:  String(t.costo_motorista),
      costo_gasolina:   String(t.costo_gasolina),
      costo_guia:       String(t.costo_guia),
      costo_otros:      String(t.costo_otros),
      costo_kit:        String(t.costo_kit),
    })
    setError(null)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditForm({})
    setError(null)
  }

  function handleSaveEdit(id: string) {
    startTransition(async () => {
      const result = await actualizarTarifa(id, parseForm(editForm))
      if (result?.error) {
        setError(result.error)
      } else {
        setEditingId(null)
        setError(null)
      }
    })
  }

  function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta tarifa?')) return
    startTransition(() => eliminarTarifa(id))
  }

  function handleAdd() {
    startTransition(async () => {
      const result = await crearTarifa(parseForm(addForm))
      if (result?.error) {
        setError(result.error)
      } else {
        setAddForm(EMPTY_FORM)
        setShowAdd(false)
        setError(null)
      }
    })
  }

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-zinc-200 rounded-lg overflow-hidden">
          <thead className="bg-[#004b23] text-white">
            <tr>
              {['PAX', 'Asientos', 'Transporte', 'Motorista', 'Gasolina', 'Guía', 'Otros', 'Kit/pax', 'Total Fijos', 'Total Costos por Persona', 'Acciones'].map((h) => (
                <th key={h} className="px-3 py-2.5 text-xs font-semibold text-left whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tarifas.map((t, i) =>
              editingId === t.id ? (
                <tr key={t.id} className="bg-amber-50 border-b border-zinc-200">
                  <td className="px-3 py-2 text-xs font-bold text-zinc-700">{t.pax}</td>
                  {(['asientos','costo_transporte','costo_motorista','costo_gasolina','costo_guia','costo_otros','costo_kit'] as const).map((f) => (
                    <td key={f} className="px-2 py-2">
                      <input
                        type="number" min="0" step={f === 'asientos' ? '1' : '0.01'}
                        value={editForm[f] ?? ''}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, [f]: e.target.value }))}
                        className="w-20 px-1.5 py-1 border border-zinc-300 rounded text-xs text-right"
                      />
                    </td>
                  ))}
                  <td className="px-3 py-2 text-xs text-zinc-400">—</td>
                  <td className="px-3 py-2 text-xs text-zinc-400">—</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleSaveEdit(t.id)} disabled={isPending}
                        className="px-2 py-1 bg-[#004b23] text-white rounded text-xs hover:bg-[#003b1a] disabled:opacity-50">
                        Guardar
                      </button>
                      <button onClick={cancelEdit}
                        className="px-2 py-1 bg-zinc-200 text-zinc-700 rounded text-xs hover:bg-zinc-300">
                        Cancelar
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={t.id} className={`border-b border-zinc-100 ${i % 2 !== 0 ? 'bg-zinc-50' : 'bg-white'} hover:bg-zinc-50/80`}>
                  <td className="px-3 py-2.5 text-xs font-bold text-zinc-800">{t.pax} pax</td>
                  <td className="px-3 py-2.5 text-xs text-zinc-600">{t.asientos}</td>
                  <td className="px-3 py-2.5 text-xs text-zinc-600">${t.costo_transporte.toFixed(2)}</td>
                  <td className="px-3 py-2.5 text-xs text-zinc-600">${t.costo_motorista.toFixed(2)}</td>
                  <td className="px-3 py-2.5 text-xs text-zinc-600">${t.costo_gasolina.toFixed(2)}</td>
                  <td className="px-3 py-2.5 text-xs text-zinc-600">${t.costo_guia.toFixed(2)}</td>
                  <td className="px-3 py-2.5 text-xs text-zinc-600">${t.costo_otros.toFixed(2)}</td>
                  <td className="px-3 py-2.5 text-xs text-zinc-600">${t.costo_kit.toFixed(2)}</td>
                  <td className="px-3 py-2.5 text-xs font-semibold text-zinc-700">
                    ${(t.costo_transporte + t.costo_motorista + t.costo_gasolina + t.costo_guia + t.costo_otros).toFixed(2)}
                  </td>
                  <td className="px-3 py-2.5 text-xs font-bold text-[#004b23]">
                    ${((t.costo_transporte + t.costo_motorista + t.costo_gasolina + t.costo_guia + t.costo_otros) / t.pax + t.costo_kit).toFixed(2)}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1">
                      <button onClick={() => startEdit(t)}
                        className="px-2 py-1 border border-zinc-300 text-zinc-600 rounded text-xs hover:bg-zinc-100">
                        Editar
                      </button>
                      <button onClick={() => handleDelete(t.id)} disabled={isPending}
                        className="px-2 py-1 border border-red-200 text-red-600 rounded text-xs hover:bg-red-50 disabled:opacity-50">
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              )
            )}
            {tarifas.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-zinc-400 text-sm italic">
                  No hay tarifas configuradas. Agrega la primera usando el botón de abajo.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        {!showAdd ? (
          <button onClick={() => setShowAdd(true)}
            className="px-4 py-2 bg-[#f77f00] text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors">
            + Agregar tarifa
          </button>
        ) : (
          <div className="border border-zinc-200 rounded-xl p-5 bg-zinc-50 mt-2">
            <h3 className="text-sm font-semibold text-zinc-700 mb-4">Nueva tarifa operativa</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {CAMPOS.map(({ field, label, step, placeholder }) => (
                <div key={field}>
                  <label className="block text-xs font-medium text-zinc-600 mb-1">{label}</label>
                  <input
                    type="number" min="0" step={step}
                    value={addForm[field] ?? ''}
                    onChange={(e) => setAddForm((prev) => ({ ...prev, [field]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full px-2 py-1.5 border border-zinc-300 rounded-lg text-sm bg-white"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={handleAdd} disabled={isPending || !addForm.pax}
                className="px-4 py-2 bg-[#004b23] text-white rounded-lg text-sm font-medium hover:bg-[#003b1a] disabled:opacity-50 transition-colors">
                {isPending ? 'Guardando…' : 'Guardar'}
              </button>
              <button onClick={() => { setShowAdd(false); setAddForm(EMPTY_FORM); setError(null) }}
                className="px-4 py-2 bg-white border border-zinc-300 text-zinc-700 rounded-lg text-sm hover:bg-zinc-50 transition-colors">
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
