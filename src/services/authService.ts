/**
 * Service d'authentification
 * Gère les opérations liées à l'authentification des utilisateurs (login, logout, etc.)
 */

import api from "../lib/api/apiClient";
import API_ROUTES from "../lib/api/routes";


/**
 * Types pour les demandes et réponses d'authentification
 */

// Identifiants de connexion
interface LoginCredentials {
  email: string;
  password: string;
}

// Réponse de connexion
interface LoginResponse {
  message: string;
  data: {
    accessToken: string;
    refreshToken?: string;
    role: "admin" | "superadmin";
  };
}

// Demande de rafraîchissement du token
interface RefreshTokenRequest {
  refreshToken: string;
}

// Réponse du rafraîchissement du token
interface RefreshTokenResponse {
  message: string;
  data: {
    accessToken: string;
    role: "admin" | "superadmin";
  };
}

// Profil administrateur
interface AdminProfile {
  id: string;
  name: string;
  email: string;
  role: "admin" | "superadmin";
}

// Réponse du profil
interface ProfileResponse {
  message: string;
  data: {
    admin: AdminProfile;
    token: {
      expiration: string;
      canRefresh: boolean;
    };
  };
}

/**
 * Service d'authentification
 */
export const authService = {
  /**
   * Connecte un administrateur
   * @param credentials Identifiants de connexion (email et mot de passe)
   * @returns Informations de connexion incluant les tokens et le rôle
   */
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    return api.post<LoginResponse>(API_ROUTES.AUTH.LOGIN, credentials, {
      withAuth: false,
    });
  },

  /**
   * Rafraîchit le token d'accès
   * @param request Demande de rafraîchissement contenant le token
   * @returns Nouveau token d'accès
   */
  refreshToken: async (
    request: RefreshTokenRequest
  ): Promise<RefreshTokenResponse> => {
    return api.post<RefreshTokenResponse>(
      API_ROUTES.AUTH.REFRESH_TOKEN,
      request,
      { withAuth: false }
    );
  },

  /**
   * Récupère le profil de l'administrateur connecté
   * @returns Informations de profil
   */
  getProfile: async (): Promise<ProfileResponse> => {
    return api.get<ProfileResponse>(API_ROUTES.AUTH.ME);
  },

  /**
   * Déconnecte l'administrateur actuel
   * @returns Message de confirmation
   */
  logout: async (): Promise<{ message: string }> => {
    return api.post<{ message: string }>(API_ROUTES.AUTH.LOGOUT);
  },

  /**
   * Stocke les tokens en session/local storage
   * @param accessToken Token d'accès
   * @param refreshToken Token de rafraîchissement
   * @param role Rôle de l'utilisateur
   */
  saveTokens: (
    accessToken: string,
    refreshToken?: string,
    role?: string
  ): void => {
    // Dans un cas réel, vous pourriez utiliser localStorage, cookies ou un état global
    localStorage.setItem("accessToken", accessToken);
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }
    if (role) {
      localStorage.setItem("userRole", role);
    }
  },

  /**
   * Supprime les tokens stockés
   */
  clearTokens: (): void => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userRole");
  },

  /**
   * Vérifie si l'utilisateur est connecté
   * @returns true si l'utilisateur est connecté
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("accessToken");
  },

  /**
   * Récupère le rôle de l'utilisateur
   * @returns Le rôle de l'utilisateur ou null
   */
  getUserRole: (): string | null => {
    return localStorage.getItem("userRole");
  },
};

export default authService;
