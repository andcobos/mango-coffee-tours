'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/actions/auth'

const navLinks = [
  { href: '/admin', label: 'Dashboard', icon: '▦' },
  { href: '/admin/catalogo', label: 'Catálogo de Servicios', icon: '☰' },
  { href: '/admin/cotizar', label: 'Generar Cotización', icon: '✎' },
]

export default function Sidebar() {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
    <aside className="w-64 min-h-screen bg-[#004b23] text-white flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#f77f00] flex items-center justify-center font-bold text-xl">
            M
          </div>
          <div className="leading-tight">
            <p className="font-bold text-sm">Mango & Coffee</p>
            <p className="text-xs text-emerald-300">Panel Admin</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navLinks.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive(href)
                ? 'bg-white/15 text-white'
                : 'text-emerald-100 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span className="text-base w-5 text-center">{icon}</span>
            {label}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <form action={logout}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-emerald-200 hover:bg-white/10 hover:text-white transition-colors text-left"
          >
            <span className="text-base w-5 text-center">⏻</span>
            Cerrar Sesión
          </button>
        </form>
      </div>
    </aside>
  )
}
