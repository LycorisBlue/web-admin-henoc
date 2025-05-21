/**
 * Service pour gérer les factures
 * Fournit les méthodes pour récupérer, filtrer, créer et modifier les factures
 */

import api from "@/lib/api/apiClient";
import { API_ROUTES } from "@/lib/api/routes";
import {
  InvoicesFilterParams,
  InvoicesListResponse,
  InvoiceDetailsResponse,
  CreateInvoiceParams,
  CreateInvoiceResponse,
  CreatePaymentParams,
  CreatePaymentResponse,
} from "../types/invoice";

/**
 * Service pour les opérations liées aux factures
 */
const invoiceService = {
  /**
   * Récupère la liste des factures avec filtres et pagination
   * @param filters Paramètres de filtrage et pagination
   * @returns Liste des factures et informations de pagination
   */
  getInvoices: async (
    filters: InvoicesFilterParams = {}
  ): Promise<InvoicesListResponse> => {
    try {
      return await api.get<InvoicesListResponse>(
        API_ROUTES.ADMIN_INVOICES.LIST,
        {
          params: {
            status: filters.status,
            client_id: filters.client_id,
            whatsapp_number: filters.whatsapp_number,
            admin_id: filters.admin_id,
            min_amount: filters.min_amount,
            max_amount: filters.max_amount,
            date_from: filters.date_from,
            date_to: filters.date_to,
            payment_status: filters.payment_status,
            page: filters.page || 1,
            limit: filters.limit || 10,
            sort_by: filters.sort_by || "created_at",
            sort_order: filters.sort_order || "DESC",
          },
        }
      );
    } catch (error) {
      console.error("Erreur lors de la récupération des factures:", error);
      throw error;
    }
  },

  /**
   * Récupère les détails d'une facture spécifique
   * @param id Identifiant de la facture
   * @returns Détails complets de la facture
   */
  getInvoiceDetails: async (id: string): Promise<InvoiceDetailsResponse> => {
    try {
      return await api.get<InvoiceDetailsResponse>(
        API_ROUTES.ADMIN_INVOICES.DETAILS(id)
      );
    } catch (error) {
      console.error(
        `Erreur lors de la récupération des détails de la facture ${id}:`,
        error
      );
      throw error;
    }
  },

  /**
   * Crée une nouvelle facture pour une demande
   * @param requestId Identifiant de la demande
   * @param params Paramètres de la facture (articles, frais)
   * @returns Résultat de la création
   */
  createInvoice: async (
    requestId: string,
    params: CreateInvoiceParams
  ): Promise<CreateInvoiceResponse> => {
    try {
      return await api.post<CreateInvoiceResponse>(
        API_ROUTES.ADMIN_REQUESTS.CREATE_INVOICE(requestId),
        params
      );
    } catch (error) {
      console.error(
        `Erreur lors de la création de la facture pour la demande ${requestId}:`,
        error
      );
      throw error;
    }
  },

  /**
   * Enregistre un paiement pour une facture
   * @param invoiceId Identifiant de la facture
   * @param params Paramètres du paiement
   * @returns Résultat de l'enregistrement du paiement
   */
  createPayment: async (
    invoiceId: string,
    params: CreatePaymentParams
  ): Promise<CreatePaymentResponse> => {
    try {
      return await api.post<CreatePaymentResponse>(
        API_ROUTES.ADMIN_INVOICES.CREATE_PAYMENT(invoiceId),
        params
      );
    } catch (error) {
      console.error(
        `Erreur lors de l'enregistrement du paiement pour la facture ${invoiceId}:`,
        error
      );
      throw error;
    }
  },

  /**
   * Récupère le nombre de factures par statut
   * Utile pour les statistiques ou filtres
   * @returns Objet avec le nombre de factures par statut
   */
  getInvoiceCountByStatus: async (): Promise<Record<string, number>> => {
    try {
      // Cette fonctionnalité n'est pas directement exposée par l'API
      // Donc nous faisons un appel pour chaque statut et collectons les totaux
      const statuses = ["en_attente", "payé", "annulé"];
      const paymentStatuses = ["paid", "partial", "unpaid"];

      const promises = [
        ...statuses.map((status) =>
          api.get<InvoicesListResponse>(API_ROUTES.ADMIN_INVOICES.LIST, {
            params: { status, limit: 1 }, // On ne récupère qu'un élément car on veut juste le total
          })
        ),
        ...paymentStatuses.map((payment_status) =>
          api.get<InvoicesListResponse>(API_ROUTES.ADMIN_INVOICES.LIST, {
            params: { payment_status, limit: 1 },
          })
        ),
      ];

      const responses = await Promise.all(promises);

      // Construire un objet avec le décompte par statut
      const countByStatus: Record<string, number> = {};

      // Traiter les statuts standards
      responses.slice(0, statuses.length).forEach((response, index) => {
        countByStatus[statuses[index]] = response.data.pagination.total_items;
      });

      // Traiter les statuts de paiement
      responses
        .slice(statuses.length, statuses.length + paymentStatuses.length)
        .forEach((response, index) => {
          countByStatus[`payment_${paymentStatuses[index]}`] =
            response.data.pagination.total_items;
        });

      return countByStatus;
    } catch (error) {
      console.error("Erreur lors du comptage des factures par statut:", error);
      throw error;
    }
  },

  /**
   * Récupère le montant total des factures par période
   * @param period Période (jour, semaine, mois, année)
   * @returns Total des montants de factures
   */
  getTotalInvoiceAmount: async (
    period: "day" | "week" | "month" | "year" = "month"
  ): Promise<number> => {
    try {
      // Calculer les dates en fonction de la période
      const endDate = new Date();
      const startDate = new Date();

      switch (period) {
        case "day":
          startDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          startDate.setDate(startDate.getDate() - startDate.getDay());
          startDate.setHours(0, 0, 0, 0);
          break;
        case "month":
          startDate.setDate(1);
          startDate.setHours(0, 0, 0, 0);
          break;
        case "year":
          startDate.setMonth(0, 1);
          startDate.setHours(0, 0, 0, 0);
          break;
      }

      const dateFrom = startDate.toISOString().split("T")[0];
      const dateTo = endDate.toISOString().split("T")[0];

      // Récupérer toutes les factures de la période (avec pagination)
      let totalAmount = 0;
      let page = 1;
      let hasNextPage = true;

      while (hasNextPage) {
        const response = await api.get<InvoicesListResponse>(
          API_ROUTES.ADMIN_INVOICES.LIST,
          {
            params: {
              date_from: dateFrom,
              date_to: dateTo,
              status: "payé", // Seulement les factures payées
              page,
              limit: 100, // Récupérer par lots de 100
            },
          }
        );

        // Additionner les montants
        response.data.invoices.forEach((invoice) => {
          totalAmount += invoice.total_amount;
        });

        // Vérifier s'il y a une page suivante
        hasNextPage = response.data.pagination.has_next_page;
        page++;
      }

      return totalAmount;
    } catch (error) {
      console.error(
        "Erreur lors du calcul du montant total des factures:",
        error
      );
      throw error;
    }
  },
};

export default invoiceService;
