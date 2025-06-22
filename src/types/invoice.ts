/**
 * Types pour la gestion des factures
 * Basés sur les schémas API définis dans Swagger
 */

import { RequestStatus } from "./request";

// Statuts possibles pour une facture
export type InvoiceStatus = "en_attente" | "payé" | "annulé";

// Statuts de paiement pour le filtrage
export type PaymentStatus = "paid" | "partial" | "unpaid";

// Client lié à une facture
export interface InvoiceClient {
  id: string;
  whatsapp_number: string;
  full_name: string;
  email?: string;
  adresse?: string;
}

// Administrateur qui a créé la facture
export interface InvoiceAdmin {
  id: string;
  name: string;
  email: string;
  is_current_admin: boolean;
}

// Demande liée à une facture
export interface InvoiceRequest {
  id: string;
  description: string;
  status: RequestStatus;
  created_at: string;
}

// Article de la facture
export interface InvoiceItem {
  id: string;
  name: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
}

// Article pour la création (avec support de redistribution des frais)
export interface InvoiceItemCreate {
  name: string;
  unit_price: number;
  quantity: number;
  // Propriétés pour la redistribution côté client uniquement
  original_unit_price?: number; // Prix avant redistribution (pour affichage)
  redistributed_amount?: number; // Montant redistribué sur cet article
}

// Frais additionnels
export interface InvoiceFee {
  id: string;
  fee_type: {
    id: string;
    name: string;
    description: string;
  };
  amount: number;
}

// État local pour la redistribution des frais (côté client uniquement)
export interface FeeRedistribution {
  total_amount: number; // Montant total à redistribuer
  is_enabled: boolean; // Si la redistribution est activée
  distribution_method: "proportional" | "equal"; // Méthode de répartition
}

// Détail de redistribution par article (pour calculs internes)
export interface ItemRedistributionDetail {
  item_index: number;
  original_subtotal: number;
  redistributed_amount: number;
  new_unit_price: number;
  weight_percentage: number; // % du poids de cet article dans le total
}

// Paiement effectué sur une facture
export interface InvoicePayment {
  id: string;
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
}

// Détail complet d'une facture
export interface InvoiceDetails {
  id: string;
  request_id: string;
  admin_id: string;
  total_amount: number;
  status: InvoiceStatus;
  created_at: string;
  updated_at: string;
  permissions: {
    can_modify: boolean;
  };
  payment_info: {
    payment_status: PaymentStatus;
    amount_paid: number;
    remaining_amount: number;
    payment_progress: number;
  };
  totals: {
    items_total: number;
    fees_total: number;
    grand_total: number;
  };
  client: InvoiceClient;
  request: InvoiceRequest;
  admin: InvoiceAdmin;
  items: InvoiceItem[];
  fees: InvoiceFee[];
  payments: InvoicePayment[];
}

// Résumé d'une facture (pour la liste)
export interface InvoiceSummary {
  id: string;
  total_amount: number;
  status: InvoiceStatus;
  created_at: string;
  payment_status: PaymentStatus;
  amount_paid: number;
  remaining_amount: number;
  request: {
    id: string;
    description: string;
    status: RequestStatus;
  };
  client: {
    id: string;
    whatsapp_number: string;
    full_name: string;
  };
  admin: {
    id: string;
    name: string;
  };
  payments: {
    id: string;
    amount_paid: number;
    method: string;
    payment_date: string;
  }[];
}

// Paramètres pour filtrer les factures
export interface InvoicesFilterParams {
  status?: InvoiceStatus;
  client_id?: string;
  whatsapp_number?: string;
  admin_id?: string;
  min_amount?: number;
  max_amount?: number;
  date_from?: string;
  date_to?: string;
  payment_status?: PaymentStatus;
  page?: number;
  limit?: number;
  sort_by?: "created_at" | "total_amount" | "status";
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

// Réponse de l'API pour la liste des factures
export interface InvoicesListResponse {
  message: string;
  data: {
    invoices: InvoiceSummary[];
    pagination: PaginationInfo;
  };
}

// Réponse de l'API pour les détails d'une facture
export interface InvoiceDetailsResponse {
  message: string;
  data: InvoiceDetails;
}

// Frais additionnels pour la création
export interface InvoiceFeeCreate {
  fee_type_id: string;
  amount: number;
}

// Paramètres pour créer une facture
export interface CreateInvoiceParams {
  items: InvoiceItemCreate[];
  fees?: InvoiceFeeCreate[];
}

// Réponse après création d'une facture
export interface CreateInvoiceResponse {
  message: string;
  data: {
    invoice: {
      id: string;
      request_id: string;
      admin_id: string;
      total_amount: number;
      status: InvoiceStatus;
      created_at: string;
    };
    items: InvoiceItem[];
    fees: InvoiceFee[];
  };
}

// Paramètres pour enregistrer un paiement
export interface CreatePaymentParams {
  amount_paid: number;
  method: "wave" | "momo" | "orange_money" | "zeepay" | "cash";
  payment_date: string;
  reference?: string;
}

// Réponse après enregistrement d'un paiement
export interface CreatePaymentResponse {
  message: string;
  data: {
    payment: {
      id: string;
      invoice_id: string;
      amount_paid: number;
      method: string;
      payment_date: string;
      confirmed_by: string;
      created_at: string;
    };
    invoice: {
      id: string;
      total_amount: number;
      status: InvoiceStatus;
      total_paid: number;
      remaining_amount: number;
      is_fully_paid: boolean;
      payment_progress: number;
    };
    request: {
      id: string;
      status: RequestStatus;
    };
  };
}
