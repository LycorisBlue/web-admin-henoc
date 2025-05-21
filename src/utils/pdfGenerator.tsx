// src/utils/pdfGenerator.tsx
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
  Image,
} from "@react-pdf/renderer";
import { InvoiceDetails } from "@/types/invoice";

// Définir les styles
const styles = StyleSheet.create({
  page: {
    padding: 10,
    flexDirection: "column",
    backgroundColor: "white",
  },
  // Filigrane (watermark)
  watermark: {
    position: "absolute",
    top: "40%",
    left: "-15%", // laisse dépasser hors page pour bien couvrir
    width: "150%", // couvre toute la diagonale
    textAlign: "center",
    fontSize: 48,
    color: "grey",
    opacity: 0.08,
    transform: "rotate(-45deg)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  logo: {
    width: 100,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  invoiceInfo: {
    fontSize: 9,
  },
  clientSection: {
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 5,
  },
  clientInfo: {
    fontSize: 9,
  },
  table: {
    marginTop: 10,
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#E94E1B",
    color: "white",
    padding: 5,
    fontWeight: "bold",
    fontSize: 8,
  },
  tableRow: {
    flexDirection: "row",
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    fontSize: 8,
  },
  tableColHeader1: { width: "40%", textAlign: "left" },
  tableColHeader2: { width: "20%", textAlign: "right" },
  tableColHeader3: { width: "15%", textAlign: "center" },
  tableColHeader4: { width: "25%", textAlign: "right" },
  tableCol1: { width: "40%", textAlign: "left" },
  tableCol2: { width: "20%", textAlign: "right" },
  tableCol3: { width: "15%", textAlign: "center" },
  tableCol4: { width: "25%", textAlign: "right" },
  summary: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  summaryLeft: {
    width: "75%",
    textAlign: "right",
    fontSize: 9,
    paddingRight: 5,
  },
  summaryRight: {
    width: "25%",
    textAlign: "right",
    fontSize: 9,
  },
  total: {
    fontSize: 10,
    fontWeight: "bold",
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 10,
    right: 10,
    textAlign: "center",
    fontSize: 8,
    color: "grey",
    borderTopWidth: 0.5,
    borderTopColor: "#E94E1B",
    paddingTop: 5,
  },
});

// Composant de document PDF
const InvoicePDF = ({ invoice }: { invoice: InvoiceDetails }) => (
  <Document>
    <Page size="A5" style={styles.page}>
      {/* Filigrane */}
      <Text style={styles.watermark}>Mon Fournisseur 2.0</Text>

      {/* En-tête */}
      <View style={styles.header}>
        <Image style={styles.logo} src="/images/logo.png" />
        <View style={styles.headerRight}>
          <Text style={styles.title}>FACTURE</Text>
          <Text style={styles.invoiceInfo}>N° : {invoice.id.substring(0, 8)}</Text>
          <Text style={styles.invoiceInfo}>
            Date : {new Date(invoice.created_at).toLocaleDateString("fr-FR")}
          </Text>
          <Text style={styles.invoiceInfo}>
            Statut : {formatInvoiceStatus(invoice.status)}
          </Text>
        </View>
      </View>

      {/* Informations client */}
      <View style={styles.clientSection}>
        <Text style={styles.sectionTitle}>CLIENT</Text>
        <Text style={styles.clientInfo}>{invoice.client.full_name}</Text>
        <Text style={styles.clientInfo}>Tél: {invoice.client.whatsapp_number}</Text>
        {invoice.client.email && (
          <Text style={styles.clientInfo}>Email: {invoice.client.email}</Text>
        )}
      </View>

      {/* Tableau des articles */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableColHeader1}>Article</Text>
          <Text style={styles.tableColHeader2}>P.U.</Text>
          <Text style={styles.tableColHeader3}>Qté</Text>
          <Text style={styles.tableColHeader4}>Total</Text>
        </View>

        {invoice.items.map((item, index) => (
          <View
            key={index}
            style={[
              styles.tableRow,
              { backgroundColor: index % 2 === 0 ? "#ffffff" : "#f9f9f9" },
            ]}
          >
            <Text style={styles.tableCol1}>{item.name}</Text>
            <Text style={styles.tableCol2}>{formatCurrency(item.unit_price)}</Text>
            <Text style={styles.tableCol3}>{item.quantity}</Text>
            <Text style={styles.tableCol4}>{formatCurrency(item.subtotal)}</Text>
          </View>
        ))}
      </View>

      {/* Résumé et totaux */}
      <View style={styles.summary}>
        <Text style={styles.summaryLeft}>Sous-total:</Text>
        <Text style={styles.summaryRight}>
          {formatCurrency(invoice.totals.items_total)}
        </Text>
      </View>

      {/* Frais additionnels */}
      {invoice.fees &&
        invoice.fees.map((fee, index) => (
          <View key={index} style={styles.summary}>
            <Text style={styles.summaryLeft}>{fee.fee_type.name}:</Text>
            <Text style={styles.summaryRight}>{formatCurrency(fee.amount)}</Text>
          </View>
        ))}

      {/* Total */}
      <View style={[styles.summary, { marginTop: 5 }]}>
        <Text style={[styles.summaryLeft, styles.total]}>TOTAL:</Text>
        <Text style={[styles.summaryRight, styles.total]}>
          {formatCurrency(invoice.total_amount)}
        </Text>
      </View>

      {/* Pied de page */}
      <View style={styles.footer}>
        <Text>Mon Fournisseur 2.0 - Service de commande internationale</Text>
        <Text>Tél: +225 XX XX XX XX | Email: contact@monfournisseur.com</Text>
        <Text>Merci pour votre confiance!</Text>
      </View>
    </Page>
  </Document>
);

// Fonctions utilitaires
const formatCurrency = (amount: number): string => {
  // "fr-FR" génère des espaces fines (\u202F) qui ne sont pas supportées par toutes les polices -> on remplace
  const formatted = new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  return `${formatted.replace(/\u202F/g, " ")} F CFA`;
};

const formatInvoiceStatus = (status: string): string => {
  switch (status) {
    case "en_attente":
      return "En attente";
    case "payé":
      return "Payée";
    case "annulé":
      return "Annulée";
    default:
      return status;
  }
};

// Composant pour télécharger le PDF
export const InvoiceDownloadButton = ({
  invoice,
}: {
  invoice: InvoiceDetails;
}) => (
  <PDFDownloadLink
    document={<InvoicePDF invoice={invoice} />}
    fileName={`facture-${invoice.id.substring(0, 8)}.pdf`}
    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
  >
    {({ loading }) => (
      <>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
          />
        </svg>
        {loading ? "Préparation..." : "Télécharger la facture"}
      </>
    )}
  </PDFDownloadLink>
);
