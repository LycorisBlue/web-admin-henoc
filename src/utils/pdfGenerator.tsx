/* eslint-disable react/no-unescaped-entities */
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
  // Font,
} from "@react-pdf/renderer";
import { InvoiceDetails } from "@/types/invoice";

// Palette de couleurs corporate
const colors = {
  primary: '#E94E1B',
  primaryLight: '#FFF5F2',
  primaryDark: '#C73E15',
  dark: '#1A1A1A',
  gray: '#666666',
  lightGray: '#E5E5E5',
  veryLightGray: '#FAFAFA',
  white: '#FFFFFF',
};

// Styles professionnels
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    color: colors.dark,
    backgroundColor: colors.white,
  },

  // En-tête
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },

  logoSection: {
    flex: 1,
  },

  logo: {
    width: 150,
    height: 60,
  },

  companyInfo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  invoiceHeader: {
    flex: 1,
    alignItems: 'flex-end',
  },

  invoiceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
  },

  invoiceNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 3,
  },

  invoiceDate: {
    fontSize: 10,
    color: colors.gray,
    marginBottom: 2,
  },

  // Badge de statut
  statusBadge: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-end',
  },

  statusBadgePaid: {
    backgroundColor: '#D4EDDA',
  },

  statusBadgePending: {
    backgroundColor: '#FFF3CD',
  },

  statusBadgeCancelled: {
    backgroundColor: '#F8D7DA',
  },

  statusText: {
    fontSize: 9,
    fontWeight: 'bold',
  },

  statusTextPaid: {
    color: '#155724',
  },

  statusTextPending: {
    color: '#856404',
  },

  statusTextCancelled: {
    color: '#721C24',
  },

  // Informations entreprise
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: 2,
  },

  companyDetails: {
    fontSize: 9,
    color: colors.gray,
    textAlign: 'center',
    marginBottom: 1,
  },

  // Sections émetteur et client
  partiesSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },

  partyBox: {
    width: '48%',
    padding: 15,
    backgroundColor: colors.veryLightGray,
    borderRadius: 8,
  },

  partyTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  partyInfo: {
    fontSize: 10,
    color: colors.dark,
    marginBottom: 3,
    lineHeight: 1.4,
  },

  partyLabel: {
    fontWeight: 'bold',
    color: colors.gray,
  },

  // Informations de commande
  orderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    padding: 10,
    backgroundColor: colors.primaryLight,
    borderRadius: 6,
  },

  orderInfoItem: {
    flexDirection: 'row',
  },

  orderInfoLabel: {
    fontSize: 9,
    color: colors.gray,
    marginRight: 5,
  },

  orderInfoValue: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.dark,
  },

  // Tableau des articles
  table: {
    marginBottom: 20,
  },

  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    padding: 12,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },

  tableHeaderText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  tableRow: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },

  tableRowAlternate: {
    backgroundColor: colors.veryLightGray,
  },

  tableCell: {
    fontSize: 10,
    color: colors.dark,
  },

  // Largeurs des colonnes
  colDescription: { width: '40%' },
  colPrice: { width: '20%', textAlign: 'right' },
  colQuantity: { width: '15%', textAlign: 'center' },
  colTotal: { width: '25%', textAlign: 'right' },

  // Section des totaux
  totalsSection: {
    marginLeft: 'auto',
    width: '40%',
    marginTop: 20,
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },

  totalLabel: {
    fontSize: 10,
    color: colors.gray,
  },

  totalValue: {
    fontSize: 10,
    color: colors.dark,
    fontWeight: 'bold',
  },

  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
    padding: 15,
    backgroundColor: colors.primary,
    borderRadius: 6,
  },

  grandTotalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.white,
  },

  grandTotalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.white,
  },

  // Montant en lettres
  amountInWords: {
    marginTop: 10,
    padding: 10,
    backgroundColor: colors.veryLightGray,
    borderRadius: 4,
    fontSize: 9,
    fontStyle: 'italic',
    color: colors.gray,
  },

  // Conditions et paiement
  paymentSection: {
    marginTop: 30,
    padding: 20,
    backgroundColor: colors.veryLightGray,
    borderRadius: 8,
  },

  paymentTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
  },

  paymentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  paymentBox: {
    width: '48%',
  },

  paymentLabel: {
    fontSize: 9,
    color: colors.gray,
    marginBottom: 3,
  },

  paymentValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.dark,
  },

  bankDetails: {
    marginTop: 10,
    padding: 10,
    backgroundColor: colors.white,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },

  bankInfo: {
    fontSize: 9,
    color: colors.dark,
    marginBottom: 2,
  },

  // Pied de page
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
  },

  footerDivider: {
    height: 1,
    backgroundColor: colors.lightGray,
    marginBottom: 10,
  },

  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },

  footerLeft: {
    flex: 1,
  },

  footerCenter: {
    flex: 1,
    alignItems: 'center',
  },

  footerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },

  footerText: {
    fontSize: 8,
    color: colors.gray,
    marginBottom: 1,
    textAlign: 'center',
  },

  legalText: {
    fontSize: 7,
    color: colors.gray,
    marginTop: 5,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Filigrane plus subtil
  watermark: {
    position: 'absolute',
    top: '45%',
    left: '20%',
    opacity: 0.03,
  },

  watermarkLogo: {
    width: 200,
    height: 160,
  },
});

