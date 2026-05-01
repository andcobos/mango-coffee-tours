import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Cambiamos el nombre de la función de 'middleware' a 'proxy'
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Salida rápida para rutas que no son /admin — sin tocar Supabase
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  const isLoginPage = pathname === '/admin/login'

  // Respuesta base que propaga cookies de sesión de Supabase
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Usar getUser() para validar en el servidor de forma segura
  const { data: { user } } = await supabase.auth.getUser()

  // Sin sesión → solo puede estar en /admin/login
  if (!user) {
    if (!isLoginPage) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    return supabaseResponse
  }

  // Con sesión → validar whitelist
  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .replace(/^["']|["']$/g, '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)

  const userEmail = (user.email ?? '').toLowerCase()
  const isWhitelisted = adminEmails.includes(userEmail)

  if (!isWhitelisted) {
    await supabase.auth.signOut()
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Usuario autorizado en /admin/login → redirigir al panel
  if (isLoginPage) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Ejecutar en todas las rutas EXCEPTO recursos estáticos
     */
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)',
  ],
}