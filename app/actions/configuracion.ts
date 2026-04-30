'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  margen_ganancia: z.coerce.number().min(0).max(100),
})

export async function actualizarConfiguracion(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const parsed = schema.safeParse({ margen_ganancia: formData.get('margen_ganancia') })

  if (!parsed.success) {
    return { error: 'El margen debe ser un número entre 0 y 100.' }
  }

  try {
    await prisma.configuracion.upsert({
      where: { id: 1 },
      update: { margen_ganancia: parsed.data.margen_ganancia },
      create: { id: 1, margen_ganancia: parsed.data.margen_ganancia },
    })
  } catch {
    return { error: 'Error al guardar la configuración. Intenta de nuevo.' }
  }

  revalidatePath('/admin/ajustes')
  revalidatePath('/admin/cotizar')
  revalidatePath('/')

  return { success: true }
}
