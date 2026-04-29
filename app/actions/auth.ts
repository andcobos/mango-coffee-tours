'use server'

import { redirect } from 'next/navigation'
import { createSession, deleteSession, verifyCredentials } from '@/lib/auth'

export async function login(
  _prevState: { error: string } | undefined,
  formData: FormData
): Promise<{ error: string } | undefined> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!verifyCredentials(email, password)) {
    return { error: 'Credenciales incorrectas. Verifica tu correo y contraseña.' }
  }

  await createSession()
  redirect('/admin')
}

export async function logout() {
  await deleteSession()
  redirect('/admin/login')
}
