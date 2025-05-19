/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Module API client générique pour gérer les requêtes HTTP
 */

// Configuration de l'API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005";

// Typages des méthodes HTTP
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

// Options de requête étendues
interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  withAuth?: boolean;
  customHeaders?: Record<string, string>;
}

// Erreur API personnalisée pour gérer les réponses d'erreur de façon consistente
export class ApiError extends Error {
  public status: number;
  public data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/**
 * Fonction principale pour faire des requêtes API
 */
export async function apiRequest<T = any>(
  endpoint: string,
  method: HttpMethod = "GET",
  options: RequestOptions = {}
): Promise<T> {
  // Construction de l'URL avec les paramètres de requête
  const url = new URL(`${API_BASE_URL}${endpoint}`);

  if (options.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  // Configuration par défaut des headers
  const headers = new Headers({
    "Content-Type": "application/json",
    Accept: "application/json",
    ...options.customHeaders,
  });

  // Ajout du token d'authentification si nécessaire
  if (options.withAuth !== false) {
    const token = localStorage.getItem("accessToken");
    if (token) {
      headers.append("Authorization", `Bearer ${token}`);
    }
  }

  // Construction des options de requête
  const requestOptions: RequestInit = {
    method,
    headers,
    // Ne pas inclure les credentials sauf si explicitement demandé
    credentials: "same-origin",
    ...options,
  };

  // Ajout du body pour les méthodes non GET
  if (method !== "GET" && options.body) {
    requestOptions.body =
      typeof options.body === "string"
        ? options.body
        : JSON.stringify(options.body);
  }

  try {
    // Exécution de la requête
    const response = await fetch(url.toString(), requestOptions);

    // Analyse initiale de la réponse
    let data;
    const contentType = response.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Gestion des erreurs selon les codes de statut
    if (!response.ok) {
      // Gestion spécifique des erreurs d'authentification
      if (response.status === 401) {
        // Si token expiré et non déjà sur la page de login, déconnexion
        if (window.location.pathname !== "/login") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.href = "/login";
        }
      }

      throw new ApiError(
        data?.message || response.statusText,
        response.status,
        data
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      error instanceof Error ? error.message : "Erreur de réseau",
      0
    );
  }
}

/**
 * Méthodes HTTP raccourcies
 */
export const api = {
  get: <T = any>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, "GET", options),

  post: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    apiRequest<T>(endpoint, "POST", { ...options, body }),

  put: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    apiRequest<T>(endpoint, "PUT", { ...options, body }),

  delete: <T = any>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, "DELETE", options),
};

export default api;
