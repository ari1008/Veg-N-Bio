import axios from "axios";
import { useAuthStore } from "./auth/store/store.ts";

const apiPrivate = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

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

        if (originalRequest.url?.includes("/authentification/refreshToken")) {
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = useAuthStore.getState().authData?.refreshToken;
                if (!refreshToken) return Promise.reject(error);

                const response = await apiPrivate.post("/authentification/refreshToken", { refreshToken });
                const newToken = response.data.accessToken;

                useAuthStore.getState().setAuthData(response.data);

                originalRequest.headers["Authorization"] = `Bearer ${newToken}`;

                return apiPrivate(originalRequest);
            } catch (refreshError) {
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default apiPrivate;
