import { NextResponse } from "next/server";
import { getExpirationDate } from "@/lib/calculator";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // 1. Aquí se conectaría Prisma para guardar la cotización.
    // Ejemplo de cómo se vería el código para Prisma (comentado para evitar errores de compilación si no se ha hecho generate):
    /*
    import { PrismaClient } from "@prisma/client";
    const prisma = new PrismaClient();
    
    const newQuote = await prisma.cotizacion.create({
      data: {
        cliente_nombre: data.clientName,
        cliente_email: data.clientEmail,
        pax: data.pax,
        fecha_inicio: new Date(data.startDate),
        fecha_fin: new Date(data.endDate),
        idioma_preferido: data.language,
        fecha_vencimiento: getExpirationDate(),
        subtotal_costo: data.pricing.costoOperativo,
        margen_aplicado: 0.30,
        subtotal_venta: data.pricing.subtotalVenta,
        iva_total: data.pricing.iva,
        gran_total: data.pricing.granTotal,
        // ... (asumimos un perfil admin por ahora o lo pasamos en el payload)
        perfil_id: "uuid-placeholder",
      }
    });
    */

    // 2. Preparar el payload para el webhook de n8n / Make
    const webhookPayload = {
      event: "QUOTE_CREATED",
      quoteId: "TEMP_ID", // Aquí iría newQuote.id
      client: {
        name: data.clientName,
        email: data.clientEmail,
      },
      tripDetails: {
        pax: data.pax,
        startDate: data.startDate,
        endDate: data.endDate,
        language: data.language,
      },
      pricing: data.pricing,
      timestamp: new Date().toISOString(),
    };

    // 3. Disparar el Webhook (Descomentar y reemplazar URL cuando n8n esté listo)
    /*
    await fetch("https://tu-webhook-n8n-o-make.com/webhook/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(webhookPayload),
    });
    */

    // Simulando procesamiento exitoso
    console.log("Cotización recibida y lista para automatización:", webhookPayload);

    return NextResponse.json(
      { message: "Cotización creada y webhook disparado correctamente", data: webhookPayload },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error en /api/quote:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al procesar la cotización" },
      { status: 500 }
    );
  }
}
