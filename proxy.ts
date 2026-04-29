import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Nota: middleware.ts está deprecado en Next.js 16 y ha sido renombrado a proxy.ts

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = request.cookies.get('admin_session')?.value

  const isAdminRoute = pathname.startsWith('/admin')
  const isLoginPage = pathname === '/admin/login'

  if (isAdminRoute && !isLoginPage && session !== 'authenticated') {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  if (isLoginPage && session === 'authenticated') {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
