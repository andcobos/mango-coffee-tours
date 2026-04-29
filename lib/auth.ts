import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// ─── Credenciales hardcodeadas (reemplazar por NextAuth/Supabase Auth en el futuro) ───
const ADMIN_EMAIL = 'admin@mango.com'
const ADMIN_PASSWORD = 'mango2026'

export const SESSION_COOKIE = 'admin_session'
const SESSION_VALUE = 'authenticated'

export function verifyCredentials(email: string, password: string): boolean {
  return email === ADMIN_EMAIL && password === ADMIN_PASSWORD
}

export async function createSession() {
  const store = await cookies()
  store.set(SESSION_COOKIE, SESSION_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8, // 8 horas
  })
}

export async function deleteSession() {
  const store = await cookies()
  store.delete(SESSION_COOKIE)
}

export async function getSession(): Promise<boolean> {
  const store = await cookies()
  return store.get(SESSION_COOKIE)?.value === SESSION_VALUE
}

export async function requireAuth() {
  if (!(await getSession())) {
    redirect('/admin/login')
  }
}
