import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { styles } from "./styles";

/**
 * Composant Footer de la facture - Affiché uniquement sur la dernière page
 */
export const InvoiceFooter: React.FC = () => {
    return (
        <View style={styles.footer} fixed>
            {/* Ligne de séparation */}
            <View style={styles.footerDivider} />

            {/* Contenu du footer */}
            <View style={styles.footerContent}>
                {/* Section gauche */}
                <View style={styles.footerLeft}>
                    <Text style={styles.footerText}>Mon Fournisseur 2.0</Text>
                    <Text style={styles.footerText}>Service client: +225 XX XX XX XX</Text>
                </View>

                {/* Section centre - Numéro de page avec render prop sur Text */}
                <View style={styles.footerCenter}>
                    <Text
                        style={styles.footerText}
                        render={({ pageNumber, totalPages }) =>
                            pageNumber === totalPages ? `Page ${pageNumber}/${totalPages}` : null
                        }
                        fixed
                    />
                </View>

                {/* Section droite */}
                <View style={styles.footerRight}>
                    <Text style={styles.footerText}>www.monfournisseur.com</Text>
                    <Text style={styles.footerText}>contact@monfournisseur.com</Text>
                </View>
            </View>

            {/* Texte légal - uniquement sur la dernière page */}
            <Text
                style={styles.legalText}
                render={({ pageNumber, totalPages }) =>
                    pageNumber === totalPages ? (
                        "En cas de retard de paiement, une pénalité de 1,5% par mois sera appliquée, ainsi qu'une indemnité forfaitaire de 40 000 FCFA pour frais de recouvrement. Pas d'escompte pour paiement anticipé. Merci de mentionner le numéro de facture lors du règlement."
                    ) : null
                }
                fixed
            />
        </View>
    );
};