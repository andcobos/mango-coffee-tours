"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller, SubmitHandler, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PDFDownloadLink } from "@react-pdf/renderer";
import CotizacionPDF from "./pdf/CotizacionPDF";
import { guardarCotizacion } from "@/app/actions/cotizaciones";

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
  nivel_esfuerzo: string | null;
  imagen_url: string | null;
  link_google_maps: string | null;
  link_punto_encuentro: string | null;
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
  seguros: z.record(z.string(), z.number()).optional(),
  transports: z.array(z.string()).optional(),
  paquetes: z.array(z.string()).optional(),
  extras: z.array(z.string()).optional(),
  guias: z.array(z.string()).optional(),
  alimentacion: z.array(z.string()).optional(),
  kits: z.array(z.string()).optional(),
  alojamientos: z.array(z.string()).optional(),
  otros: z.array(z.string()).optional(),
  notas: z.string().optional(),
  margen_cotizacion: z.coerce.number().min(0).max(100).optional(),
  descuento_porcentaje: z.coerce.number().min(0).max(100).optional(),
});

export type QuoteFormValues = z.infer<typeof quoteSchema>;

interface Props {
  servicios: ServicioCatalogo[];
  isAdmin?: boolean;
  margenGlobal?: number;
}


/** Indicador visual de nivel de esfuerzo (3 barritas tipo señal) */
function NivelEsfuerzoIndicator({ nivel }: { nivel: string }) {
  const colors =
    nivel === "BAJO"
      ? ["bg-green-500", "bg-gray-300", "bg-gray-300"]
      : nivel === "INTERMEDIO"
      ? ["bg-orange-500", "bg-orange-500", "bg-gray-300"]
      : ["bg-red-500", "bg-red-500", "bg-red-500"];

  const label = nivel === "BAJO" ? "Bajo" : nivel === "INTERMEDIO" ? "Intermedio" : "Alto";

  return (
    <div
      title={`Esfuerzo: ${label}`}
      className="absolute top-2 left-2 flex items-end gap-0.5 bg-black/40 backdrop-blur-sm rounded px-1.5 py-1"
    >
      <div className={`w-1.5 h-3 rounded-sm ${colors[0]}`} />
      <div className={`w-1.5 h-4 rounded-sm ${colors[1]}`} />
      <div className={`w-1.5 h-5 rounded-sm ${colors[2]}`} />
    </div>
  );
}

