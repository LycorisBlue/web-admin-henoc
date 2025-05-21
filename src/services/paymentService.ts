/**
 * Service pour gérer les paiements
 * Fournit les méthodes pour récupérer, filtrer et analyser les paiements
 */

import api from "@/lib/api/apiClient";
import { API_ROUTES } from "@/lib/api/routes";

// Type pour les clients
interface PaymentClient {
  id: string;
  whatsapp_number: string;
  full_name: string;
  email?: string;
}

// Type pour la requête associée
interface PaymentRequest {
  id: string;
  description: string;
  status: string;
}

// Types pour les paiements
export interface Payment {
  id: string;
  invoice_id: string;
  amount_paid: number;
  method: "wave" | "momo" | "orange_money" | "zeepay" | "cash";
  payment_date: string;
  reference?: string;
  confirmed_by: {
    id: string;
    name: string;
    email: string;
  };
  created_at: string;
  // Ajout des propriétés liées à la facture et au client
  invoice?: {
    id: string;
    total_amount: number;
    status: string;
  };
  client?: PaymentClient;
  request?: PaymentRequest;
}

// Paramètres pour filtrer les paiements
export interface PaymentsFilterParams {
  method?: string;
  client_id?: string;
  whatsapp_number?: string;
  admin_id?: string;
  min_amount?: number;
  max_amount?: number;
  date_from?: string;
  date_to?: string;
  invoice_id?: string;
  request_id?: string;
  page?: number;
  limit?: number;
  sort_by?: "payment_date" | "amount_paid" | "created_at";
  sort_order?: "ASC" | "DESC";
}

// Pagination
export interface PaginationInfo {
  total_items: number;
  total_pages: number;
  current_page: number;
  items_per_page: number;
  has_next_page: boolean;
  has_previous_page: boolean;
}

// Réponse de l'API pour la liste des paiements
export interface PaymentsListResponse {
  message: string;
  data: {
    payments: Payment[];
    pagination: PaginationInfo;
    stats?: {
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

/**
 * Service pour les opérations liées aux paiements
 */
const paymentService = {
  /**
   * Récupère la liste des paiements avec filtres et pagination
   * @param filters Paramètres de filtrage et pagination
   * @returns Liste des paiements et informations de pagination
   */
  getPayments: async (
    filters: PaymentsFilterParams = {}
  ): Promise<PaymentsListResponse> => {
    try {
      return await api.get<PaymentsListResponse>(
        API_ROUTES.ADMIN_PAYMENTS.LIST,
        {
          params: {
            method: filters.method,
            client_id: filters.client_id,
            whatsapp_number: filters.whatsapp_number,
            admin_id: filters.admin_id,
            min_amount: filters.min_amount,
            max_amount: filters.max_amount,
            date_from: filters.date_from,
            date_to: filters.date_to,
            invoice_id: filters.invoice_id,
            request_id: filters.request_id,
            page: filters.page || 1,
            limit: filters.limit || 10,
            sort_by: filters.sort_by || "payment_date",
            sort_order: filters.sort_order || "DESC",
          },
        }
      );
    } catch (error) {
      console.error("Erreur lors de la récupération des paiements:", error);
      throw error;
    }
  },

  /**
   * Récupère les paiements d'une facture spécifique
   * @param invoiceId Identifiant de la facture
   * @returns Liste des paiements de la facture
   */
  getPaymentsByInvoice: async (
    invoiceId: string
  ): Promise<PaymentsListResponse> => {
    try {
      return await paymentService.getPayments({
        invoice_id: invoiceId,
        limit: 100,
      });
    } catch (error) {
      console.error(
        `Erreur lors de la récupération des paiements pour la facture ${invoiceId}:`,
        error
      );
      throw error;
    }
  },

  /**
   * Récupère les statistiques des paiements sur une période
   * @param period Période (jour, semaine, mois, année)
   * @returns Statistiques des paiements
   */
  getPaymentStats: async (
    period: "day" | "week" | "month" | "year" = "month"
  ): Promise<{
    totalAmount: number;
    totalCount: number;
    methodBreakdown: Record<string, { count: number; total: number }>;
  }> => {
    try {
      // Calculer les dates en fonction de la période
      const endDate = new Date();
      const startDate = new Date();
  
      switch (period) {
        case "day":
          startDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          // Utiliser exactement 7 jours en arrière
          startDate.setDate(startDate.getDate() - 7);
          startDate.setHours(0, 0, 0, 0);
          break;
        case "month":
          // Remonter 30 jours en arrière au lieu du début du mois
          // car il pourrait y avoir un décalage avec les données du serveur
          startDate.setDate(startDate.getDate() - 30);
          startDate.setHours(0, 0, 0, 0);
          break;
        case "year":
          // Remonter 365 jours en arrière au lieu du début de l'année
          startDate.setDate(startDate.getDate() - 365);
          startDate.setHours(0, 0, 0, 0);
          break;
      }
  
      const dateFrom = startDate.toISOString().split("T")[0];
      const dateTo = endDate.toISOString().split("T")[0];
  
      // Ajouter des logs pour le débogage
  
      // Récupérer toutes les statistiques de paiement sans filtre de date d'abord
      // pour voir s'il y a des paiements dans le système
      const allResponse = await api.get<PaymentsListResponse>(
        API_ROUTES.ADMIN_PAYMENTS.LIST,
        {
          params: {
          },
        }
      );


  
      // Maintenant récupérer avec le filtre de date
      const response = await api.get<PaymentsListResponse>(
        API_ROUTES.ADMIN_PAYMENTS.LIST,
        {
          params: {
            date_from: dateFrom,
            date_to: dateTo,
          },
        }
      );

      console.log(
        "Statistiques de paiement avec all:",
        allResponse.data
      );

      console.log(
        "Statistiques de paiement avec simple:",
        response.data.stats
      );

      // Si aucun paiement dans la période, essayer d'élargir la période
      if (response.data.pagination.total_items === 0 && allResponse.data.pagination.total_items > 0) {
        return {
          totalAmount: allResponse.data.stats?.total_amount || 0,
          totalCount: allResponse.data.pagination.total_items,
          methodBreakdown: allResponse.data.stats?.methods || {},
        };
      }
  
      return {
        totalAmount: response.data.stats?.total_amount || 0,
        totalCount: response.data.pagination.total_items,
        methodBreakdown: response.data.stats?.methods || {},
      };
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques de paiement:", error);
      throw error;
    }
  },

  /**
   * Formate une méthode de paiement pour l'affichage
   * @param method Code de la méthode de paiement
   * @returns Libellé formaté de la méthode
   */
  formatPaymentMethod: (method: string): string => {
    const methodMap: Record<string, string> = {
      wave: "Wave",
      momo: "Mobile Money",
      orange_money: "Orange Money",
      zeepay: "Zeepay",
      cash: "Espèces",
    };

    return methodMap[method] || method;
  },
};

export default paymentService;
