'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

const TIPOS_VALIDOS = ['DESTINO', 'GUIA', 'ENTRADA', 'SEGURO', 'ALIMENTACION', 'KIT', 'TRANSPORTE', 'ALOJAMIENTO', 'PAQUETE', 'OTRO'] as const

function parseTransporteFields(formData: FormData) {
  const empresa = (formData.get('empresa') as string) || null
  const tipo_vehiculo = (formData.get('tipo_vehiculo') as string) || null
  const capacidad_raw = formData.get('capacidad_pasajeros') as string
  const capacidad_pasajeros = capacidad_raw ? parseInt(capacidad_raw, 10) || null : null
  const costo_extra_nombre = (formData.get('costo_extra_nombre') as string) || null
  const costo_extra_raw = formData.get('costo_extra_valor') as string
  const costo_extra_valor = costo_extra_raw ? parseFloat(costo_extra_raw) || null : null
  return { empresa, tipo_vehiculo, capacidad_pasajeros, costo_extra_nombre, costo_extra_valor }
}

export async function crearServicio(
  _prevState: { error: string } | undefined,
  formData: FormData
): Promise<{ error: string } | undefined> {
  const tipo = formData.get('tipo') as string
  const nombre_es = formData.get('nombre_es') as string
  const nombre_en = formData.get('nombre_en') as string
  const costo_raw = formData.get('costo_operativo') as string
  const rango_edad = (formData.get('rango_edad') as string) || null
  const descripcion = (formData.get('descripcion') as string) || null

  if (!TIPOS_VALIDOS.includes(tipo as typeof TIPOS_VALIDOS[number])) {
    return { error: 'Tipo de servicio no válido.' }
  }

  const costo = parseFloat(costo_raw)
  if (isNaN(costo) || costo < 0) return { error: 'El costo operativo debe ser un número válido.' }

  const transporteFields = tipo === 'TRANSPORTE' ? parseTransporteFields(formData) : {
    empresa: null, tipo_vehiculo: null, capacidad_pasajeros: null,
    costo_extra_nombre: null, costo_extra_valor: null,
  }

  try {
    await prisma.catalogo_servicios.create({
      data: {
        tipo, nombre_es, nombre_en, costo_operativo: costo, rango_edad, activo: true,
        descripcion, ...transporteFields,
      },
    })
  } catch {
    return { error: 'Error al crear el servicio. Intenta de nuevo.' }
  }

  revalidatePath('/admin/catalogo')
  redirect('/admin/catalogo')
}

export async function actualizarServicio(
  _prevState: { error: string } | undefined,
  formData: FormData
): Promise<{ error: string } | undefined> {
  const id = formData.get('id') as string
  const tipo = formData.get('tipo') as string
  const nombre_es = formData.get('nombre_es') as string
  const nombre_en = formData.get('nombre_en') as string
  const costo_raw = formData.get('costo_operativo') as string
  const rango_edad = (formData.get('rango_edad') as string) || null
  const descripcion = (formData.get('descripcion') as string) || null

  if (!TIPOS_VALIDOS.includes(tipo as typeof TIPOS_VALIDOS[number])) {
    return { error: 'Tipo de servicio no válido.' }
  }

  const costo = parseFloat(costo_raw)
  if (isNaN(costo) || costo < 0) return { error: 'El costo operativo debe ser un número válido.' }

  // Si cambia a otro tipo, limpiamos los campos de transporte
  const transporteFields = tipo === 'TRANSPORTE' ? parseTransporteFields(formData) : {
    empresa: null, tipo_vehiculo: null, capacidad_pasajeros: null,
    costo_extra_nombre: null, costo_extra_valor: null,
  }

  try {
    await prisma.catalogo_servicios.update({
      where: { id },
      data: {
        tipo, nombre_es, nombre_en, costo_operativo: costo, rango_edad,
        descripcion, ...transporteFields,
      },
    })
  } catch {
    return { error: 'Error al actualizar el servicio. Intenta de nuevo.' }
  }

  revalidatePath('/admin/catalogo')
  redirect('/admin/catalogo')
}

export async function eliminarServicio(id: string) {
  await prisma.catalogo_servicios.delete({ where: { id } })
  revalidatePath('/admin/catalogo')
}

export async function toggleActivoServicio(formData: FormData) {
  const id = formData.get('id') as string
  const activo = formData.get('activo') === 'true'

  await prisma.catalogo_servicios.update({
    where: { id },
    data: { activo: !activo },
  })

  revalidatePath('/admin/catalogo')
}
