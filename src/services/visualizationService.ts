/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Service pour les données de visualisation du tableau de bord
 */

import api from "@/lib/api/apiClient";
import { API_ROUTES } from "@/lib/api/routes";

// Types pour les données de visualisation
export interface RequestsByStatusData {
  status: string;
  count: number;
  color: string;
}

export interface PaymentsByMethodData {
  method: string;
  count: number;
  amount: number;
  color: string;
}

export interface TimeSeriesDataPoint {
  date: string;
  formattedDate: string;
  requests?: number;
  invoices?: number;
  payments?: number;
  amount?: number;
}

// Conversion des statuts techniques en libellés lisibles
const statusMapping: Record<string, { label: string; color: string }> = {
  en_attente: { label: "En attente", color: "#F59E0B" }, // amber-500
  en_traitement: { label: "En traitement", color: "#3B82F6" }, // blue-500
  facturé: { label: "Facturé", color: "#10B981" }, // emerald-500
  payé: { label: "Payé", color: "#6366F1" }, // indigo-500
  commandé: { label: "Commandé", color: "#8B5CF6" }, // violet-500
  expédié: { label: "Expédié", color: "#EC4899" }, // pink-500
  livré: { label: "Livré", color: "#14B8A6" }, // teal-500
  annulé: { label: "Annulé", color: "#EF4444" }, // red-500
};

// Conversion des méthodes de paiement en libellés lisibles
const paymentMethodMapping: Record<string, { label: string; color: string }> = {
  wave: { label: "Wave", color: "#3B82F6" }, // blue-500
  momo: { label: "Mobile Money", color: "#F59E0B" }, // amber-500
  orange_money: { label: "Orange Money", color: "#F97316" }, // orange-500
  zeepay: { label: "Zeepay", color: "#6366F1" }, // indigo-500
  cash: { label: "Espèces", color: "#10B981" }, // emerald-500
};

/**
 * Service pour récupérer et formater les données de visualisation
 */
