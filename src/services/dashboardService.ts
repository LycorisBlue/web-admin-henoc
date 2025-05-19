/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Service pour les données du tableau de bord
 * Centralise les appels API pour les statistiques et informations du dashboard
 */

import api from "@/lib/api/apiClient";
import { API_ROUTES } from "@/lib/api/routes";

// Types pour les réponses des différentes API
interface PaginationResponse {
  total_items: number;
  total_pages: number;
  current_page: number;
  items_per_page: number;
  has_next_page: boolean;
  has_previous_page: boolean;
}

interface RequestsResponse {
  message: string;
  data: {
    requests: any[];
    pagination: PaginationResponse;
  };
}

interface InvoicesResponse {
  message: string;
  data: {
    invoices: any[];
    pagination: PaginationResponse;
  };
}

interface PaymentsResponse {
  message: string;
  data: {
    payments: any[];
    pagination: PaginationResponse;
    stats: {
      total_amount: number;
      methods: Record<
        string,
        {
          count: number;
          total: number;
        }
      >;
    };
  };
}

// Type pour les activités récentes
export type ActivityType = "request" | "invoice" | "payment" | "status_change";

export interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  status: string;
  date: string;
  details?: {
    request_id?: string;
    invoice_id?: string;
    payment_id?: string;
    client_name?: string;
    amount?: number;
    method?: string;
    previous_status?: string;
    new_status?: string;
  };
}

interface RecentActivitiesResponse {
  message: string;
  data: {
    activities: Activity[];
    pagination?: PaginationResponse;
  };
}

// Type pour le retour des statistiques consolidées
export interface DashboardStats {
  pendingRequests: {
    count: number;
    isLoading: boolean;
    error: string | null;
  };
  unpaidInvoices: {
    count: number;
    isLoading: boolean;
    error: string | null;
  };
  recentPayments: {
    totalAmount: number;
    count: number;
    isLoading: boolean;
    error: string | null;
  };
}

/**
 * Service pour récupérer les données du tableau de bord
 */
