import Image from "next/image";
import QuoteForm from "@/components/QuoteForm";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [raw, config] = await Promise.all([
    prisma.catalogo_servicios.findMany({
      where: { activo: true },
      orderBy: { nombre_es: "asc" },
      include: { opciones_servicio: { orderBy: { creado_en: "asc" } } },
    }),
    prisma.configuracion.findFirst(),
  ]);

  const servicios = raw.map((s: (typeof raw)[number]) => ({
    id: s.id,
    tipo: s.tipo,
    nombre_es: s.nombre_es,
    nombre_en: s.nombre_en,
    costo_operativo: Number(s.costo_operativo),
    rango_edad: s.rango_edad ?? null,
    empresa: s.empresa ?? null,
    tipo_vehiculo: s.tipo_vehiculo ?? null,
    capacidad_pasajeros: s.capacidad_pasajeros ?? null,
    costo_extra_nombre: s.costo_extra_nombre ?? null,
    costo_extra_valor: s.costo_extra_valor != null ? Number(s.costo_extra_valor) : null,
    descripcion: s.descripcion ?? null,
    nivel_esfuerzo: s.nivel_esfuerzo ?? null,
    imagen_url: s.imagen_url ?? null,
    link_google_maps: s.link_google_maps ?? null,
    link_punto_encuentro: s.link_punto_encuentro ?? null,
    opciones_servicio: s.opciones_servicio.map((o) => ({
      id: o.id,
      nombre: o.nombre,
      descripcion: o.descripcion,
      link_google_maps: o.link_google_maps,
      precio_por_persona: Number(o.precio_por_persona ?? 0),
    })),
  }));

  const margenGlobal = config?.margen_ganancia ? Number(config.margen_ganancia) : 30;

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 font-sans selection:bg-[#f77f00] selection:text-white">
      {/* Header Corporativo */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Image
            src="/mangocoffeetours_logo.png"
            alt="Mango & Coffee Tours"
            width={120}
            height={60}
            className="object-contain"
            priority
          />
          <div className="text-sm text-zinc-500 hidden sm:block">
            Sistema de Automatización de Propuestas
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-10 w-full">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">
            Nueva Cotización
          </h1>
          <p className="mt-2 text-base text-zinc-500">
            Diseñe experiencias a medida. Una vez generada la cotización, se le notificará a Mango&Coffee Tours para dar el seguimiento.
          </p>
        </div>

        <QuoteForm servicios={servicios} margenGlobal={margenGlobal} />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-zinc-200 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between text-sm text-zinc-500">
          <p>© {new Date().getFullYear()} Mango & Coffee Tours.</p>
        </div>
      </footer>
    </div>
  );
}
