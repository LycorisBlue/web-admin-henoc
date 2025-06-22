/**
 * Fonctions utilitaires pour la génération de PDF
 */

// Formater un montant en devise (XOF)
export const formatCurrency = (amount: number): string => {
  const formatted = new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  return `${formatted.replace(/\u202F/g, " ")} FCFA`;
};

// Formater le numéro de facture
export const formatInvoiceNumber = (id: string): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `FAC-${year}${month}-${id.substring(0, 4).toUpperCase()}`;
};

// Formater le statut de la facture
export const formatInvoiceStatus = (status: string): string => {
  const statusMap: { [key: string]: string } = {
    en_attente: "En attente",
    payé: "Payée",
    annulé: "Annulée",
  };
  return statusMap[status] || status;
};

// Obtenir les styles de statut
export const getStatusStyle = (status: string) => {
  switch (status) {
    case "payé":
      return {
        badge: { backgroundColor: "#D4EDDA" },
        text: { color: "#155724" },
      };
    case "annulé":
      return {
        badge: { backgroundColor: "#F8D7DA" },
        text: { color: "#721C24" },
      };
    default:
      return {
        badge: { backgroundColor: "#FFF3CD" },
        text: { color: "#856404" },
      };
  }
};

// Convertir un nombre en lettres (simplifié)
export const numberToWords = (num: number): string => {
  return `${Math.floor(num).toLocaleString("fr-FR")} francs CFA`;
};
