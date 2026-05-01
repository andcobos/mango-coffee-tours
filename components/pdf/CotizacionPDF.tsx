import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

export interface ServicioPDF {
  nombre: string;
  precio: number;
}

export interface CotizacionPDFProps {
  nombre: string;
  correo: string;
  fechaInicio: string;
  fechaFin: string;
  pax: number;
  esPaquete: boolean;
  paqueteNombre?: string;
  paqueteDescripcion?: string;
  servicios: ServicioPDF[];
  totalFinal: number;
  codigoReferencia: string;
  notas?: string;
}

const verde = "#004b23";
const naranja = "#f77f00";
const gris = "#6b7280";
const grisClaro = "#f3f4f6";
const negro = "#111827";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: negro,
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 48,
    backgroundColor: "#ffffff",
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: verde,
  },
  headerLeft: {
    flexDirection: "column",
    gap: 4,
    justifyContent: "center",
  },
  logo: {
    width: 120,
    height: "auto",
    marginBottom: 2,
  },
  brandName: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: verde,
    letterSpacing: 0.5,
  },
  brandTagline: {
    fontSize: 9,
    color: gris,
  },
  headerRight: {
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 2,
  },
  docTitle: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: verde,
    letterSpacing: 1,
  },
  docSubtitle: {
    fontSize: 9,
    color: gris,
  },
  // Section title
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: verde,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#d1fae5",
  },
  // Info grid
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 24,
    backgroundColor: grisClaro,
    borderRadius: 4,
    padding: 14,
    gap: 8,
  },
  infoItem: {
    width: "47%",
    flexDirection: "column",
    gap: 2,
  },
  infoLabel: {
    fontSize: 8,
    color: gris,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 10,
    color: negro,
    fontFamily: "Helvetica-Bold",
  },
  // Servicios section
  serviciosBlock: {
    marginBottom: 24,
  },
  // Package block
  packageBox: {
    backgroundColor: "#f0fdf4",
    borderLeftWidth: 3,
    borderLeftColor: verde,
    padding: 12,
    borderRadius: 2,
    marginBottom: 8,
  },
  packageName: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: verde,
    marginBottom: 4,
  },
  packageDesc: {
    fontSize: 9,
    color: gris,
    lineHeight: 1.5,
  },
  // Table
  tableHeader: {
    flexDirection: "row",
    backgroundColor: verde,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 2,
    marginBottom: 2,
  },
  tableHeaderNombre: {
    flex: 1,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableHeaderPrecio: {
    width: 80,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    textAlign: "right",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tableRowAlt: {
    backgroundColor: "#f9fafb",
  },
  tableCell: {
    flex: 1,
    fontSize: 9,
    color: negro,
  },
  tableCellPrecio: {
    width: 80,
    fontSize: 9,
    color: negro,
    textAlign: "right",
    fontFamily: "Helvetica-Bold",
  },
  // Total block
  totalBlock: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  totalBox: {
    backgroundColor: verde,
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    minWidth: 200,
    justifyContent: "space-between",
  },
  totalLabel: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  totalValue: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: naranja,
  },
  // Notas block
  notasBlock: {
    marginBottom: 20,
  },
  notasBox: {
    backgroundColor: "#f9fafb",
    borderRadius: 4,
    padding: 12,
    borderLeftWidth: 2,
    borderLeftColor: "#d1d5db",
  },
  notasTexto: {
    fontSize: 9,
    color: "#4b5563",
    lineHeight: 1.6,
    fontStyle: "italic",
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 24,
    left: 48,
    right: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  footerText: {
    fontSize: 8,
    color: gris,
  },
  footerBrand: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: verde,
  },
  // IVA note
  ivaNote: {
    fontSize: 8,
    color: gris,
    textAlign: "right",
    marginTop: 6,
  },
});

