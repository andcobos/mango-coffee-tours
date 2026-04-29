"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller, SubmitHandler, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { calculatePrice } from "@/lib/calculator";

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
});

export type QuoteFormValues = z.infer<typeof quoteSchema>;

// Mock data para la iteración 1 (Quick Wins)
const MOCK_CATALOG = {
  destinations: [
    { id: "dest-1", name: "Tour Volcán Arenal", cost: 50 },
    { id: "dest-2", name: "Reserva Bosque Nuboso Monteverde", cost: 65 },
    { id: "dest-3", name: "Parque Nacional Manuel Antonio", cost: 40 },
  ],
  tickets: [
    { id: "tic-1", name: "Entrada Termales", cost: 35 },
    { id: "tic-2", name: "Teleférico", cost: 45 },
  ],
  insurances: [
    { id: "ins-1", name: "Seguro Básico (0-65 años)", cost: 10 },
    { id: "ins-2", name: "Seguro Senior (65+ años)", cost: 25 },
  ],
};

export default function QuoteForm() {
  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteSchema) as unknown as Resolver<QuoteFormValues>,
    defaultValues: {
      pax: 2,
      language: "ES",
      destinations: [],
      tickets: [],
      insurances: [],
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

  // Watch form values for real-time calculations
  const destinations = watch("destinations");
  const tickets = watch("tickets");
  const insurances = watch("insurances");
  const pax = watch("pax");

  useEffect(() => {
    // Calculate pure operating cost based on selections and pax
    let totalCost = 0;
    const currentPax = pax || 1;

    destinations?.forEach((destId) => {
      const dest = MOCK_CATALOG.destinations.find((d) => d.id === destId);
      if (dest) totalCost += dest.cost * currentPax;
    });

    tickets?.forEach((ticketId) => {
      const ticket = MOCK_CATALOG.tickets.find((t) => t.id === ticketId);
      if (ticket) totalCost += ticket.cost * currentPax;
    });

    insurances?.forEach((insId) => {
      const ins = MOCK_CATALOG.insurances.find((i) => i.id === insId);
      if (ins) totalCost += ins.cost * currentPax;
    });

    const result = calculatePrice(totalCost);
    setPricingResult(result);
  }, [destinations, tickets, insurances, pax]);

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
          <h2 className="text-2xl font-bold text-[#004b23]">
            Generar Propuesta
          </h2>
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
                <p className="text-red-500 text-xs mt-1">
                  {errors.clientName.message}
                </p>
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
                <p className="text-red-500 text-xs mt-1">
                  {errors.clientEmail.message}
                </p>
              )}
            </div>
          </div>

          {/* Viaje Básicos */}
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
                <p className="text-red-500 text-xs mt-1">
                  {errors.pax.message}
                </p>
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
                <p className="text-red-500 text-xs mt-1">
                  {errors.startDate.message}
                </p>
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
                <p className="text-red-500 text-xs mt-1">
                  {errors.endDate.message}
                </p>
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
            <h3 className="text-lg font-semibold text-zinc-800 mb-4">
              Servicios del Tour
            </h3>

            {/* Destinos */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Destinos
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {MOCK_CATALOG.destinations.map((dest) => (
                  <label
                    key={dest.id}
                    className="flex items-center space-x-3 p-3 border border-zinc-200 rounded-lg cursor-pointer hover:bg-zinc-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      value={dest.id}
                      {...register("destinations")}
                      className="w-4 h-4 text-[#f77f00] rounded border-zinc-300 focus:ring-[#f77f00]"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-zinc-800">
                        {dest.name}
                      </span>
                      <span className="text-xs text-zinc-500">
                        ${dest.cost} / pax
                      </span>
                    </div>
                  </label>
                ))}
              </div>
              {errors.destinations && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.destinations.message}
                </p>
              )}
            </div>

            {/* Entradas */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Entradas a Atracciones
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {MOCK_CATALOG.tickets.map((ticket) => (
                  <label
                    key={ticket.id}
                    className="flex items-center space-x-3 p-3 border border-zinc-200 rounded-lg cursor-pointer hover:bg-zinc-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      value={ticket.id}
                      {...register("tickets")}
                      className="w-4 h-4 text-[#f77f00] rounded border-zinc-300 focus:ring-[#f77f00]"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-zinc-800">
                        {ticket.name}
                      </span>
                      <span className="text-xs text-zinc-500">
                        ${ticket.cost} / pax
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Seguros */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Seguros (por rango de edad)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {MOCK_CATALOG.insurances.map((ins) => (
                  <label
                    key={ins.id}
                    className="flex items-center space-x-3 p-3 border border-zinc-200 rounded-lg cursor-pointer hover:bg-zinc-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      value={ins.id}
                      {...register("insurances")}
                      className="w-4 h-4 text-[#f77f00] rounded border-zinc-300 focus:ring-[#f77f00]"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-zinc-800">
                        {ins.name}
                      </span>
                      <span className="text-xs text-zinc-500">
                        ${ins.cost} / pax
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Columna Lateral - Resumen */}
      <div className="w-full lg:w-80 flex flex-col gap-4">
        <div className="bg-[#004b23] text-white p-6 rounded-2xl shadow-md sticky top-6">
          <h3 className="text-lg font-bold mb-4 flex items-center">
            Resumen de Cotización
          </h3>

          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center pb-3 border-b border-white/20">
              <span className="text-emerald-100">Pasajeros:</span>
              <span className="font-medium">{pax || 0}</span>
            </div>

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
          </div>

          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="w-full mt-8 bg-[#f77f00] hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-orange-500/30 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
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
