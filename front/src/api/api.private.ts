import axios from "axios";
import { useAuthStore } from "./auth/store/store.ts";
import api from "./api.ts";

const apiPrivate = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

const handleLogout = () => {
    console.log("Déconnexion automatique - token refresh échoué");
    useAuthStore.getState().logout();

    window.location.href = '/login';
};

apiPrivate.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().authData?.accessToken;
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiPrivate.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        console.log("Erreur API détectée:", error.response?.status);

        if (originalRequest.url?.includes("/authentification/refreshToken")) {
            console.log("Erreur sur refresh token endpoint");

            if (error.response?.status === 400 || error.response?.status === 401) {
                console.log("Refresh token invalide - déconnexion");
                handleLogout();
            }

            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            console.log("Token expiré, tentative de refresh");
            originalRequest._retry = true;

            try {
                const refreshToken = useAuthStore.getState().authData?.refreshToken;
                console.log("Refresh token disponible:", !!refreshToken);

                if (!refreshToken) {
                    console.log("Pas de refresh token - déconnexion");
                    handleLogout();
                    return Promise.reject(error);
                }

                const response = await api.post("/authentification/refreshToken", { refreshToken });
                const newToken = response.data.accessToken;
                console.log("Nouveau token obtenu:", !!newToken);

                useAuthStore.getState().setAuthData(response.data);

                originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
                return apiPrivate(originalRequest);

            } catch (refreshError: any) {
                console.error("Erreur lors du refresh token:", refreshError);

                if (refreshError.response?.status === 400 || refreshError.response?.status === 401) {
                    console.log("Refresh token échoué - déconnexion");
                    handleLogout();
                }

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default apiPrivate;