import QuoteForm from '@/components/QuoteForm'

export default function AdminCotizarPage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Generar Cotización</h1>
        <p className="text-zinc-500 text-sm mt-1">
          Genera una cotización exprés para un cliente por teléfono o en persona.
        </p>
      </div>
      <QuoteForm />
    </div>
  )
}
