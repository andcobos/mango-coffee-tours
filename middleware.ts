import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isLoginPage = pathname === '/admin/login'

  // Construir respuesta base que propaga cookies de sesión de Supabase
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

  // IMPORTANTE: usar getUser() (no getSession()) para validar en el servidor
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
    .replace(/^["']|["']$/g, '')   // strip comillas envolventes del valor del .env
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)

  const userEmail = (user.email ?? '').toLowerCase()
  const isWhitelisted = adminEmails.includes(userEmail)

  // DEBUG — eliminar una vez confirmado el flujo correcto
  console.log(`[Middleware] Intento de acceso de: ${userEmail} | ¿Está en lista? ${isWhitelisted}`)
  console.log(`[Middleware] Lista blanca: [${adminEmails.join(', ')}]`)

  if (!isWhitelisted) {
    // Correo no autorizado: cerrar sesión y redirigir a la raíz pública
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
  matcher: ['/admin/:path*'],
}
