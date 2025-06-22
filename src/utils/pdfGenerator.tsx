/* eslint-disable react/no-unescaped-entities */
import React from "react";
import {
  Document,
  Page,
  PDFDownloadLink,
} from "@react-pdf/renderer";
import { InvoiceDetails } from "@/types/invoice";
import { styles } from "./pdf/styles";
import { InvoiceHeader } from "./pdf/InvoiceHeader";
import { InvoiceBody } from "./pdf/InvoiceBody";
import { InvoiceFooter } from "./pdf/InvoiceFooter";
import { formatInvoiceNumber } from "./pdf/utils";

/**
 * Composant PDF principal de la facture
 */
const InvoicePDF = ({ invoice }: { invoice: InvoiceDetails }) => {
  return (
    <Document
      title={`Facture ${formatInvoiceNumber(invoice.id)}`}
      author="Mon Fournisseur 2.0"
      subject="Facture commerciale"
      creator="Mon Fournisseur 2.0"
      producer="Mon Fournisseur 2.0"
      keywords="facture, commande, internationale"
    >
      <Page size="A4" style={styles.page} wrap>
        {/* Header répété sur chaque page */}
        <InvoiceHeader invoice={invoice} />

        {/* Corps principal avec pagination intelligente */}
        <InvoiceBody invoice={invoice} />

        {/* Footer uniquement sur la dernière page */}
        <InvoiceFooter />
      </Page>
    </Document>
  );
};

/**
 * Composant pour télécharger le PDF
 */
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
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        {loading ? "Génération en cours..." : "Télécharger la facture PDF"}
      </>
    )}
  </PDFDownloadLink>
);

export default InvoicePDF;