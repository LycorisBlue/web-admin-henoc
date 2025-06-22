import { StyleSheet } from "@react-pdf/renderer";

// Palette de couleurs corporate
export const colors = {
  primary: "#E94E1B",
  primaryLight: "#FFF5F2",
  primaryDark: "#C73E15",
  dark: "#1A1A1A",
  gray: "#666666",
  lightGray: "#E5E5E5",
  veryLightGray: "#FAFAFA",
  white: "#FFFFFF",
};

export const styles = StyleSheet.create({
  // === STYLES GÉNÉRAUX ===
  page: {
    padding: 40,
    fontSize: 10,
    color: colors.dark,
    backgroundColor: colors.white,
    paddingTop: 100, // Espace pour le header
    paddingBottom: 80, // Espace pour le footer
  },

  // === HEADER STYLES ===
  header: {
    position: "absolute",
    top: 20,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },

  headerLeft: {
    flex: 1,
  },

  headerCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  headerRight: {
    flex: 1,
    alignItems: "flex-end",
  },

  logo: {
    width: 120,
    height: 48,
  },

  companyName: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.dark,
    textAlign: "center",
  },

  companyDetails: {
    fontSize: 8,
    color: colors.gray,
    textAlign: "center",
    marginBottom: 1,
  },

  invoiceTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 8,
  },

  invoiceNumber: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 3,
  },

  invoiceDate: {
    fontSize: 9,
    color: colors.gray,
    marginBottom: 2,
  },

  statusBadge: {
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: "flex-end",
  },

  statusText: {
    fontSize: 8,
    fontWeight: "bold",
  },

  // === FOOTER STYLES ===
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
  },

  footerDivider: {
    height: 1,
    backgroundColor: colors.lightGray,
    marginBottom: 10,
  },

  footerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },

  footerLeft: {
    flex: 1,
  },

  footerCenter: {
    flex: 1,
    alignItems: "center",
  },

  footerRight: {
    flex: 1,
    alignItems: "flex-end",
  },

  footerText: {
    fontSize: 8,
    color: colors.gray,
    marginBottom: 1,
  },

  legalText: {
    fontSize: 7,
    color: colors.gray,
    marginTop: 5,
    textAlign: "center",
    fontStyle: "italic",
  },

  // === BODY STYLES ===
  section: {
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 10,
    textTransform: "uppercase",
  },

  // Styles pour les parties (émetteur/client)
  partiesSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },

  partyBox: {
    width: "48%",
    padding: 12,
    backgroundColor: colors.veryLightGray,
    borderRadius: 6,
  },

  partyTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 8,
    textTransform: "uppercase",
  },

  partyInfo: {
    fontSize: 9,
    color: colors.dark,
    marginBottom: 2,
    lineHeight: 1.3,
  },

  partyLabel: {
    fontWeight: "bold",
    color: colors.gray,
  },

  // Styles pour les tableaux
  table: {
    marginBottom: 15,
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: colors.primary,
    padding: 10,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },

  tableHeaderText: {
    fontSize: 9,
    fontWeight: "bold",
    color: colors.white,
    textTransform: "uppercase",
  },

  tableRow: {
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },

  tableRowAlternate: {
    backgroundColor: colors.veryLightGray,
  },

  tableCell: {
    fontSize: 9,
    color: colors.dark,
  },

  // Largeurs des colonnes
  colDescription: { width: "40%" },
  colPrice: { width: "20%", textAlign: "right" },
  colQuantity: { width: "15%", textAlign: "center" },
  colTotal: { width: "25%", textAlign: "right" },

  // Styles pour les totaux
  totalsSection: {
    marginLeft: "auto",
    width: "40%",
    marginTop: 15,
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },

  totalLabel: {
    fontSize: 9,
    color: colors.gray,
  },

  totalValue: {
    fontSize: 9,
    color: colors.dark,
    fontWeight: "bold",
  },

  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
    padding: 12,
    backgroundColor: colors.primary,
    borderRadius: 4,
  },

  grandTotalLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: colors.white,
  },

  grandTotalValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.white,
  },

  // Informations supplémentaires
  infoBox: {
    marginTop: 15,
    padding: 12,
    backgroundColor: colors.veryLightGray,
    borderRadius: 4,
  },

  infoTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 8,
  },

  infoText: {
    fontSize: 9,
    color: colors.dark,
    marginBottom: 2,
    lineHeight: 1.3,
  },
});
