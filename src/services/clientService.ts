// src/services/clientService.ts
import api from "@/lib/api/apiClient";

interface ClientInfo {
  whatsapp_number: string;
  full_name?: string;
  email?: string;
  adresse?: string;
}

const clientService = {
  /**
   * Vérifie si un numéro WhatsApp est déjà enregistré
   * @param whatsappNumber Le numéro WhatsApp à vérifier
   * @returns Résultat de la vérification
   */
  checkWhatsappNumber: async (whatsappNumber: string) => {
    try {
      return await api.get(
        `/admin/clients/check-whatsapp/${encodeURIComponent(whatsappNumber)}`
      );
    } catch (error) {
      console.error(
        "Erreur lors de la vérification du numéro WhatsApp:",
        error
      );
      throw error;
    }
  },

  /**
   * Enregistre ou met à jour un client
   * @param clientData Les données du client
   * @returns Les informations du client enregistré
   */
  registerClient: async (clientData: ClientInfo) => {
    try {
      return await api.post("/admin/clients/register-client", clientData);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du client:", error);
      throw error;
    }
  },
};

export default clientService;
