# Mango & Coffee Tours — Memoria de Proyecto

## Stack
- Next.js 16.2.4 (App Router) — tiene breaking changes vs versiones anteriores
- React 19.2.4
- Prisma 7.8.0 con `@prisma/adapter-pg` (pool de conexión)
- Supabase (PostgreSQL) con esquemas `auth` y `public`
- Tailwind CSS v4

## Convenciones críticas de Next.js 16
- `middleware.ts` está DEPRECADO → usar `proxy.ts` con `export function proxy()`
- `params` en page/layout es `Promise<{...}>` → requiere `await params`
- `cookies()` de `next/headers` es async → requiere `await cookies()`
- Server Actions: deben tener `'use server'` al nivel del archivo
- `useActionState` importado de `react` (no de react-dom)

## Archivos clave del proyecto
```
proxy.ts                              — protección de rutas /admin/*
lib/auth.ts                           — utilidades de sesión (cookies)
lib/prisma.ts                         — cliente Prisma con pool pg
app/actions/auth.ts                   — login / logout server actions
app/actions/catalogo.ts               — CRUD server actions del catálogo
components/admin/Sidebar.tsx          — sidebar client component
components/admin/catalogo/ServiceForm.tsx — formulario create/edit (client)
app/admin/login/page.tsx              — página de login (client)
app/admin/layout.tsx                  — layout del panel admin
app/admin/page.tsx                    — dashboard con métricas reales
app/admin/catalogo/page.tsx           — listado de catalogo_servicios
app/admin/catalogo/nuevo/page.tsx     — crear servicio
app/admin/catalogo/[id]/editar/page.tsx — editar servicio
app/admin/cotizar/page.tsx            — admin usa QuoteForm existente
app/page.tsx                          — formulario público (sin auth)
components/QuoteForm.tsx              — formulario de cotización (client)
prisma/schema.prisma                  — esquema sincronizado con Supabase
prisma.config.ts                      — usa defineConfig + dotenv.config()
```

## Modelos Prisma relevantes (schema public)
- `catalogo_servicios`: id, tipo, nombre_es, nombre_en, costo_operativo (Decimal), rango_edad, activo
- `cotizaciones`: id, cliente_nombre, cliente_email, pax, estado, gran_total (Decimal), ...
- `cotizaciones_detalle`: id, cotizacion_id, servicio_id, costo_unitario_snapshot, cantidad, ...
- `configuracion_global`: margen_ganancia (0.30), iva_porcentaje (0.13)

## Autenticación temporal
- Credenciales hardcodeadas en `lib/auth.ts`: admin@mango.com / mango2026
- Cookie: `admin_session = "authenticated"` (httpOnly, sameSite: lax)
- Diseñado para reemplazar fácilmente por NextAuth/Supabase Auth

## Colores corporativos
- Verde oscuro: `#004b23`
- Naranja: `#f77f00`

## Notas Prisma
- Los campos Decimal deben convertirse con `Number(valor)` antes de pasar a client components
- `lib/prisma.ts` usa PrismaPg adapter con pool de pg
- `prisma.config.ts` usa DIRECT_URL (no DATABASE_URL) para comandos de terminal
