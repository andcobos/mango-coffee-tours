'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

export interface CotizacionInput {
  nombre: string
  correo: string
  pax: number
  fechaInicio: string
  fechaFin: string
  idioma: string
  subtotal_costo: number
  margen_aplicado: number
  subtotal_venta: number
  iva_total: number
  gran_total: number
  detalles: { nombre: string; precio: number }[]
  es_paquete: boolean
  notas?: string
  codigo_referencia: string
}

export async function guardarCotizacion(data: CotizacionInput) {
  const hoy = new Date()

  const fechaInicio = data.fechaInicio
    ? new Date(data.fechaInicio + 'T00:00:00')
    : hoy
  const fechaFin = data.fechaFin
    ? new Date(data.fechaFin + 'T00:00:00')
    : hoy

  const fechaVencimiento = new Date(hoy)
  fechaVencimiento.setDate(fechaVencimiento.getDate() + 30)

  await prisma.cotizaciones.create({
    data: {
      cliente_nombre: data.nombre,
      cliente_email: data.correo,
      pax: data.pax,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      idioma_preferido: data.idioma,
      estado: 'GENERADA',
      fecha_vencimiento: fechaVencimiento,
      subtotal_costo: data.subtotal_costo,
      margen_aplicado: data.margen_aplicado,
      subtotal_venta: data.subtotal_venta,
      iva_total: data.iva_total,
      gran_total: data.gran_total,
      detalles: data.detalles,
      es_paquete: data.es_paquete,
      notas_cliente: data.notas ?? null,
      codigo_referencia: data.codigo_referencia,
    },
  })
}

export async function actualizarEstadoCotizacion(
  id: string,
  nuevoEstado: 'GENERADA' | 'CONFIRMADA' | 'VENCIDA'
) {
  await prisma.cotizaciones.update({
    where: { id },
    data: { estado: nuevoEstado },
  })

  revalidatePath('/admin/cotizaciones')
  revalidatePath(`/admin/cotizaciones/${id}`)
}
