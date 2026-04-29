'use client'

import { useActionState } from 'react'
import { login } from '@/app/actions/auth'

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, undefined)

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#004b23] flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4">
            M
          </div>
          <h1 className="text-2xl font-bold text-zinc-900">Mango & Coffee Tours</h1>
          <p className="text-zinc-500 text-sm mt-1">Panel de Administración</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-8">
          <h2 className="text-lg font-semibold text-zinc-800 mb-6">Iniciar Sesión</h2>

          {state?.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-5">
              {state.error}
            </div>
          )}

          <form action={formAction} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Correo Electrónico
              </label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="admin@mango.com"
                className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-[#004b23] focus:border-transparent outline-none transition-all text-black placeholder:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Contraseña
              </label>
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-[#004b23] focus:border-transparent outline-none transition-all text-black placeholder:text-gray-400"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-[#004b23] hover:bg-emerald-900 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isPending ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-zinc-400 mt-6">
          © {new Date().getFullYear()} Mango & Coffee Tours
        </p>
      </div>
    </div>
  )
}