function formatCurrency(value: number): string {
  return `$${value.toLocaleString("es-CR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

export default function CotizacionPDF({
  nombre,
  correo,
  fechaInicio,
  fechaFin,
  pax,
  esPaquete,
  paqueteNombre,
  paqueteDescripcion,
  servicios,
  totalFinal,
  codigoReferencia,
  notas,
}: CotizacionPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image src="/mangocoffeetours_logo.png" style={styles.logo} />
            <Text style={styles.brandTagline}>Tu próxima aventura comienza aquí</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.docTitle}>COTIZACIÓN #{codigoReferencia}</Text>
            <Text style={styles.docSubtitle}>
              Generada el {formatDate(new Date().toISOString().split("T")[0])}
            </Text>
          </View>
        </View>

        {/* Información del cliente */}
        <Text style={styles.sectionTitle}>Información del Cliente</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Nombre</Text>
            <Text style={styles.infoValue}>{nombre || "—"}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Correo Electrónico</Text>
            <Text style={styles.infoValue}>{correo || "—"}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Fecha de Inicio</Text>
            <Text style={styles.infoValue}>{formatDate(fechaInicio)}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Fecha de Fin</Text>
            <Text style={styles.infoValue}>{formatDate(fechaFin)}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Número de Pasajeros</Text>
            <Text style={styles.infoValue}>{pax} {pax === 1 ? "persona" : "personas"}</Text>
          </View>
        </View>

        {/* Servicios */}
        <View style={styles.serviciosBlock}>
          <Text style={styles.sectionTitle}>Servicios</Text>

          {esPaquete ? (
            <>
              <View style={styles.packageBox}>
                <Text style={[styles.infoLabel, { marginBottom: 6 }]}>Paquete Seleccionado</Text>
                <Text style={styles.packageName}>{paqueteNombre || "—"}</Text>
                {paqueteDescripcion ? (
                  <Text style={styles.packageDesc}>{paqueteDescripcion}</Text>
                ) : null}
              </View>
              {servicios.length > 0 && (
                <>
                  <View style={styles.tableHeader}>
                    <Text style={styles.tableHeaderNombre}>Servicio</Text>
                    <Text style={styles.tableHeaderPrecio}>Precio</Text>
                  </View>
                  {servicios.map((item, index) => (
                    <View
                      key={index}
                      style={[styles.tableRow, index % 2 !== 0 ? styles.tableRowAlt : {}]}
                    >
                      <Text style={styles.tableCell}>{item.nombre}</Text>
                      <Text style={styles.tableCellPrecio}>{formatCurrency(item.precio)}</Text>
                    </View>
                  ))}
                </>
              )}
            </>
          ) : (
            <>
              <Text style={[styles.infoLabel, { marginBottom: 8, color: gris }]}>
                Cotización a la Medida
              </Text>
              {servicios.length > 0 ? (
                <>
                  <View style={styles.tableHeader}>
                    <Text style={styles.tableHeaderNombre}>Servicio</Text>
                    <Text style={styles.tableHeaderPrecio}>Precio</Text>
                  </View>
                  {servicios.map((item, index) => (
                    <View
                      key={index}
                      style={[styles.tableRow, index % 2 !== 0 ? styles.tableRowAlt : {}]}
                    >
                      <Text style={styles.tableCell}>{item.nombre}</Text>
                      <Text style={styles.tableCellPrecio}>{formatCurrency(item.precio)}</Text>
                    </View>
                  ))}
                </>
              ) : (
                <Text style={{ fontSize: 9, color: gris, fontStyle: "italic" }}>
                  No se han seleccionado servicios.
                </Text>
              )}
            </>
          )}
        </View>

        {/* Notas */}
        {notas && notas.trim().length > 0 && (
          <View style={styles.notasBlock}>
            <Text style={styles.sectionTitle}>Notas / Instrucciones Adicionales</Text>
            <View style={styles.notasBox}>
              <Text style={styles.notasTexto}>{notas.trim()}</Text>
            </View>
          </View>
        )}

        {/* Total */}
        <Text style={styles.sectionTitle}>Total</Text>
        <View style={styles.totalBlock}>
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>TOTAL A PAGAR</Text>
            <Text style={styles.totalValue}>{formatCurrency(totalFinal)}</Text>
          </View>
        </View>
        <Text style={styles.ivaNote}>* Todos los precios incluyen IVA (13%)</Text>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Se generó la cotización, es válida por 30 días a partir de su fecha de emisión.
          </Text>
          <Text style={styles.footerBrand}>Mango & Coffee Tours</Text>
        </View>
      </Page>
    </Document>
  );
}
