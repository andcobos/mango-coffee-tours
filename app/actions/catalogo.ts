'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export async function crearServicio(
  _prevState: { error: string } | undefined,
  formData: FormData
): Promise<{ error: string } | undefined> {
  const tipo = formData.get('tipo') as string
  const nombre_es = formData.get('nombre_es') as string
  const nombre_en = formData.get('nombre_en') as string
  const costo_raw = formData.get('costo_operativo') as string
  const rango_edad = (formData.get('rango_edad') as string) || null

  const costo = parseFloat(costo_raw)
  if (isNaN(costo) || costo < 0) return { error: 'El costo operativo debe ser un número válido.' }

  try {
    await prisma.catalogo_servicios.create({
      data: { tipo, nombre_es, nombre_en, costo_operativo: costo, rango_edad, activo: true },
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

  const costo = parseFloat(costo_raw)
  if (isNaN(costo) || costo < 0) return { error: 'El costo operativo debe ser un número válido.' }

  try {
    await prisma.catalogo_servicios.update({
      where: { id },
      data: { tipo, nombre_es, nombre_en, costo_operativo: costo, rango_edad },
    })
  } catch {
    return { error: 'Error al actualizar el servicio. Intenta de nuevo.' }
  }

  revalidatePath('/admin/catalogo')
  redirect('/admin/catalogo')
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
