/**
 * Service pour gérer les types de frais
 * Fournit les méthodes pour récupérer les types de frais disponibles pour les factures
 */

import api from "@/lib/api/apiClient";

// Type pour les types de frais
export interface FeeType {
  id: string;
  name: string;
  description: string;
  created_at?: string;
  created_by?: string;
}

/**
 * Service pour les opérations liées aux types de frais
 */
const feeTypeService = {
  /**
   * Récupère tous les types de frais disponibles
   * @returns Liste des types de frais
   */
  getAllFeeTypes: async (): Promise<FeeType[]> => {
    try {
      const response = await api.get<{
        message: string;
        data: FeeType[];
      }>("/admin/fee-types");

      return response.data;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des types de frais:",
        error
      );
      throw error;
    }
  },

  /**
   * Version pour les super admins: récupère tous les types de frais avec plus de détails
   * @returns Liste détaillée des types de frais
   */
  getAllFeeTypesAsSuperAdmin: async (): Promise<FeeType[]> => {
    try {
      const response = await api.get<{
        message: string;
        data: FeeType[];
      }>("/superadmin/fee-types");

      return response.data;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des types de frais:",
        error
      );
      throw error;
    }
  },

  /**
   * Crée un nouveau type de frais (réservé aux super admins)
   * @param name Nom du type de frais
   * @param description Description du type de frais
   * @returns Le type de frais créé
   */
  createFeeType: async (
    name: string,
    description?: string
  ): Promise<FeeType> => {
    try {
      const response = await api.post<{
        message: string;
        data: FeeType;
      }>("/superadmin/fee-types", {
        name,
        description,
      });

      return response.data;
    } catch (error) {
      console.error("Erreur lors de la création du type de frais:", error);
      throw error;
    }
  },

  /**
   * Met à jour un type de frais existant (réservé aux super admins)
   * @param id Identifiant du type de frais
   * @param name Nouveau nom du type de frais (optionnel)
   * @param description Nouvelle description du type de frais (optionnel)
   * @returns Le type de frais mis à jour
   */
  updateFeeType: async (
    id: string,
    name?: string,
    description?: string
  ): Promise<FeeType> => {
    try {
      const response = await api.put<{
        message: string;
        data: FeeType;
      }>(`/superadmin/fee-types/${id}`, {
        name,
        description,
      });

      return response.data;
    } catch (error) {
      console.error(
        `Erreur lors de la mise à jour du type de frais ${id}:`,
        error
      );
      throw error;
    }
  },

  /**
   * Supprime un type de frais (réservé aux super admins)
   * @param id Identifiant du type de frais
   * @returns Message de confirmation
   */
  deleteFeeType: async (
    id: string
  ): Promise<{ message: string; data: { id: string; name: string } }> => {
    try {
      const response = await api.delete<{
        message: string;
        data: { id: string; name: string };
      }>(`/superadmin/fee-types/${id}`);

      return response;
    } catch (error) {
      console.error(
        `Erreur lors de la suppression du type de frais ${id}:`,
        error
      );
      throw error;
    }
  },
};

export default feeTypeService;
