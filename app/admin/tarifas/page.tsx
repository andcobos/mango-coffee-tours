import { prisma } from '@/lib/prisma'
import TarifasManager from '@/components/admin/TarifasManager'

export default async function TarifasPage() {
  const raw = await prisma.tarifas_operativas.findMany({
    orderBy: { pax: 'asc' },
  })

  const tarifas = raw.map((t) => ({
    id: t.id,
    pax: t.pax,
    asientos: t.asientos,
    costo_transporte: Number(t.costo_transporte),
    costo_motorista:  Number(t.costo_motorista),
    costo_gasolina:   Number(t.costo_gasolina),
    costo_guia:       Number(t.costo_guia),
    costo_otros:      Number(t.costo_otros),
    costo_kit:        Number(t.costo_kit),
  }))

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Tarifas Operativas</h1>
        <p className="text-zinc-500 text-sm mt-1">
          Configura los costos operativos por número de pasajeros (PAX). Se aplican automáticamente en la cotización cuando el cliente selecciona al menos un destino.
        </p>
      </div>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
        <p className="font-semibold mb-1">¿Cómo funciona?</p>
        <p>
          Al cotizar, si hay destinos seleccionados, el sistema busca la tarifa cuyo PAX coincida con el número de pasajeros.
          El costo fijo total (transporte + motorista + gasolina + guía + otros) se divide entre el número de pasajeros para obtener el costo por persona,
          al que se suma el kit de bienvenida. Este costo operativo se agrega al subtotal antes de aplicar el margen de ganancia.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6">
        <TarifasManager tarifas={tarifas} />
      </div>
    </div>
  )
}
