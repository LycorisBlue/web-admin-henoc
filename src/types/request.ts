/**
 * Types pour la gestion des demandes client
 * Basés sur les schémas API définis dans Swagger
 */

// Statuts possibles pour une demande
export type RequestStatus =
  | "en_attente"
  | "en_traitement"
  | "facturé"
  | "payé"
  | "commandé"
  | "expédié"
  | "livré"
  | "annulé";

// Client lié à une demande
export interface Client {
  id: string;
  whatsapp_number: string;
  full_name: string;
  email?: string;
  adresse?: string;
}

// Administrateur assigné à une demande
export interface AssignedAdmin {
  id: string;
  name: string;
  email: string;
  is_current_admin: boolean;
}

// Lien produit associé à une demande
export interface ProductLink {
  id: string;
  url: string;
  note?: string;
  created_at: string;
}

// Entrée d'historique de statut
export interface StatusHistoryEntry {
  id: string;
  previous_status: RequestStatus;
  new_status: RequestStatus;
  comment?: string;
  created_at: string;
  admin: {
    id: string;
    name: string;
  };
}

// Informations basiques de facture
export interface InvoiceBasicInfo {
  id: string;
  total_amount: number;
  status: "en_attente" | "payé" | "annulé";
  created_at: string;
  payments?: PaymentBasicInfo[];
}

// Informations basiques de paiement
export interface PaymentBasicInfo {
  id: string;
  amount_paid: number;
  method: "wave" | "momo" | "orange_money" | "zeepay" | "cash";
  payment_date: string;
  confirmed_by: {
    id: string;
    name: string;
  };
}

// Détail complet d'une demande
export interface RequestDetails {
  id: string;
  description: string;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
  permissions: {
    can_modify: boolean;
  };
  client: Client;
  product_links: ProductLink[];
  assigned_admin: AssignedAdmin | null;
  invoice: InvoiceBasicInfo | null;
  status_history: StatusHistoryEntry[];
}

// Résumé d'une demande (pour la liste)
export interface RequestSummary {
  id: string;
  status: RequestStatus;
  client: {
    id: string;
    whatsapp_number: string;
    full_name: string;
  };
  assigned_admin_id: string | null;
  created_at: string;
  updated_at: string;
}

// Paramètres pour filtrer les demandes
export interface RequestsFilterParams {
  status?: RequestStatus;
  client_id?: string;
  whatsapp_number?: string;
  assigned_admin_id?: string;
  unassigned?: boolean;
  page?: number;
  limit?: number;
  sort_by?: "created_at" | "updated_at" | "status";
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

// Réponse de l'API pour la liste des demandes
export interface RequestsListResponse {
  message: string;
  data: {
    requests: RequestSummary[];
    pagination: PaginationInfo;
  };
}

// Réponse de l'API pour les détails d'une demande
export interface RequestDetailsResponse {
  message: string;
  data: RequestDetails;
}

// Paramètres pour mettre à jour le statut d'une demande
export interface UpdateStatusParams {
  status: RequestStatus;
  comment?: string;
}

// Paramètres pour assigner une demande
export interface AssignRequestParams {
  admin_id?: string; // Si non fourni, assigne à l'admin connecté
}

// Réponse après mise à jour du statut
export interface UpdateStatusResponse {
  message: string;
  data: {
    request_id: string;
    previous_status: RequestStatus;
    new_status: RequestStatus;
    client: {
      id: string;
      whatsapp_number: string;
      full_name: string;
    };
    assigned_admin_id: string;
  };
}

// Réponse après assignation d'une demande
export interface AssignRequestResponse {
  message: string;
  data: {
    request_id: string;
    assigned_admin_id: string;
    previous_admin_id: string | null;
    status: RequestStatus;
    status_updated: boolean;
  };
}
