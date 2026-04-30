import QuoteForm from "@/components/QuoteForm";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const raw = await prisma.catalogo_servicios.findMany({
    where: { activo: true },
    orderBy: { nombre_es: "asc" },
  });

  const servicios = raw.map((s) => ({
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
  }));

  const config = await prisma.configuracion.findFirst();
  const margenGlobal = config?.margen_ganancia ? Number(config.margen_ganancia) : 30;

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 font-sans selection:bg-[#f77f00] selection:text-white">
      {/* Header Corporativo */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#f77f00] flex items-center justify-center text-white font-bold text-xl">
              M
            </div>
            <span className="font-bold text-xl text-[#004b23] tracking-tight">
              Mango & Coffee <span className="font-light text-zinc-500">Tours</span>
            </span>
          </div>
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
            Diseñe experiencias a medida. El sistema calculará automáticamente los márgenes y generará el enlace de pago.
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
