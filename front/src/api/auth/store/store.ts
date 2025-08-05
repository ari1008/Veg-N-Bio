import type {LoginResponse} from "../response/loginResponse.ts";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type AuthState = {
    authData: LoginResponse | null;
    setAuthData: (data: LoginResponse) => void;
    clearAuthData: () => void;
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            authData: null,
            setAuthData: (data) => set({ authData: data }),
            clearAuthData: () => set({ authData: null }),
        }),
        {
            name: "auth-storage",
            getStorage: () => localStorage,
        }
    )
);
