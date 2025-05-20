// src/services/assignedRequestService.ts
import api from "@/lib/api/apiClient";
import { RequestsListResponse, RequestsFilterParams } from "@/types/request";

/**
 * Service pour gérer les demandes assignées à l'administrateur connecté
 */
const assignedRequestService = {
  /**
   * Récupère les demandes assignées à l'administrateur connecté
   * @param filters Paramètres de filtrage et pagination
   * @returns Liste des demandes assignées et informations de pagination
   */
  getAssignedRequests: async (
    filters: RequestsFilterParams = {}
  ): Promise<RequestsListResponse> => {
    try {
      return await api.get<RequestsListResponse>(
        "/admin/assigned-requests/assigned-to-me",
        {
          params: {
            status: filters.status,
            page: filters.page || 1,
            limit: filters.limit || 10,
            sort_by: filters.sort_by || "created_at",
            sort_order: filters.sort_order || "DESC",
          },
        }
      );
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des demandes assignées:",
        error
      );
      throw error;
    }
  },
};

export default assignedRequestService;
