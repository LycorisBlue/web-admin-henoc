import React from "react";
import { View, Text, Image } from "@react-pdf/renderer";
import { InvoiceDetails } from "@/types/invoice";
import { styles } from "./styles";
import { formatInvoiceNumber } from "./utils";

interface InvoiceHeaderProps {
    invoice: InvoiceDetails;
}

/**
 * Composant Header de la facture - Répété sur chaque page
 */
export const InvoiceHeader: React.FC<InvoiceHeaderProps> = ({ invoice }) => {
    const invoiceDate = new Date(invoice.created_at);
    const dueDate = new Date(invoiceDate);
    dueDate.setDate(dueDate.getDate() + 30); // 30 jours de délai de paiement

    return (
        <View style={styles.header} fixed>
            {/* Section Logo */}
            <View style={styles.headerLeft}>
                <Image style={styles.logo} src="/images/logo.png" />
            </View>

            {/* Section Entreprise */}
            <View style={styles.headerCenter}>
                <Text style={styles.companyName}>MON FOURNISSEUR 2.0</Text>
                <Text style={styles.companyDetails}>Service de commande internationale</Text>
                <Text style={styles.companyDetails}>RC: XXXXX | CC: XXXXX</Text>
                <Text style={styles.companyDetails}>NIF: XXXXX</Text>
            </View>

            {/* Section Facture */}
            <View style={styles.headerRight}>
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
            </View>
        </View>
    );
};