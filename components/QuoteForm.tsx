"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller, SubmitHandler, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { calculatePrice } from "@/lib/calculator";

export interface ServicioCatalogo {
  id: string;
  tipo: string;
  nombre_es: string;
  nombre_en: string;
  costo_operativo: number;
  rango_edad: string | null;
  empresa: string | null;
  tipo_vehiculo: string | null;
  capacidad_pasajeros: number | null;
  costo_extra_nombre: string | null;
  costo_extra_valor: number | null;
  descripcion: string | null;
}

const quoteSchema = z.object({
  clientName: z.string().min(1, "El nombre del cliente es requerido"),
  clientEmail: z.string().email("Correo electrónico inválido"),
  pax: z.coerce.number().min(1, "Debe ser al menos 1 persona"),
  startDate: z.string().min(1, "Selecciona una fecha de inicio"),
  endDate: z.string().min(1, "Selecciona una fecha de fin"),
  language: z.enum(["ES", "EN"]),
  destinations: z.array(z.string()).min(1, "Selecciona al menos un destino"),
  tickets: z.array(z.string()).optional(),
  insurances: z.array(z.string()).optional(),
  transports: z.array(z.string()).optional(),
  paquetes: z.array(z.string()).optional(),
});

export type QuoteFormValues = z.infer<typeof quoteSchema>;

interface Props {
  servicios: ServicioCatalogo[];
  isAdmin?: boolean;
}

/** Precio al público por unidad: costo + 30% margen + 13% IVA */
function precioPublico(costo: number): number {
  return costo * 1.3 * 1.13;
}

/** Días de tour entre dos fechas ISO. Mismo día = 1. */
function calcularDias(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 1;
  const start = new Date(startDate + "T00:00:00");
  const end = new Date(endDate + "T00:00:00");
  const diffMs = end.getTime() - start.getTime();
  if (diffMs < 0) return 1;
  return Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1);
}

