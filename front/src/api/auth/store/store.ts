import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {LoginResponse} from "../response/loginResponse.ts";

type AuthState = {
    authData: LoginResponse | null;
    setAuthData: (data: LoginResponse) => void;
    clearAuthData: () => void;
    logout: () => void;
    isAuthenticated: () => boolean;
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

                set({ authData: null });

                localStorage.removeItem('authToken');
                localStorage.removeItem('refreshToken');

                document.cookie.split(";").forEach((c) => {
                    document.cookie = c
                        .replace(/^ +/, "")
                        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
                });

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