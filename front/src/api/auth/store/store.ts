import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {LoginResponse} from "../response/loginResponse.ts";

type AuthState = {
    authData: LoginResponse | null;
    setAuthData: (data: LoginResponse) => void;
    clearAuthData: () => void;
    logout: () => void; // Nouvelle méthode
    isAuthenticated: () => boolean; // Méthode utile
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            authData: null,

            setAuthData: (data) => {
                console.log('Mise à jour des données auth:', data);
                set({ authData: data });
            },

            clearAuthData: () => {
                console.log('Nettoyage des données auth');
                set({ authData: null });
            },

            logout: () => {
                console.log('Déconnexion complète');

                // Nettoyer le store
                set({ authData: null });

                // Nettoyer localStorage (au cas où d'autres clés existent)
                localStorage.removeItem('authToken');
                localStorage.removeItem('refreshToken');

                // Nettoyer les cookies si tu en utilises
                document.cookie.split(";").forEach((c) => {
                    document.cookie = c
                        .replace(/^ +/, "")
                        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
                });

                // Le persist de Zustand va automatiquement nettoyer "auth-storage"
            },

            isAuthenticated: () => {
                const state = get();
                return !!state.authData?.accessToken;
            },
        }),
        {
            name: "auth-storage",
            getStorage: () => localStorage,
        }
    )
);