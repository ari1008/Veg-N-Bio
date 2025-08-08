import {useAuthStore} from "../api/auth/store/store.ts";

export function isAuthenticated(): boolean {
    return useAuthStore.getState().authData?.accessToken != null;
}