export default function AdminLoading() {
  return (
    <div className="p-8 max-w-6xl w-full">
      {/* Header skeleton */}
      <div className="mb-8 space-y-2 animate-pulse">
        <div className="h-7 w-48 bg-zinc-200 rounded-lg" />
        <div className="h-4 w-64 bg-zinc-100 rounded-md" />
      </div>

      {/* Card skeleton */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden animate-pulse">
        {/* Table header */}
        <div className="flex gap-4 px-6 py-3 bg-zinc-50 border-b border-zinc-100">
          <div className="h-3 w-32 bg-zinc-200 rounded" />
          <div className="h-3 w-40 bg-zinc-200 rounded" />
          <div className="h-3 w-24 bg-zinc-200 rounded" />
          <div className="h-3 w-20 bg-zinc-200 rounded ml-auto" />
        </div>

        {/* Table rows */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-6 py-4 border-b border-zinc-50 last:border-0"
          >
            <div className="space-y-1.5 flex-1">
              <div className="h-3.5 w-36 bg-zinc-200 rounded" />
              <div className="h-3 w-24 bg-zinc-100 rounded" />
            </div>
            <div className="h-3 w-40 bg-zinc-100 rounded" />
            <div className="h-3 w-24 bg-zinc-100 rounded" />
            <div className="h-6 w-20 bg-zinc-100 rounded-full ml-auto" />
          </div>
        ))}
      </div>

      {/* Footer label */}
      <p className="mt-6 text-center text-xs text-zinc-300 tracking-wide">
        Cargando datos...
      </p>
    </div>
  )
}
