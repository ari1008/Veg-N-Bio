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

// Fonction pour rediriger vers login et déconnecter
const handleLogout = () => {
    console.log("Déconnexion automatique - token refresh échoué");
    useAuthStore.getState().logout(); // Utilise ta méthode logout

    // Redirection vers login
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

        // Si c'est l'endpoint de refresh token qui échoue
        if (originalRequest.url?.includes("/authentification/refreshToken")) {
            console.log("Erreur sur refresh token endpoint");

            // Si 400 ou 401 sur refresh token = déconnexion
            if (error.response?.status === 400 || error.response?.status === 401) {
                console.log("Refresh token invalide - déconnexion");
                handleLogout();
            }

            return Promise.reject(error);
        }

        // Si 401 sur autre endpoint, tenter le refresh
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

                // Mettre à jour le store avec les nouvelles données
                useAuthStore.getState().setAuthData(response.data);

                // Retry la requête originale avec le nouveau token
                originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
                return apiPrivate(originalRequest);

            } catch (refreshError: any) {
                console.error("Erreur lors du refresh token:", refreshError);

                // Si le refresh échoue avec 400 ou 401, déconnecter
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