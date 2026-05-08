'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

interface TarifaData {
  pax: number
  asientos: number
  costo_transporte: number
  costo_motorista: number
  costo_gasolina: number
  costo_guia: number
  costo_otros: number
  costo_kit: number
}

export async function crearTarifa(data: TarifaData): Promise<{ error: string } | undefined> {
  if (!data.pax || data.pax < 1) return { error: 'PAX debe ser mayor a 0' }
  try {
    await prisma.tarifas_operativas.create({ data })
    revalidatePath('/admin/tarifas')
  } catch {
    return { error: 'Ya existe una tarifa para ese número de PAX' }
  }
}

export async function actualizarTarifa(id: string, data: TarifaData): Promise<{ error: string } | undefined> {
  try {
    await prisma.tarifas_operativas.update({ where: { id }, data })
    revalidatePath('/admin/tarifas')
  } catch {
    return { error: 'No se pudo actualizar la tarifa' }
  }
}

export async function eliminarTarifa(id: string): Promise<void> {
  await prisma.tarifas_operativas.delete({ where: { id } })
  revalidatePath('/admin/tarifas')
}
