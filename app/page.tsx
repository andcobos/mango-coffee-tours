import QuoteForm from "@/components/QuoteForm";

export default function Home() {
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
        
        <QuoteForm />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-zinc-200 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between text-sm text-zinc-500">
          <p>© {new Date().getFullYear()} Mango & Coffee Tours.</p>
          <p>Powered by DRF V2</p>
        </div>
      </footer>
    </div>
  );
}