const visualizationService = {
  /**
   * Récupère la répartition des demandes par statut
   * @returns Données pour un graphique en camembert/donut
   */
  getRequestsByStatus: async (): Promise<RequestsByStatusData[]> => {
    try {
      // Dans un cas idéal, l'API fournirait directement cette statistique
      // Mais nous pouvons la construire à partir des données disponibles

      // Récupérer toutes les demandes (avec une limite raisonnable)
      const response = await api.get(API_ROUTES.ADMIN_REQUESTS.LIST, {
        params: {
          limit: 100, // Une limite qui permet d'avoir une vue représentative
        },
      });

      const requests = response.data.requests;

      // Compter les demandes par statut
      const countByStatus: Record<string, number> = {};

      requests.forEach((request: any) => {
        const status = request.status;
        countByStatus[status] = (countByStatus[status] || 0) + 1;
      });

      // Transformer en format pour le graphique
      const result: RequestsByStatusData[] = Object.entries(countByStatus).map(
        ([status, count]) => ({
          status: statusMapping[status]?.label || status,
          count,
          color: statusMapping[status]?.color || "#94A3B8", // slate-400 comme couleur par défaut
        })
      );

      return result;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des demandes par statut:",
        error
      );
      throw error;
    }
  },

  /**
   * Récupère la répartition des paiements par méthode
   * @returns Données pour un graphique en camembert/donut ou barres
   */
  getPaymentsByMethod: async (): Promise<PaymentsByMethodData[]> => {
    try {
      // Récupérer les statistiques des paiements
      const response = await api.get(API_ROUTES.ADMIN_PAYMENTS.LIST, {
        params: {
          limit: 1, // Nous avons juste besoin des statistiques, pas des éléments individuels
        },
      });

      // Les statistiques de méthodes de paiement devraient être dans response.data.stats.methods
      const methods = response.data.stats.methods || {};

      // Transformer en format pour le graphique
      const result: PaymentsByMethodData[] = Object.entries(methods).map(
        ([method, data]: [string, any]) => ({
          method: paymentMethodMapping[method]?.label || method,
          count: data.count,
          amount: data.total,
          color: paymentMethodMapping[method]?.color || "#94A3B8", // slate-400 comme couleur par défaut
        })
      );

      return result;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des paiements par méthode:",
        error
      );
      throw error;
    }
  },

  /**
   * Récupère les données des 7 derniers jours pour les demandes, factures et paiements
   * @returns Données pour un graphique en courbes ou en barres
   */
  getActivityTimeSeriesData: async (): Promise<TimeSeriesDataPoint[]> => {
    try {
      // Calculer la plage de dates (7 derniers jours)
      const today = new Date();
      const dates: Date[] = [];

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        dates.push(date);
      }

      // Créer l'objet de données pour la série temporelle
      const timeSeriesData: TimeSeriesDataPoint[] = dates.map((date) => {
        const dateString = date.toISOString().split("T")[0];
        const formattedDate = date.toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "short",
        });

        return {
          date: dateString,
          formattedDate,
          requests: 0,
          invoices: 0,
          payments: 0,
          amount: 0,
        };
      });

      // Dans un cas idéal, l'API fournirait une statistique quotidienne
      // Comme alternative, nous pouvons faire des appels séparés pour chaque type de données

      // Récupérer les demandes des 7 derniers jours
      const sevenDaysAgo = dates[0].toISOString().split("T")[0];

      const [requestsResponse, invoicesResponse, paymentsResponse] =
        await Promise.all([
          // Demandes récentes
          api.get(API_ROUTES.ADMIN_REQUESTS.LIST, {
            params: {
              date_from: sevenDaysAgo,
              limit: 100,
            },
          }),

          // Factures récentes
          api.get(API_ROUTES.ADMIN_INVOICES.LIST, {
            params: {
              date_from: sevenDaysAgo,
              limit: 100,
            },
          }),

          // Paiements récents
          api.get(API_ROUTES.ADMIN_PAYMENTS.LIST, {
            params: {
              date_from: sevenDaysAgo,
              limit: 100,
            },
          }),
        ]);

      // Traiter les demandes
      const requests = requestsResponse.data.requests || [];
      requests.forEach((request: any) => {
        const createdDate = request.created_at.split("T")[0];
        const dataPoint = timeSeriesData.find((d) => d.date === createdDate);
        if (dataPoint) {
          dataPoint.requests = (dataPoint.requests || 0) + 1;
        }
      });

      // Traiter les factures
      const invoices = invoicesResponse.data.invoices || [];
      invoices.forEach((invoice: any) => {
        const createdDate = invoice.created_at.split("T")[0];
        const dataPoint = timeSeriesData.find((d) => d.date === createdDate);
        if (dataPoint) {
          dataPoint.invoices = (dataPoint.invoices || 0) + 1;
        }
      });

      // Traiter les paiements
      const payments = paymentsResponse.data.payments || [];
      payments.forEach((payment: any) => {
        const paymentDate = payment.payment_date.split("T")[0];
        const dataPoint = timeSeriesData.find((d) => d.date === paymentDate);
        if (dataPoint) {
          dataPoint.payments = (dataPoint.payments || 0) + 1;
          dataPoint.amount = (dataPoint.amount || 0) + payment.amount_paid;
        }
      });

      return timeSeriesData;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des données de série temporelle:",
        error
      );
      throw error;
    }
  },

  /**
   * Récupère toutes les données de visualisation en une seule fonction
   * @returns Toutes les données pour les visualisations
   */
  getAllVisualizationData: async (): Promise<{
    requestsByStatus: RequestsByStatusData[];
    paymentsByMethod: PaymentsByMethodData[];
    timeSeriesData: TimeSeriesDataPoint[];
  }> => {
    try {
      // Appels API en parallèle pour de meilleures performances
      const [requestsByStatus, paymentsByMethod, timeSeriesData] =
        await Promise.all([
          visualizationService.getRequestsByStatus(),
          visualizationService.getPaymentsByMethod(),
          visualizationService.getActivityTimeSeriesData(),
        ]);

      return {
        requestsByStatus,
        paymentsByMethod,
        timeSeriesData,
      };
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des données de visualisation:",
        error
      );
      throw error;
    }
  },
};

export default visualizationService;
