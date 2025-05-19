/**
 * Définition des routes API
 * Ce fichier centralise tous les endpoints de l'API pour un accès unifié
 */

/**
 * Routes d'authentification
 */
export const AUTH_ROUTES = {
  /** Connexion administrateur - POST /auth/login */
  LOGIN: "/auth/login",

  /** Rafraîchissement du token - POST /auth/refresh */
  REFRESH_TOKEN: "/auth/refresh",

  /** Informations de l'administrateur connecté - GET /auth/me */
  ME: "/auth/me",

  /** Déconnexion - POST /auth/logout */
  LOGOUT: "/auth/logout",
};

/**
 * Routes pour la gestion des demandes client par les administrateurs
 */
export const ADMIN_REQUEST_ROUTES = {
  /** Liste des demandes - GET /admin/requests */
  LIST: "/admin/requests",

  /** Détails d'une demande - GET /admin/requests/:id */
  DETAILS: (id: string) => `/admin/requests/${id}`,

  /** Assigner une demande - PUT /admin/requests/:id/assign */
  ASSIGN: (id: string) => `/admin/requests/${id}/assign`,

  /** Mettre à jour le statut d'une demande - PUT /admin/requests/:id/status */
  UPDATE_STATUS: (id: string) => `/admin/requests/${id}/status`,

  /** Créer une facture pour une demande - POST /admin/requests/:id/invoice */
  CREATE_INVOICE: (id: string) => `/admin/requests/${id}/invoice`,
};

/**
 * Routes pour la gestion des factures
 */
export const ADMIN_INVOICE_ROUTES = {
  /** Liste des factures - GET /admin/invoices */
  LIST: "/admin/invoices",

  /** Détails d'une facture - GET /admin/invoices/:id */
  DETAILS: (id: string) => `/admin/invoices/${id}`,

  /** Créer un paiement pour une facture - POST /admin/invoices/:id/payment */
  CREATE_PAYMENT: (id: string) => `/admin/invoices/${id}/payment`,
};

/**
 * Routes pour la gestion des paiements
 */
export const ADMIN_PAYMENT_ROUTES = {
  /** Liste des paiements - GET /admin/payments */
  LIST: "/admin/payments",
};

/**
 * Routes pour la gestion des administrateurs (superadmin)
 */
export const SUPERADMIN_ROUTES = {
  /** Liste des administrateurs - GET /superadmin/admins */
  LIST_ADMINS: "/superadmin/admins",

  /** Créer un administrateur - POST /superadmin/admins */
  CREATE_ADMIN: "/superadmin/admins",

  /** Modifier un administrateur - PUT /superadmin/admins/:id */
  UPDATE_ADMIN: (id: string) => `/superadmin/admins/${id}`,

  /** Supprimer un administrateur - DELETE /superadmin/admins/:id */
  DELETE_ADMIN: (id: string) => `/superadmin/admins/${id}`,
};

/**
 * Routes pour les clients
 */
export const CLIENT_ROUTES = {
  /** Créer une demande - POST /client/requests */
  CREATE_REQUEST: "/client/requests",

  /** Consulter les détails d'une demande - GET /client/requests/:id */
  REQUEST_DETAILS: (id: string) => `/client/requests/${id}`,
};

/**
 * Toutes les routes de l'API regroupées
 */
export const API_ROUTES = {
  AUTH: AUTH_ROUTES,
  ADMIN_REQUESTS: ADMIN_REQUEST_ROUTES,
  ADMIN_INVOICES: ADMIN_INVOICE_ROUTES,
  ADMIN_PAYMENTS: ADMIN_PAYMENT_ROUTES,
  SUPERADMIN: SUPERADMIN_ROUTES,
  CLIENT: CLIENT_ROUTES,
};

export default API_ROUTES;
