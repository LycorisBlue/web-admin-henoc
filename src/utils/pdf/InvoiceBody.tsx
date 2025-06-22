import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { InvoiceDetails } from "@/types/invoice";
import { styles } from "./styles";
import { formatCurrency } from "./utils";

interface InvoiceBodyProps {
    invoice: InvoiceDetails;
}

/**
 * Composant Body de la facture - Contenu principal avec gestion intelligente des sauts de page
 */
export const InvoiceBody: React.FC<InvoiceBodyProps> = ({ invoice }) => {
    return (
        <View>
            {/* Émetteur et Client */}
            <View style={styles.partiesSection} wrap={false}>
                <View style={styles.partyBox}>
                    <Text style={styles.partyTitle}>Émetteur</Text>
                    <Text style={styles.partyInfo}>
                        <Text style={styles.partyLabel}>MON FOURNISSEUR 2.0</Text>
                    </Text>
                    <Text style={styles.partyInfo}>123 Avenue du Commerce</Text>
                    <Text style={styles.partyInfo}>Abidjan, Côte d&apos;Ivoire</Text>
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
                    {invoice.client.adresse && (
                        <Text style={styles.partyInfo}>Adresse: {invoice.client.adresse}</Text>
                    )}
                </View>
            </View>

            {/* Informations de commande */}
            <View style={styles.infoBox} wrap={false}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View>
                        <Text style={styles.infoText}>
                            <Text style={styles.partyLabel}>Référence commande:</Text> CMD-{invoice.id.substring(0, 8)}
                        </Text>
                    </View>
                    <View>
                        <Text style={styles.infoText}>
                            <Text style={styles.partyLabel}>Mode de paiement:</Text> Virement bancaire
                        </Text>
                    </View>
                    <View>
                        <Text style={styles.infoText}>
                            <Text style={styles.partyLabel}>Conditions:</Text> 30 jours net
                        </Text>
                    </View>
                </View>
            </View>

            {/* Tableau des articles */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Articles</Text>

                <View style={styles.table}>
                    {/* En-tête du tableau */}
                    <View style={styles.tableHeader} wrap={false}>
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

                    {/* Lignes des articles */}
                    {invoice.items.map((item, index) => (
                        <View
                            key={index}
                            style={[
                                styles.tableRow,
                                ...(index % 2 === 1 ? [styles.tableRowAlternate] : [])
                            ]}
                            wrap={false}
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
            </View>

            {/* Section des totaux */}
            <View style={styles.totalsSection} wrap={false}>
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
        </View>
    );
};