function generarCodigoReferencia(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
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

export default function QuoteForm({ servicios, isAdmin = false, margenGlobal = 30 }: Props) {
  const catalogDestinos = servicios.filter((s) => s.tipo === "DESTINO");
  const catalogEntradas = servicios.filter((s) => s.tipo === "ENTRADA");
  const catalogSeguros = servicios.filter((s) => s.tipo === "SEGURO");
  const catalogTransportes = servicios.filter((s) => s.tipo === "TRANSPORTE");
  const catalogPaquetes = servicios.filter((s) => s.tipo === "PAQUETE");
  const catalogExtras = servicios.filter((s) => s.tipo === "EXTRA");
  const catalogGuias = servicios.filter((s) => s.tipo === "GUIA");
  const catalogAlimentacion = servicios.filter((s) => s.tipo === "ALIMENTACION");
  const catalogKits = servicios.filter((s) => s.tipo === "KIT");
  const catalogAlojamientos = servicios.filter((s) => s.tipo === "ALOJAMIENTO");
  const catalogOtros = servicios.filter((s) => s.tipo === "OTRO");

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteSchema) as unknown as Resolver<QuoteFormValues>,
    defaultValues: {
      pax: 2,
      language: "ES",
      destinations: [],
      tickets: [],
      seguros: {},
      transports: [],
      paquetes: [],
      extras: [],
      guias: [],
      alimentacion: [],
      kits: [],
      alojamientos: [],
      otros: [],
      notas: "",
      margen_cotizacion: margenGlobal,
      descuento_porcentaje: 0,
    },
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  const [isClient, setIsClient] = useState(false);
  const [codigoReferencia] = useState(() => generarCodigoReferencia());

  useEffect(() => {
    setIsClient(true);
  }, []);

  const [pricingResult, setPricingResult] = useState({
    costoOperativo: 0,
    margen: 0,
    subtotalVenta: 0,
    iva: 0,
    granTotal: 0,
    descuento: 0,
    totalFinal: 0,
  });

  const pax = watch("pax");
  const startDate = watch("startDate");
  const endDate = watch("endDate");
  const margen_cotizacion = watch("margen_cotizacion");
  const descuento_porcentaje = watch("descuento_porcentaje");
  const selectedDestinations = watch("destinations");
  const selectedTickets = watch("tickets");
  const selectedSeguros = watch("seguros") || {};
  const selectedTransports = watch("transports");
  const selectedPaquetes = watch("paquetes");
  const selectedExtras = watch("extras");
  const selectedGuias = watch("guias");
  const selectedAlimentacion = watch("alimentacion");
  const selectedKits = watch("kits");
  const selectedAlojamientos = watch("alojamientos");
  const selectedOtros = watch("otros");

  const currentPax = Number(pax) || 1;
  const totalSegurosSeleccionados = Object.values(selectedSeguros).reduce((a, b) => a + b, 0);

  /** Precio público unitario usando el margen dinámico actual + IVA 13% */
  const getPrecioPublicoUnitario = (costoOperativo: number): number => {
    const m = Math.min(Number(margen_cotizacion ?? margenGlobal), 99.99) / 100;
    return (costoOperativo / (1 - m)) * 1.13;
  };

  useEffect(() => {
    let totalCost = 0;
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

    // Seguros: costo por cantidad elegida individualmente (NO por currentPax)
    Object.entries(selectedSeguros).forEach(([id, qty]) => {
      if (qty > 0) {
        const s = catalogSeguros.find((sg) => sg.id === id);
        if (s) totalCost += s.costo_operativo * qty;
      }
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

    // Extras: tarifa plana (NO multiplica por pax ni por días)
    selectedExtras?.forEach((id) => {
      const s = catalogExtras.find((e) => e.id === id);
      if (s) totalCost += s.costo_operativo * 1;
    });

    // Por pax: guías, alimentación, kits, alojamientos, otros
    selectedGuias?.forEach((id) => {
      const s = catalogGuias.find((g) => g.id === id);
      if (s) totalCost += s.costo_operativo * currentPax;
    });

    selectedAlimentacion?.forEach((id) => {
      const s = catalogAlimentacion.find((a) => a.id === id);
      if (s) totalCost += s.costo_operativo * currentPax;
    });

    selectedKits?.forEach((id) => {
      const s = catalogKits.find((k) => k.id === id);
      if (s) totalCost += s.costo_operativo * currentPax;
    });

    selectedAlojamientos?.forEach((id) => {
      const s = catalogAlojamientos.find((a) => a.id === id);
      if (s) totalCost += s.costo_operativo * currentPax;
    });

    selectedOtros?.forEach((id) => {
      const s = catalogOtros.find((o) => o.id === id);
      if (s) totalCost += s.costo_operativo * currentPax;
    });

    // Number() explícito en todos los valores volátiles del formulario
    const margenDecimal = Math.min(Number(margen_cotizacion ?? margenGlobal), 99.99) / 100;
    const subtotalVenta = totalCost / (1 - margenDecimal);
    const iva = subtotalVenta * 0.13;
    const granTotal = subtotalVenta + iva;
    const descuentoMonto = granTotal * ((Number(descuento_porcentaje) || 0) / 100);
    const totalFinal = granTotal - descuentoMonto;

    console.log("MATH DEBUG:", { totalCost, margenDecimal, subtotalVenta, iva, granTotal, descuentoMonto, totalFinal });

    setPricingResult({
      costoOperativo: totalCost,
      margen: subtotalVenta - totalCost,
      subtotalVenta,
      iva,
      granTotal,
      descuento: descuentoMonto,
      totalFinal,
    });
  }, [selectedDestinations, selectedTickets, selectedSeguros, selectedTransports, selectedPaquetes, selectedExtras, selectedGuias, selectedAlimentacion, selectedKits, selectedAlojamientos, selectedOtros, margen_cotizacion, descuento_porcentaje, currentPax, startDate, endDate]);

  // Lista de nombres de todos los servicios seleccionados
  const allSelectedIds = [
    ...(selectedDestinations ?? []),
    ...(selectedTickets ?? []),
    ...(selectedTransports ?? []),
    ...(selectedPaquetes ?? []),
    ...(selectedExtras ?? []),
    ...(selectedGuias ?? []),
    ...(selectedAlimentacion ?? []),
    ...(selectedKits ?? []),
    ...(selectedAlojamientos ?? []),
    ...(selectedOtros ?? []),
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
                placeholder="Ej. Juan Perez"
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
                      className="relative flex flex-col border border-zinc-200 rounded-lg cursor-pointer hover:bg-zinc-50 transition-colors overflow-hidden"
                    >
                      {/* Imagen del paquete */}
                      {s.imagen_url && (
                        <img
                          src={s.imagen_url}
                          alt={s.nombre_es}
                          className="w-full h-40 object-cover"
                        />
                      )}

                      {/* Indicador de nivel de esfuerzo (absoluto sobre la tarjeta) */}
                      {s.nivel_esfuerzo && (
                        <NivelEsfuerzoIndicator nivel={s.nivel_esfuerzo} />
                      )}

                      {/* Contenido */}
                      <div className="flex items-start space-x-3 p-4">
                        <input
                          type="checkbox"
                          value={s.id}
                          {...register("paquetes")}
                          className="w-4 h-4 mt-0.5 text-[#f77f00] rounded border-zinc-300 focus:ring-[#f77f00] shrink-0"
                        />
                        <div className="flex flex-col gap-1 flex-1">
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
                              ${getPrecioPublicoUnitario(s.costo_operativo).toFixed(2)} / pax
                            </span>
                          )}

                          {/* Links de ubicación */}
                          {(s.link_google_maps || s.link_punto_encuentro) && (
                            <div className="flex flex-wrap gap-3 mt-2">
                              {s.link_google_maps && (
                                <a
                                  href={s.link_google_maps}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-1 text-xs text-[#004b23] hover:underline"
                                >
                                  <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                  </svg>
                                  Ver en Google Maps
                                </a>
                              )}
                              {s.link_punto_encuentro && (
                                <a
                                  href={s.link_punto_encuentro}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-1 text-xs text-[#004b23] hover:underline"
                                >
                                  <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                  </svg>
                                  Punto de Encuentro
                                </a>
                              )}
                            </div>
                          )}
                        </div>
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
                          <span className="text-xs text-zinc-500">${getPrecioPublicoUnitario(s.costo_operativo).toFixed(2)} / pax</span>
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
                          <span className="text-xs text-zinc-500">${getPrecioPublicoUnitario(s.costo_operativo).toFixed(2)} / día</span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Guías */}
            {catalogGuias.length > 0 && (
              <div className="mb-5">
                <label className="block text-sm font-medium text-zinc-700 mb-2">Guías</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {catalogGuias.map((s) => (
                    <label
                      key={s.id}
                      className="flex items-center space-x-3 p-3 border border-zinc-200 rounded-lg cursor-pointer hover:bg-zinc-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        value={s.id}
                        {...register("guias")}
                        className="w-4 h-4 text-[#f77f00] rounded border-zinc-300 focus:ring-[#f77f00]"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-zinc-800">{s.nombre_es}</span>
                        {isAdmin ? (
                          <span className="text-xs text-zinc-500">Costo: ${s.costo_operativo.toFixed(2)} / pax</span>
                        ) : (
                          <span className="text-xs text-zinc-500">${getPrecioPublicoUnitario(s.costo_operativo).toFixed(2)} / pax</span>
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
                          <span className="text-xs text-zinc-500">${getPrecioPublicoUnitario(s.costo_operativo).toFixed(2)} / pax</span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Alojamiento */}
            {catalogAlojamientos.length > 0 && (
              <div className="mb-5">
                <label className="block text-sm font-medium text-zinc-700 mb-2">Alojamiento</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {catalogAlojamientos.map((s) => (
                    <label
                      key={s.id}
                      className="flex items-center space-x-3 p-3 border border-zinc-200 rounded-lg cursor-pointer hover:bg-zinc-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        value={s.id}
                        {...register("alojamientos")}
                        className="w-4 h-4 text-[#f77f00] rounded border-zinc-300 focus:ring-[#f77f00]"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-zinc-800">{s.nombre_es}</span>
                        {isAdmin ? (
                          <span className="text-xs text-zinc-500">Costo: ${s.costo_operativo.toFixed(2)} / pax</span>
                        ) : (
                          <span className="text-xs text-zinc-500">${getPrecioPublicoUnitario(s.costo_operativo).toFixed(2)} / pax</span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Alimentación */}
            {catalogAlimentacion.length > 0 && (
              <div className="mb-5">
                <label className="block text-sm font-medium text-zinc-700 mb-2">Alimentación</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {catalogAlimentacion.map((s) => (
                    <label
                      key={s.id}
                      className="flex items-center space-x-3 p-3 border border-zinc-200 rounded-lg cursor-pointer hover:bg-zinc-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        value={s.id}
                        {...register("alimentacion")}
                        className="w-4 h-4 text-[#f77f00] rounded border-zinc-300 focus:ring-[#f77f00]"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-zinc-800">{s.nombre_es}</span>
                        {isAdmin ? (
                          <span className="text-xs text-zinc-500">Costo: ${s.costo_operativo.toFixed(2)} / pax</span>
                        ) : (
                          <span className="text-xs text-zinc-500">${getPrecioPublicoUnitario(s.costo_operativo).toFixed(2)} / pax</span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Kits */}
            {catalogKits.length > 0 && (
              <div className="mb-5">
                <label className="block text-sm font-medium text-zinc-700 mb-2">Kits</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {catalogKits.map((s) => (
                    <label
                      key={s.id}
                      className="flex items-center space-x-3 p-3 border border-zinc-200 rounded-lg cursor-pointer hover:bg-zinc-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        value={s.id}
                        {...register("kits")}
                        className="w-4 h-4 text-[#f77f00] rounded border-zinc-300 focus:ring-[#f77f00]"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-zinc-800">{s.nombre_es}</span>
                        {isAdmin ? (
                          <span className="text-xs text-zinc-500">Costo: ${s.costo_operativo.toFixed(2)} / pax</span>
                        ) : (
                          <span className="text-xs text-zinc-500">${getPrecioPublicoUnitario(s.costo_operativo).toFixed(2)} / pax</span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Seguros */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-zinc-700">Seguros (por rango de edad)</label>
                <span className="text-xs text-zinc-400">{totalSegurosSeleccionados}/{currentPax} asignados</span>
              </div>
              {catalogSeguros.length === 0 ? (
                <p className="text-sm text-zinc-400 italic">No hay seguros disponibles en el catálogo.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {catalogSeguros.map((s) => {
                    const qty = selectedSeguros[s.id] || 0;
                    return (
                      <div
                        key={s.id}
                        className="flex items-center justify-between p-3 border border-zinc-200 rounded-lg bg-white"
                      >
                        <div className="flex flex-col min-w-0 mr-3">
                          <span className="text-sm font-medium text-zinc-800 truncate">
                            {s.nombre_es}
                            {s.rango_edad && (
                              <span className="ml-1 text-xs text-zinc-400">({s.rango_edad})</span>
                            )}
                          </span>
                          {isAdmin ? (
                            <span className="text-xs text-zinc-500">Costo: ${s.costo_operativo.toFixed(2)} / u</span>
                          ) : (
                            <span className="text-xs text-zinc-500">${getPrecioPublicoUnitario(s.costo_operativo).toFixed(2)} / u</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            disabled={qty === 0}
                            onClick={() =>
                              setValue("seguros", { ...selectedSeguros, [s.id]: qty - 1 })
                            }
                            className="w-7 h-7 rounded-full border border-zinc-300 text-zinc-600 flex items-center justify-center text-lg leading-none hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            −
                          </button>
                          <span className="w-5 text-center text-sm font-semibold text-zinc-800">{qty}</span>
                          <button
                            type="button"
                            disabled={totalSegurosSeleccionados >= currentPax}
                            onClick={() =>
                              setValue("seguros", { ...selectedSeguros, [s.id]: qty + 1 })
                            }
                            className="w-7 h-7 rounded-full border border-zinc-300 text-zinc-600 flex items-center justify-center text-lg leading-none hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Otros */}
            {catalogOtros.length > 0 && (
              <div className="mb-5">
                <label className="block text-sm font-medium text-zinc-700 mb-2">Otros Servicios</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {catalogOtros.map((s) => (
                    <label
                      key={s.id}
                      className="flex items-center space-x-3 p-3 border border-zinc-200 rounded-lg cursor-pointer hover:bg-zinc-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        value={s.id}
                        {...register("otros")}
                        className="w-4 h-4 text-[#f77f00] rounded border-zinc-300 focus:ring-[#f77f00]"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-zinc-800">{s.nombre_es}</span>
                        {isAdmin ? (
                          <span className="text-xs text-zinc-500">Costo: ${s.costo_operativo.toFixed(2)} / pax</span>
                        ) : (
                          <span className="text-xs text-zinc-500">${getPrecioPublicoUnitario(s.costo_operativo).toFixed(2)} / pax</span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Extras Adicionales */}
            {catalogExtras.length > 0 && (
              <div className="mb-5">
                <label className="block text-sm font-medium text-zinc-700 mb-2">Extras Adicionales</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {catalogExtras.map((s) => (
                    <label
                      key={s.id}
                      className="flex items-center space-x-3 p-3 border border-zinc-200 rounded-lg cursor-pointer hover:bg-zinc-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        value={s.id}
                        {...register("extras")}
                        className="w-4 h-4 text-[#f77f00] rounded border-zinc-300 focus:ring-[#f77f00]"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-zinc-800">{s.nombre_es}</span>
                        {isAdmin ? (
                          <span className="text-xs text-zinc-500">Costo: ${s.costo_operativo.toFixed(2)} (tarifa plana)</span>
                        ) : (
                          <span className="text-xs text-zinc-500">${getPrecioPublicoUnitario(s.costo_operativo).toFixed(2)} (tarifa plana)</span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notas o consideraciones especiales */}
          <div className="border-t border-zinc-100 pt-6">
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Notas o consideraciones especiales
            </label>
            <p className="text-xs text-zinc-400 mb-2">
              Dinos si tienes alergias, peticiones especiales o cualquier detalle que debamos saber para tu viaje.
            </p>
            <textarea
              {...register("notas")}
              rows={4}
              placeholder="Ej. Uno de los pasajeros es celíaco, preferimos habitaciones en planta baja..."
              className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-[#f77f00] focus:border-transparent outline-none transition-all text-black placeholder:text-gray-400 resize-y"
            />
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

            {(selectedServiceNames.length > 0 || totalSegurosSeleccionados > 0) && (
              <div className="pb-3 border-b border-white/20">
                <p className="text-emerald-100 mb-2">Servicios incluidos:</p>
                <ul className="space-y-1">
                  {selectedServiceNames.map((name) => (
                    <li key={name} className="flex items-start gap-1.5 text-xs">
                      <span className="text-[#f77f00] mt-0.5 shrink-0">✓</span>
                      <span>{name}</span>
                    </li>
                  ))}
                  {Object.entries(selectedSeguros)
                    .filter(([, qty]) => qty > 0)
                    .map(([id, qty]) => {
                      const s = catalogSeguros.find((sg) => sg.id === id);
                      if (!s) return null;
                      return (
                        <li key={id} className="flex items-start justify-between gap-1.5 text-xs">
                          <span className="flex items-start gap-1.5">
                            <span className="text-[#f77f00] mt-0.5 shrink-0">✓</span>
                            <span>{qty}x {s.nombre_es}</span>
                          </span>
                          <span className="text-emerald-200 shrink-0">
                            ${(getPrecioPublicoUnitario(s.costo_operativo) * qty).toFixed(2)}
                          </span>
                        </li>
                      );
                    })}
                </ul>
              </div>
            )}

            {isAdmin ? (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-emerald-100">Costo Operativo:</span>
                  <span>${pricingResult.costoOperativo.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2 pb-1">
                  <span className="text-emerald-100 shrink-0">Margen (%):</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={margen_cotizacion ?? ''}
                    placeholder={String(margenGlobal)}
                    onChange={(e) =>
                      setValue(
                        "margen_cotizacion",
                        e.target.value === '' ? undefined : Number(e.target.value)
                      )
                    }
                    className="w-16 px-1.5 py-0.5 rounded text-sm text-black bg-white border border-white/30 text-right"
                  />
                  <span className="ml-auto">${pricingResult.margen.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-white/20">
                  <span className="text-emerald-100">Subtotal Venta:</span>
                  <span>${pricingResult.subtotalVenta.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-white/20">
                  <span className="text-emerald-100">IVA (13%):</span>
                  <span>${pricingResult.iva.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2 pb-3 border-b border-white/20">
                  <span className="text-emerald-100 shrink-0">Descuento (%):</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={descuento_porcentaje ?? ''}
                    placeholder="0"
                    onChange={(e) =>
                      setValue(
                        "descuento_porcentaje",
                        e.target.value === '' ? undefined : Number(e.target.value)
                      )
                    }
                    className="w-16 px-1.5 py-0.5 rounded text-sm text-black bg-white border border-white/30 text-right"
                  />
                  <span className="ml-auto text-red-300">-${pricingResult.descuento.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold pt-2 text-[#f77f00]">
                  <span>Gran Total:</span>
                  <span>${pricingResult.totalFinal.toFixed(2)}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center text-lg font-bold pt-2 text-[#f77f00]">
                  <span>Total a Pagar:</span>
                  <span>${pricingResult.totalFinal.toFixed(2)}</span>
                </div>
                <p className="text-xs text-emerald-100/80 text-center pt-1">
                  Todos los precios incluyen IVA
                </p>
              </>
            )}
          </div>

          {/* TODO: Habilitar el botón de automatización en la Fase 2. */}
          {/* <button
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
          </button> */}

          {isClient && (() => {
            const esPaquete = (selectedPaquetes ?? []).length > 0;
            const paqueteSeleccionado = esPaquete
              ? catalogPaquetes.find((p) => p.id === selectedPaquetes![0])
              : undefined;

            const cantidadDias = calcularDias(startDate, endDate);
            const serviciosPDF = [
              ...(selectedDestinations ?? []).map((id) => {
                const s = catalogDestinos.find((d) => d.id === id);
                return s ? { nombre: s.nombre_es, precio: getPrecioPublicoUnitario(s.costo_operativo) * currentPax } : null;
              }),
              ...(selectedTickets ?? []).map((id) => {
                const s = catalogEntradas.find((e) => e.id === id);
                return s ? { nombre: s.nombre_es, precio: getPrecioPublicoUnitario(s.costo_operativo) * currentPax } : null;
              }),
              ...(selectedTransports ?? []).map((id) => {
                const s = catalogTransportes.find((t) => t.id === id);
                return s ? { nombre: s.nombre_es, precio: getPrecioPublicoUnitario(s.costo_operativo) * cantidadDias + (s.costo_extra_valor ?? 0) } : null;
              }),
              ...(selectedExtras ?? []).map((id) => {
                const s = catalogExtras.find((e) => e.id === id);
                return s ? { nombre: s.nombre_es, precio: getPrecioPublicoUnitario(s.costo_operativo) } : null;
              }),
              ...(selectedGuias ?? []).map((id) => {
                const s = catalogGuias.find((g) => g.id === id);
                return s ? { nombre: s.nombre_es, precio: getPrecioPublicoUnitario(s.costo_operativo) * currentPax } : null;
              }),
              ...(selectedAlimentacion ?? []).map((id) => {
                const s = catalogAlimentacion.find((a) => a.id === id);
                return s ? { nombre: s.nombre_es, precio: getPrecioPublicoUnitario(s.costo_operativo) * currentPax } : null;
              }),
              ...(selectedKits ?? []).map((id) => {
                const s = catalogKits.find((k) => k.id === id);
                return s ? { nombre: s.nombre_es, precio: getPrecioPublicoUnitario(s.costo_operativo) * currentPax } : null;
              }),
              ...(selectedAlojamientos ?? []).map((id) => {
                const s = catalogAlojamientos.find((a) => a.id === id);
                return s ? { nombre: s.nombre_es, precio: getPrecioPublicoUnitario(s.costo_operativo) * currentPax } : null;
              }),
              ...(selectedOtros ?? []).map((id) => {
                const s = catalogOtros.find((o) => o.id === id);
                return s ? { nombre: s.nombre_es, precio: getPrecioPublicoUnitario(s.costo_operativo) * currentPax } : null;
              }),
              ...Object.entries(selectedSeguros)
                .filter(([, qty]) => qty > 0)
                .map(([id, qty]) => {
                  const s = catalogSeguros.find((sg) => sg.id === id);
                  return s ? { nombre: `${qty}x ${s.nombre_es}`, precio: getPrecioPublicoUnitario(s.costo_operativo) * qty } : null;
                }),
            ].filter((item): item is { nombre: string; precio: number } => item !== null);

            const clienteName = watch("clientName") ?? "";
            const clienteEmail = watch("clientEmail") ?? "";
            const language = watch("language") ?? "ES";
            const notas = watch("notas") ?? "";

            const dataCotizacion = {
              nombre: clienteName,
              correo: clienteEmail,
              pax: currentPax,
              fechaInicio: startDate ?? "",
              fechaFin: endDate ?? "",
              idioma: language,
              subtotal_costo: pricingResult.costoOperativo,
              margen_aplicado: Number(margen_cotizacion ?? margenGlobal) / 100,
              subtotal_venta: pricingResult.subtotalVenta,
              iva_total: pricingResult.iva,
              gran_total: pricingResult.totalFinal,
              detalles: serviciosPDF,
              es_paquete: esPaquete,
              notas: notas || undefined,
              codigo_referencia: codigoReferencia,
            };

            return (
              <div onClick={() => guardarCotizacion(dataCotizacion).catch(console.error)}>
                <PDFDownloadLink
                  document={
                    <CotizacionPDF
                      nombre={clienteName}
                      correo={clienteEmail}
                      fechaInicio={startDate ?? ""}
                      fechaFin={endDate ?? ""}
                      pax={currentPax}
                      esPaquete={esPaquete}
                      paqueteNombre={paqueteSeleccionado?.nombre_es}
                      paqueteDescripcion={paqueteSeleccionado?.descripcion ?? undefined}
                      servicios={serviciosPDF}
                      totalFinal={pricingResult.totalFinal}
                      codigoReferencia={codigoReferencia}
                      notas={notas || undefined}
                    />
                  }
                  fileName={`cotizacion-${clienteName.replace(/\s+/g, "-").toLowerCase() || "cliente"}.pdf`}
                  className="w-full mt-3 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
                >
                  {({ loading }) =>
                    loading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Generando PDF...
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Descargar y Generar Cotización
                      </>
                    )
                  }
                </PDFDownloadLink>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
