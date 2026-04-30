'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

export async function eliminarCliente(id: string) {
  await prisma.clientes.delete({ where: { id } })
  revalidatePath('/admin/clientes')
  redirect('/admin/clientes')
}

export async function actualizarNotasCliente(id: string, notas: string) {
  try {
    await prisma.clientes.update({
      where: { id },
      data: { notas },
    })
    revalidatePath(`/admin/clientes/${id}`)
  } catch (error) {
    console.error('Error al actualizar notas del cliente:', error)
    throw new Error('No se pudieron guardar las notas. Inténtalo de nuevo.')
  }
}