// Fonctions utilitaires
const formatCurrency = (amount: number): string => {
  const formatted = new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  return `${formatted.replace(/\u202F/g, " ")} FCFA`;
};

const formatInvoiceNumber = (id: string): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `FAC-${year}${month}-${id.substring(0, 4).toUpperCase()}`;
};

const formatInvoiceStatus = (status: string): string => {
  const statusMap: { [key: string]: string } = {
    "en_attente": "En attente",
    "payé": "Payée",
    "annulé": "Annulée",
  };
  return statusMap[status] || status;
};

const getStatusStyle = (status: string) => {
  switch (status) {
    case "payé":
      return {
        badge: styles.statusBadgePaid,
        text: styles.statusTextPaid,
      };
    case "annulé":
      return {
        badge: styles.statusBadgeCancelled,
        text: styles.statusTextCancelled,
      };
    default:
      return {
        badge: styles.statusBadgePending,
        text: styles.statusTextPending,
      };
  }
};

const numberToWords = (num: number): string => {
  // Fonction simplifiée pour convertir un nombre en lettres
  // Dans un cas réel, utilisez une bibliothèque dédiée
  return `${Math.floor(num).toLocaleString('fr-FR')} francs CFA`;
};

// Composant PDF principal
const InvoicePDF = ({ invoice }: { invoice: InvoiceDetails }) => {
  const statusStyles = getStatusStyle(invoice.status);
  const invoiceDate = new Date(invoice.created_at);
  const dueDate = new Date(invoiceDate);
  dueDate.setDate(dueDate.getDate() + 30); // 30 jours de délai de paiement

  return (
    <Document
      title={`Facture ${formatInvoiceNumber(invoice.id)}`}
      author="Mon Fournisseur 2.0"
      subject="Facture commerciale"
      creator="Mon Fournisseur 2.0"
      producer="Mon Fournisseur 2.0"
      keywords="facture, commande, internationale"
    >
      <Page size="A4" style={styles.page}>
        {/* Filigrane subtil */}
        <View style={styles.watermark}>
          <Image src="/images/logo.png" />
        </View>

        {/* En-tête */}
        <View style={styles.header}>
          <View style={styles.logoSection}>
            <Image style={styles.logo} src="/images/logo.png" />
          </View>

          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>MON FOURNISSEUR 2.0</Text>
            <Text style={styles.companyDetails}>Service de commande internationale</Text>
            <Text style={styles.companyDetails}>RC: XXXXX | CC: XXXXX</Text>
            <Text style={styles.companyDetails}>NIF: XXXXX</Text>
          </View>

          <View style={styles.invoiceHeader}>
            <Text style={styles.invoiceTitle}>FACTURE</Text>
            <Text style={styles.invoiceNumber}>
              N° {formatInvoiceNumber(invoice.id)}
            </Text>
            <Text style={styles.invoiceDate}>
              Date: {invoiceDate.toLocaleDateString("fr-FR")}
            </Text>
            <Text style={styles.invoiceDate}>
              Échéance: {dueDate.toLocaleDateString("fr-FR")}
            </Text>
            <View style={[styles.statusBadge, statusStyles.badge]}>
              <Text style={[styles.statusText, statusStyles.text]}>
                {formatInvoiceStatus(invoice.status)}
              </Text>
            </View>
          </View>
        </View>

        {/* Émetteur et Client */}
        <View style={styles.partiesSection}>
          <View style={styles.partyBox}>
            <Text style={styles.partyTitle}>Émetteur</Text>
            <Text style={styles.partyInfo}>
              <Text style={styles.partyLabel}>MON FOURNISSEUR 2.0</Text>
            </Text>
            <Text style={styles.partyInfo}>123 Avenue du Commerce</Text>
            <Text style={styles.partyInfo}>Abidjan, Côte d'Ivoire</Text>
            <Text style={styles.partyInfo}>Tél: +225 XX XX XX XX</Text>
            <Text style={styles.partyInfo}>Email: contact@monfournisseur.com</Text>
          </View>

          <View style={styles.partyBox}>
            <Text style={styles.partyTitle}>Client</Text>
            <Text style={styles.partyInfo}>
              <Text style={styles.partyLabel}>{invoice.client.full_name}</Text>
            </Text>
            <Text style={styles.partyInfo}>Tél: {invoice.client.whatsapp_number}</Text>
            {invoice.client.email && (
              <Text style={styles.partyInfo}>Email: {invoice.client.email}</Text>
            )}
          </View>
        </View>

        {/* Informations de commande */}
        <View style={styles.orderInfo}>
          <View style={styles.orderInfoItem}>
            <Text style={styles.orderInfoLabel}>Référence commande:</Text>
            <Text style={styles.orderInfoValue}>CMD-{invoice.id.substring(0, 8)}</Text>
          </View>
          <View style={styles.orderInfoItem}>
            <Text style={styles.orderInfoLabel}>Mode de paiement:</Text>
            <Text style={styles.orderInfoValue}>Virement bancaire</Text>
          </View>
          <View style={styles.orderInfoItem}>
            <Text style={styles.orderInfoLabel}>Conditions:</Text>
            <Text style={styles.orderInfoValue}>30 jours net</Text>
          </View>
        </View>

        {/* Tableau des articles */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colDescription]}>
              Description
            </Text>
            <Text style={[styles.tableHeaderText, styles.colPrice]}>
              Prix unitaire
            </Text>
            <Text style={[styles.tableHeaderText, styles.colQuantity]}>
              Quantité
            </Text>
            <Text style={[styles.tableHeaderText, styles.colTotal]}>
              Total HT
            </Text>
          </View>

          {invoice.items.map((item, index) => (
            <View
              key={index}
              style={[
                styles.tableRow,
                ...(index % 2 === 1 ? [styles.tableRowAlternate] : [])
              ]}
            >
              <Text style={[styles.tableCell, styles.colDescription]}>
                {item.name}
              </Text>
              <Text style={[styles.tableCell, styles.colPrice]}>
                {formatCurrency(item.unit_price)}
              </Text>
              <Text style={[styles.tableCell, styles.colQuantity]}>
                {item.quantity}
              </Text>
              <Text style={[styles.tableCell, styles.colTotal]}>
                {formatCurrency(item.subtotal)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totaux */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Sous-total HT</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(invoice.totals.items_total)}
            </Text>
          </View>

          {/* Frais additionnels */}
          {invoice.fees && invoice.fees.map((fee, index) => (
            <View key={index} style={styles.totalRow}>
              <Text style={styles.totalLabel}>{fee.fee_type.name}</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(fee.amount)}
              </Text>
            </View>
          ))}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TVA (0%)</Text>
            <Text style={styles.totalValue}>{formatCurrency(0)}</Text>
          </View>

          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>TOTAL TTC</Text>
            <Text style={styles.grandTotalValue}>
              {formatCurrency(invoice.total_amount)}
            </Text>
          </View>
        </View>

        {/* Montant en lettres */}
        <Text style={styles.amountInWords}>
          Arrêtée la présente facture à la somme de : {numberToWords(invoice.total_amount)}
        </Text>

        {/* Section paiement */}
        <View style={styles.paymentSection}>
          <Text style={styles.paymentTitle}>Modalités de paiement</Text>

          <View style={styles.paymentInfo}>
            <View style={styles.paymentBox}>
              <Text style={styles.paymentLabel}>Délai de paiement</Text>
              <Text style={styles.paymentValue}>30 jours à réception</Text>
            </View>
            <View style={styles.paymentBox}>
              <Text style={styles.paymentLabel}>Pénalités de retard</Text>
              <Text style={styles.paymentValue}>1,5% par mois</Text>
            </View>
          </View>

          <View style={styles.bankDetails}>
            <Text style={[styles.paymentLabel, { marginBottom: 5 }]}>
              Coordonnées bancaires
            </Text>
            <Text style={styles.bankInfo}>Banque: XXXXX</Text>
            <Text style={styles.bankInfo}>IBAN: CI00 0000 0000 0000 0000 0000</Text>
            <Text style={styles.bankInfo}>BIC/SWIFT: XXXXXXXX</Text>
          </View>
        </View>

        {/* Pied de page */}
        <View style={styles.footer}>
          <View style={styles.footerDivider} />
          <View style={styles.footerContent}>
            <View style={styles.footerLeft}>
              <Text style={styles.footerText}>Mon Fournisseur 2.0</Text>
              <Text style={styles.footerText}>Service client: +225 XX XX XX XX</Text>
            </View>
            <View style={styles.footerCenter}>
              <Text style={styles.footerText}>Page 1/1</Text>
            </View>
            <View style={styles.footerRight}>
              <Text style={styles.footerText}>www.monfournisseur.com</Text>
              <Text style={styles.footerText}>contact@monfournisseur.com</Text>
            </View>
          </View>
          <Text style={styles.legalText}>
            En cas de retard de paiement, une pénalité de 1,5% par mois sera appliquée, ainsi qu'une indemnité forfaitaire de 40 000 FCFA pour frais de recouvrement.
            Pas d'escompte pour paiement anticipé. Merci de mentionner le numéro de facture lors du règlement.
          </Text>
        </View>
      </Page>
    </Document>
  );
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