const dashboardService = {
  /**
   * Récupère le nombre de demandes en attente
   * @returns Nombre de demandes en attente
   */
  getPendingRequestsCount: async (): Promise<number> => {
    try {
      const response = await api.get<RequestsResponse>(
        API_ROUTES.ADMIN_REQUESTS.LIST,
        {
          params: {
            status: "en_attente",
            limit: 1, // On n'a besoin que du total, pas des données réelles
          },
        }
      );
      return response.data.pagination.total_items;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des demandes en attente:",
        error
      );
      throw error;
    }
  },

  /**
   * Récupère le nombre de factures impayées
   * @returns Nombre de factures impayées
   */
  getUnpaidInvoicesCount: async (): Promise<number> => {
    try {
      const response = await api.get<InvoicesResponse>(
        API_ROUTES.ADMIN_INVOICES.LIST,
        {
          params: {
            status: "en_attente",
            payment_status: "unpaid",
            limit: 1, // On n'a besoin que du total, pas des données réelles
          },
        }
      );
      return response.data.pagination.total_items;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des factures impayées:",
        error
      );
      throw error;
    }
  },

  /**
   * Récupère les paiements récents (du mois en cours)
   * @returns Montant total des paiements récents et leur nombre
   */
  getRecentPaymentsStats: async (): Promise<{
    totalAmount: number;
    count: number;
  }> => {
    try {
      // Calcul de la date du premier jour du mois courant
      const today = new Date();
      const firstDayOfMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );
      const dateFrom = firstDayOfMonth.toISOString().split("T")[0]; // Format YYYY-MM-DD

      const response = await api.get<PaymentsResponse>(
        API_ROUTES.ADMIN_PAYMENTS.LIST,
        {
          params: {
            date_from: dateFrom,
            limit: 1, // On n'a besoin que des stats, pas des données réelles
          },
        }
      );

      return {
        totalAmount: response.data.stats.total_amount,
        count: response.data.pagination.total_items,
      };
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des paiements récents:",
        error
      );
      throw error;
    }
  },

  /**
   * Récupère toutes les statistiques du tableau de bord en une seule fonction
   * @returns Toutes les statistiques du tableau de bord
   */
  getAllDashboardStats: async (): Promise<{
    pendingRequests: number;
    unpaidInvoices: number;
    recentPayments: { totalAmount: number; count: number };
  }> => {
    try {
      // Appels API en parallèle pour de meilleures performances
      const [pendingRequests, unpaidInvoices, recentPayments] =
        await Promise.all([
          dashboardService.getPendingRequestsCount(),
          dashboardService.getUnpaidInvoicesCount(),
          dashboardService.getRecentPaymentsStats(),
        ]);

      return {
        pendingRequests,
        unpaidInvoices,
        recentPayments,
      };
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des statistiques du tableau de bord:",
        error
      );
      throw error;
    }
  },

  /**
   * Récupère l'activité récente (dernières demandes, factures, paiements)
   * @param limit Nombre maximum d'éléments à récupérer
   * @returns Liste des activités récentes
   */
  getRecentActivities: async (limit: number = 5): Promise<Activity[]> => {
    try {
      // Idéalement, il devrait y avoir un endpoint API spécifique pour récupérer l'activité récente
      // Mais comme nous n'en avons pas explicitement dans la documentation, nous devons créer une stratégie alternative

      // Option 1: Utiliser un endpoint dédié s'il existe (solution idéale)
      try {
        // Cette approche présuppose l'existence d'un endpoint API pour les activités
        // Si cet endpoint n'existe pas, nous passerons à l'option 2
        const response = await api.get<RecentActivitiesResponse>(
          "/admin/activities", // Endpoint hypothétique
          {
            params: {
              limit,
              sort_by: "date",
              sort_order: "DESC",
            },
          }
        );
        return response.data.activities;
      } catch (error) {
        console.log(
          "Endpoint d'activités non disponible, combinaison d'autres endpoints..." + error
        );
        // Si l'endpoint dédié n'existe pas, passons à l'option 2
      }

      // Option 2: Combinaison de plusieurs appels API pour créer une liste d'activités
      // Récupérer les dernières demandes, factures et paiements, puis les fusionner
      const [requestsResponse, invoicesResponse, paymentsResponse] =
        await Promise.all([
          api.get<RequestsResponse>(API_ROUTES.ADMIN_REQUESTS.LIST, {
            params: { limit: 3, sort_by: "updated_at", sort_order: "DESC" },
          }),
          api.get<InvoicesResponse>(API_ROUTES.ADMIN_INVOICES.LIST, {
            params: { limit: 3, sort_by: "created_at", sort_order: "DESC" },
          }),
          api.get<PaymentsResponse>(API_ROUTES.ADMIN_PAYMENTS.LIST, {
            params: { limit: 3, sort_by: "payment_date", sort_order: "DESC" },
          }),
        ]);

      // Transformer les demandes en activités
      const requestActivities: Activity[] = requestsResponse.data.requests.map(
        (request) => ({
          id: `request-${request.id}`,
          type: "request",
          description: `Demande de ${request.client?.full_name || "Client"}`,
          status: request.status,
          date: request.updated_at || request.created_at,
          details: {
            request_id: request.id,
            client_name: request.client?.full_name,
          },
        })
      );

      // Transformer les factures en activités
      const invoiceActivities: Activity[] = invoicesResponse.data.invoices.map(
        (invoice) => ({
          id: `invoice-${invoice.id}`,
          type: "invoice",
          description: `Facture #${invoice.id.substring(0, 8)} pour ${
            invoice.client?.full_name || "Client"
          }`,
          status: invoice.status,
          date: invoice.created_at,
          details: {
            invoice_id: invoice.id,
            client_name: invoice.client?.full_name,
            amount: invoice.total_amount,
          },
        })
      );

      // Transformer les paiements en activités
      const paymentActivities: Activity[] = paymentsResponse.data.payments.map(
        (payment) => ({
          id: `payment-${payment.id}`,
          type: "payment",
          description: `Paiement reçu pour la facture #${payment.invoice_id.substring(
            0,
            8
          )}`,
          status: "completed",
          date: payment.payment_date,
          details: {
            payment_id: payment.id,
            invoice_id: payment.invoice_id,
            amount: payment.amount_paid,
            method: payment.method,
          },
        })
      );

      // Fusionner et trier toutes les activités par date
      const allActivities = [
        ...requestActivities,
        ...invoiceActivities,
        ...paymentActivities,
      ]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, limit);

      return allActivities;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des activités récentes:",
        error
      );
      throw error;
    }
  },
};

export default dashboardService;
