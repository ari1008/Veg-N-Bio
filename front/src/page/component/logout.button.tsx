
import { useAuthStore } from "../../api/auth/store/store";
import { useNavigate } from "react-router-dom";
import {useLogout} from "../../api/auth/hook/useLogout.ts";

export default function LogoutButton() {
    const logoutMutation = useLogout()
    const clearAuthData = useAuthStore((state) => state.clearAuthData);
    const navigate = useNavigate();
    const refreshToken = useAuthStore((state) => state.authData?.refreshToken);

    const handleLogout = () => {
        logoutMutation.mutate(refreshToken ?? "", {
            onSuccess: () => {
                clearAuthData();
                localStorage.removeItem("authToken");
                navigate("/login");
            },
            onError: (error) => {
                console.error("Erreur lors du logout :", error);
            },
        });

    };

    return (
        <button
            onClick={handleLogout}
            disabled={logoutMutation.isLoading}
            className="btn btn-error btn-sm"
        >
            {logoutMutation.isLoading ? "Déconnexion..." : "Se déconnecter"}
        </button>
    );
}