export default function QuoteForm({ servicios, isAdmin = false }: Props) {
  const catalogDestinos = servicios.filter((s) => s.tipo === "DESTINO");
  const catalogEntradas = servicios.filter((s) => s.tipo === "ENTRADA");
  const catalogSeguros = servicios.filter((s) => s.tipo === "SEGURO");
  const catalogTransportes = servicios.filter((s) => s.tipo === "TRANSPORTE");
  const catalogPaquetes = servicios.filter((s) => s.tipo === "PAQUETE");

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteSchema) as unknown as Resolver<QuoteFormValues>,
    defaultValues: {
      pax: 2,
      language: "ES",
      destinations: [],
      tickets: [],
      insurances: [],
      transports: [],
      paquetes: [],
    },
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = form;

  const [pricingResult, setPricingResult] = useState({
    costoOperativo: 0,
    margen: 0,
    subtotalVenta: 0,
    iva: 0,
    granTotal: 0,
  });

  const selectedDestinations = watch("destinations");
  const selectedTickets = watch("tickets");
  const selectedInsurances = watch("insurances");
  const selectedTransports = watch("transports");
  const selectedPaquetes = watch("paquetes");
  const pax = watch("pax");
  const startDate = watch("startDate");
  const endDate = watch("endDate");

  useEffect(() => {
    let totalCost = 0;
    const currentPax = pax || 1;
    const cantidadDias = calcularDias(startDate, endDate);

    // Por pax
    selectedDestinations?.forEach((id) => {
      const s = catalogDestinos.find((d) => d.id === id);
      if (s) totalCost += s.costo_operativo * currentPax;
    });

    selectedTickets?.forEach((id) => {
      const s = catalogEntradas.find((e) => e.id === id);
      if (s) totalCost += s.costo_operativo * currentPax;
    });

    selectedInsurances?.forEach((id) => {
      const s = catalogSeguros.find((sg) => sg.id === id);
      if (s) totalCost += s.costo_operativo * currentPax;
    });

    // Paquetes: precio por persona × pax
    selectedPaquetes?.forEach((id) => {
      const s = catalogPaquetes.find((p) => p.id === id);
      if (s) totalCost += s.costo_operativo * currentPax;
    });

    // Transportes: costo por día (NO por pax) + costo extra fijo
    selectedTransports?.forEach((id) => {
      const s = catalogTransportes.find((t) => t.id === id);
      if (s) totalCost += s.costo_operativo * cantidadDias + (s.costo_extra_valor ?? 0);
    });

    setPricingResult(calculatePrice(totalCost));
  }, [selectedDestinations, selectedTickets, selectedInsurances, selectedTransports, selectedPaquetes, pax, startDate, endDate]);

  // Lista de nombres de todos los servicios seleccionados
  const allSelectedIds = [
    ...(selectedDestinations ?? []),
    ...(selectedTickets ?? []),
    ...(selectedInsurances ?? []),
    ...(selectedTransports ?? []),
    ...(selectedPaquetes ?? []),
  ];
  const selectedServiceNames = allSelectedIds
    .map((id) => servicios.find((s) => s.id === id)?.nombre_es)
    .filter((name): name is string => Boolean(name));

  const onSubmit: SubmitHandler<QuoteFormValues> = async (data) => {
    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, pricing: pricingResult }),
      });

      if (!response.ok) {
        throw new Error("Error al enviar la cotización");
      }

      alert("Cotización generada y automatización disparada con éxito!");
    } catch (error) {
      console.error(error);
      alert("Hubo un error al procesar la cotización.");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Columna Principal - Formulario */}
      <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#004b23]">Generar Propuesta</h2>
          <p className="text-zinc-500 text-sm mt-1">
            Complete los detalles para automatizar la cotización.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Datos del Cliente */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Nombre del Cliente
              </label>
              <input
                {...register("clientName")}
                className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-[#f77f00] focus:border-transparent outline-none transition-all text-black placeholder:text-gray-400"
                placeholder="Ej. Jane Doe"
              />
              {errors.clientName && (
                <p className="text-red-500 text-xs mt-1">{errors.clientName.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Correo Electrónico
              </label>
              <input
                {...register("clientEmail")}
                className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-[#f77f00] focus:border-transparent outline-none transition-all text-black placeholder:text-gray-400"
                placeholder="ejemplo@correo.com"
              />
              {errors.clientEmail && (
                <p className="text-red-500 text-xs mt-1">{errors.clientEmail.message}</p>
              )}
            </div>
          </div>

          {/* Datos del Viaje */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Pasajeros (Pax)
              </label>
              <input
                type="number"
                {...register("pax")}
                className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-[#f77f00] focus:border-transparent outline-none transition-all text-black"
              />
              {errors.pax && (
                <p className="text-red-500 text-xs mt-1">{errors.pax.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Fecha Inicio
              </label>
              <input
                type="date"
                {...register("startDate")}
                className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-[#f77f00] focus:border-transparent outline-none transition-all text-black"
              />
              {errors.startDate && (
                <p className="text-red-500 text-xs mt-1">{errors.startDate.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Fecha Fin
              </label>
              <input
                type="date"
                {...register("endDate")}
                className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-[#f77f00] focus:border-transparent outline-none transition-all text-black"
              />
              {errors.endDate && (
                <p className="text-red-500 text-xs mt-1">{errors.endDate.message}</p>
              )}
            </div>
          </div>

          {/* Idioma */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Idioma Preferido de la Propuesta
            </label>
            <Controller
              name="language"
              control={control}
              render={({ field }) => (
                <div className="flex bg-zinc-100 p-1 rounded-lg w-fit">
                  <button
                    type="button"
                    onClick={() => field.onChange("ES")}
                    className={`px-6 py-1.5 rounded-md text-sm font-medium transition-all ${
                      field.value === "ES"
                        ? "bg-white shadow-sm text-[#004b23]"
                        : "text-zinc-500 hover:text-zinc-700"
                    }`}
                  >
                    Español
                  </button>
                  <button
                    type="button"
                    onClick={() => field.onChange("EN")}
                    className={`px-6 py-1.5 rounded-md text-sm font-medium transition-all ${
                      field.value === "EN"
                        ? "bg-white shadow-sm text-[#004b23]"
                        : "text-zinc-500 hover:text-zinc-700"
                    }`}
                  >
                    English
                  </button>
                </div>
              )}
            />
          </div>

          <div className="border-t border-zinc-100 pt-6">
            <h3 className="text-lg font-semibold text-zinc-800 mb-4">Servicios del Tour</h3>

            {/* Paquetes */}
            {catalogPaquetes.length > 0 && (
              <div className="mb-5">
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Paquetes Disponibles
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {catalogPaquetes.map((s) => (
                    <label
                      key={s.id}
                      className="flex items-start space-x-3 p-4 border border-zinc-200 rounded-lg cursor-pointer hover:bg-zinc-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        value={s.id}
                        {...register("paquetes")}
                        className="w-4 h-4 mt-0.5 text-[#f77f00] rounded border-zinc-300 focus:ring-[#f77f00] shrink-0"
                      />
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold text-zinc-800">{s.nombre_es}</span>
                        {s.descripcion && (
                          <p className="text-xs text-zinc-500 whitespace-pre-line leading-relaxed">
                            {s.descripcion}
                          </p>
                        )}
                        {isAdmin ? (
                          <span className="text-xs text-zinc-500 mt-1">
                            Costo: ${s.costo_operativo.toFixed(2)} / pax
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-500 mt-1">
                            ${precioPublico(s.costo_operativo).toFixed(2)} / pax
                          </span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Separador de servicios individuales */}
            <div className="mb-5">
              <h3 className="text-base font-bold text-zinc-800 border-b border-zinc-200 pb-2">
                Personalizar tu paquete
              </h3>
            </div>

            {/* Destinos */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-zinc-700 mb-2">Destinos</label>
              {catalogDestinos.length === 0 ? (
                <p className="text-sm text-zinc-400 italic">No hay destinos disponibles en el catálogo.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {catalogDestinos.map((s) => (
                    <label
                      key={s.id}
                      className="flex items-center space-x-3 p-3 border border-zinc-200 rounded-lg cursor-pointer hover:bg-zinc-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        value={s.id}
                        {...register("destinations")}
                        className="w-4 h-4 text-[#f77f00] rounded border-zinc-300 focus:ring-[#f77f00]"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-zinc-800">{s.nombre_es}</span>
                        {isAdmin ? (
                          <span className="text-xs text-zinc-500">Costo: ${s.costo_operativo.toFixed(2)} / pax</span>
                        ) : (
                          <span className="text-xs text-zinc-500">${precioPublico(s.costo_operativo).toFixed(2)} / pax</span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
              {errors.destinations && (
                <p className="text-red-500 text-xs mt-1">{errors.destinations.message}</p>
              )}
            </div>

            {/* Transportes */}
            {catalogTransportes.length > 0 && (
              <div className="mb-5">
                <label className="block text-sm font-medium text-zinc-700 mb-2">Transporte</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {catalogTransportes.map((s) => (
                    <label
                      key={s.id}
                      className="flex items-center space-x-3 p-3 border border-zinc-200 rounded-lg cursor-pointer hover:bg-zinc-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        value={s.id}
                        {...register("transports")}
                        className="w-4 h-4 text-[#f77f00] rounded border-zinc-300 focus:ring-[#f77f00]"
                      />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-zinc-800">{s.nombre_es}</span>
                        <span className="text-xs text-zinc-500 flex flex-wrap gap-2">
                          {s.tipo_vehiculo && <span>{s.tipo_vehiculo}</span>}
                          {s.capacidad_pasajeros && <span>· {s.capacidad_pasajeros} pax</span>}
                          {s.empresa && <span>· {s.empresa}</span>}
                        </span>
                        {isAdmin ? (
                          <span className="text-xs text-zinc-500">
                            Costo: ${s.costo_operativo.toFixed(2)} / día
                            {s.costo_extra_nombre && s.costo_extra_valor
                              ? ` + $${s.costo_extra_valor.toFixed(2)} (${s.costo_extra_nombre})`
                              : ""}
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-500">${precioPublico(s.costo_operativo).toFixed(2)} / día</span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Entradas */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-zinc-700 mb-2">Entradas a Atracciones</label>
              {catalogEntradas.length === 0 ? (
                <p className="text-sm text-zinc-400 italic">No hay entradas disponibles en el catálogo.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {catalogEntradas.map((s) => (
                    <label
                      key={s.id}
                      className="flex items-center space-x-3 p-3 border border-zinc-200 rounded-lg cursor-pointer hover:bg-zinc-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        value={s.id}
                        {...register("tickets")}
                        className="w-4 h-4 text-[#f77f00] rounded border-zinc-300 focus:ring-[#f77f00]"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-zinc-800">{s.nombre_es}</span>
                        {isAdmin ? (
                          <span className="text-xs text-zinc-500">Costo: ${s.costo_operativo.toFixed(2)} / pax</span>
                        ) : (
                          <span className="text-xs text-zinc-500">${precioPublico(s.costo_operativo).toFixed(2)} / pax</span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Seguros */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-zinc-700 mb-2">Seguros (por rango de edad)</label>
              {catalogSeguros.length === 0 ? (
                <p className="text-sm text-zinc-400 italic">No hay seguros disponibles en el catálogo.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {catalogSeguros.map((s) => (
                    <label
                      key={s.id}
                      className="flex items-center space-x-3 p-3 border border-zinc-200 rounded-lg cursor-pointer hover:bg-zinc-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        value={s.id}
                        {...register("insurances")}
                        className="w-4 h-4 text-[#f77f00] rounded border-zinc-300 focus:ring-[#f77f00]"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-zinc-800">
                          {s.nombre_es}
                          {s.rango_edad && (
                            <span className="ml-1 text-xs text-zinc-400">({s.rango_edad})</span>
                          )}
                        </span>
                        {isAdmin ? (
                          <span className="text-xs text-zinc-500">Costo: ${s.costo_operativo.toFixed(2)} / pax</span>
                        ) : (
                          <span className="text-xs text-zinc-500">${precioPublico(s.costo_operativo).toFixed(2)} / pax</span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Columna Lateral - Resumen */}
      <div className="w-full lg:w-80 flex flex-col gap-4">
        <div className="bg-[#004b23] text-white p-6 rounded-2xl shadow-md sticky top-6">
          <h3 className="text-lg font-bold mb-4">Resumen de Cotización</h3>

          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center pb-3 border-b border-white/20">
              <span className="text-emerald-100">Pasajeros:</span>
              <span className="font-medium">{pax || 0}</span>
            </div>
            {startDate && endDate && (
              <div className="flex justify-between items-center pb-3 border-b border-white/20">
                <span className="text-emerald-100">Días del tour:</span>
                <span className="font-medium">{calcularDias(startDate, endDate)}</span>
              </div>
            )}

            {selectedServiceNames.length > 0 && (
              <div className="pb-3 border-b border-white/20">
                <p className="text-emerald-100 mb-2">Servicios incluidos:</p>
                <ul className="space-y-1">
                  {selectedServiceNames.map((name) => (
                    <li key={name} className="flex items-start gap-1.5 text-xs">
                      <span className="text-[#f77f00] mt-0.5 shrink-0">✓</span>
                      <span>{name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {isAdmin ? (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-emerald-100">Costo Operativo:</span>
                  <span>${pricingResult.costoOperativo.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-emerald-100">Margen (30%):</span>
                  <span>${pricingResult.margen.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-white/20">
                  <span className="text-emerald-100">Subtotal Venta:</span>
                  <span>${pricingResult.subtotalVenta.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-white/20">
                  <span className="text-emerald-100">IVA (13%):</span>
                  <span>${pricingResult.iva.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold pt-2 text-[#f77f00]">
                  <span>Gran Total:</span>
                  <span>${pricingResult.granTotal.toFixed(2)}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center text-lg font-bold pt-2 text-[#f77f00]">
                  <span>Total a Pagar:</span>
                  <span>${pricingResult.granTotal.toFixed(2)}</span>
                </div>
                <p className="text-xs text-emerald-100/80 text-center pt-1">
                  Todos los precios incluyen IVA
                </p>
              </>
            )}
          </div>

          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="w-full mt-8 bg-[#f77f00] hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-orange-500/30 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Procesando...
              </span>
            ) : (
              "Generar y Automatizar"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
