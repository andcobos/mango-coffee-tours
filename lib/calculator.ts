import { addDays } from "date-fns";

export interface PricingResult {
  costoOperativo: number;
  margen: number;
  subtotalVenta: number;
  iva: number;
  granTotal: number;
}

/**
 * Calculates the final price of a service or total quote based on the operating cost.
 * Margin applied: 30%
 * VAT applied: 13%
 * 
 * @param costoOperativo - Pure operating cost
 * @param margenPorcentaje - Margin percentage (default: 0.30 for 30%)
 * @param ivaPorcentaje - VAT percentage (default: 0.13 for 13%)
 * @returns PricingResult object containing all breakdown values.
 */
export function calculatePrice(
  costoOperativo: number,
  margenPorcentaje: number = 0.30,
  ivaPorcentaje: number = 0.13
): PricingResult {
  // Cap margin to avoid division by zero or negative denominator
  const safeMargen = Math.min(margenPorcentaje, 0.9999);
  // subtotalVenta = costoOperativo / (1 - margen)
  const subtotalVenta = costoOperativo / (1 - safeMargen);
  const margen = subtotalVenta - costoOperativo;
  
  // VAT = Subtotal Sale * VAT Percentage
  const iva = subtotalVenta * ivaPorcentaje;
  
  // Grand Total
  const granTotal = subtotalVenta + iva;

  return {
    costoOperativo,
    margen,
    subtotalVenta,
    iva,
    granTotal,
  };
}

/**
 * Calculates the expiration date of a quote (exactly 15 days from now).
 * 
 * @param fromDate - The start date (defaults to current date)
 * @returns Date object representing the expiration date.
 */
export function getExpirationDate(fromDate: Date = new Date()): Date {
  return addDays(fromDate, 15);
}
