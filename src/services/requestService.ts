/**
 * Service pour gérer les demandes client
 * Fournit les méthodes pour récupérer, filtrer et modifier les demandes
 */

import api from "@/lib/api/apiClient";
import { API_ROUTES } from "@/lib/api/routes";
import {
  RequestsFilterParams,
  RequestsListResponse,
  RequestDetailsResponse,
  UpdateStatusParams,
  UpdateStatusResponse,
  AssignRequestParams,
  AssignRequestResponse,
} from "@/types/request";

/**
 * Service pour les opérations liées aux demandes client
 */
const requestService = {
  /**
   * Récupère la liste des demandes avec filtres et pagination
   * @param filters Paramètres de filtrage et pagination
   * @returns Liste des demandes et informations de pagination
   */
  getRequests: async (
    filters: RequestsFilterParams = {}
  ): Promise<RequestsListResponse> => {
    try {
      return await api.get<RequestsListResponse>(
        API_ROUTES.ADMIN_REQUESTS.LIST,
        {
          params: {
            status: filters.status,
            client_id: filters.client_id,
            whatsapp_number: filters.whatsapp_number,
            assigned_admin_id: filters.assigned_admin_id,
            unassigned: filters.unassigned ? "true" : undefined,
            page: filters.page || 1,
            limit: filters.limit || 10,
            sort_by: filters.sort_by || "created_at",
            sort_order: filters.sort_order || "DESC",
          },
        }
      );
    } catch (error) {
      console.error("Erreur lors de la récupération des demandes:", error);
      throw error;
    }
  },

  /**
   * Récupère les détails d'une demande spécifique
   * @param id Identifiant de la demande
   * @returns Détails complets de la demande
   */
  getRequestDetails: async (id: string): Promise<RequestDetailsResponse> => {
    try {
      return await api.get<RequestDetailsResponse>(
        API_ROUTES.ADMIN_REQUESTS.DETAILS(id)
      );
    } catch (error) {
      console.error(
        `Erreur lors de la récupération des détails de la demande ${id}:`,
        error
      );
      throw error;
    }
  },

  /**
   * Met à jour le statut d'une demande
   * @param id Identifiant de la demande
   * @param params Nouveau statut et commentaire optionnel
   * @returns Résultat de la mise à jour
   */
  updateRequestStatus: async (
    id: string,
    params: UpdateStatusParams
  ): Promise<UpdateStatusResponse> => {
    try {
      return await api.put<UpdateStatusResponse>(
        API_ROUTES.ADMIN_REQUESTS.UPDATE_STATUS(id),
        params
      );
    } catch (error) {
      console.error(
        `Erreur lors de la mise à jour du statut de la demande ${id}:`,
        error
      );
      throw error;
    }
  },

  /**
   * Assigne une demande à un administrateur
   * @param id Identifiant de la demande
   * @param params Paramètres d'assignation (admin_id optionnel)
   * @returns Résultat de l'assignation
   */
  assignRequest: async (
    id: string,
    params: AssignRequestParams = {}
  ): Promise<AssignRequestResponse> => {
    try {
      return await api.put<AssignRequestResponse>(
        API_ROUTES.ADMIN_REQUESTS.ASSIGN(id),
        params
      );
    } catch (error) {
      console.error(`Erreur lors de l'assignation de la demande ${id}:`, error);
      throw error;
    }
  },

  /**
   * Récupère le nombre de demandes par statut
   * Utile pour les statistiques ou filtres
   * @returns Objet avec le nombre de demandes par statut
   */
  getRequestCountByStatus: async (): Promise<Record<string, number>> => {
    try {
      // Cette fonctionnalité n'est pas directement exposée par l'API
      // Donc nous faisons un appel pour chaque statut et collectons les totaux
      const statuses = [
        "en_attente",
        "en_traitement",
        "facturé",
        "payé",
        "commandé",
        "expédié",
        "livré",
        "annulé",
      ];

      const promises = statuses.map((status) =>
        api.get<RequestsListResponse>(API_ROUTES.ADMIN_REQUESTS.LIST, {
          params: { status, limit: 1 }, // On ne récupère qu'un élément car on veut juste le total
        })
      );

      const responses = await Promise.all(promises);

      // Construire un objet avec le décompte par statut
      const countByStatus: Record<string, number> = {};

      responses.forEach((response, index) => {
        countByStatus[statuses[index]] = response.data.pagination.total_items;
      });

      return countByStatus;
    } catch (error) {
      console.error("Erreur lors du comptage des demandes par statut:", error);
      throw error;
    }
  },
};

export default requestService;
