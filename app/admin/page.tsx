export default function AdminPage() {
  // Mock data para visualización del catálogo (Fase 2)
  const services = [
    { id: "dest-1", tipo: "DESTINO", nombre_es: "Tour Volcán Arenal", costo: 50, activo: true },
    { id: "dest-2", tipo: "DESTINO", nombre_es: "Monteverde", costo: 65, activo: true },
    { id: "tic-1", tipo: "ENTRADA", nombre_es: "Termales", costo: 35, activo: true },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-[#004b23]">Dashboard Administrativo</h1>
          <p className="text-zinc-500 mt-2">Gestión del catálogo de servicios</p>
        </header>
        
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-zinc-800">Catálogo de Servicios</h2>
            <button className="bg-[#004b23] hover:bg-emerald-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              + Nuevo Servicio
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-zinc-200">
                  <th className="px-6 py-4 text-sm font-semibold text-zinc-600">Tipo</th>
                  <th className="px-6 py-4 text-sm font-semibold text-zinc-600">Nombre (ES)</th>
                  <th className="px-6 py-4 text-sm font-semibold text-zinc-600">Costo Operativo</th>
                  <th className="px-6 py-4 text-sm font-semibold text-zinc-600">Estado</th>
                  <th className="px-6 py-4 text-sm font-semibold text-zinc-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {services.map((service) => (
                  <tr key={service.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="bg-emerald-100 text-[#004b23] text-xs font-bold px-2 py-1 rounded">
                        {service.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-800 font-medium">{service.nombre_es}</td>
                    <td className="px-6 py-4 text-sm text-zinc-600">${service.costo.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      {service.activo ? (
                        <span className="text-emerald-600 text-sm font-medium flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Activo
                        </span>
                      ) : (
                        <span className="text-zinc-400 text-sm font-medium flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-zinc-300"></span> Inactivo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button className="text-[#f77f00] hover:underline font-medium">Editar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
