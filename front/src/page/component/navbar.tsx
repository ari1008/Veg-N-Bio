import React from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../api/auth/store/store";
import LogoutButton from "./logout.button.tsx";

export default function Navbar() {
    const authData = useAuthStore((state) => state.authData);

    return (
        <div className="navbar bg-base-100 shadow-sm px-6">
            <div className="flex-1">
                <Link to="/" className="text-2xl font-bold text-primary">
                    Veg'N Bio 🌿
                </Link>
            </div>

            <div className="flex-none flex gap-2">
                <Link to="/" className="btn btn-outline btn-sm text-primary border-primary hover:bg-primary hover:text-white">
                    Accueil
                </Link>
                <Link to="/menus" className="btn btn-outline btn-sm text-primary border-primary hover:bg-primary hover:text-white">
                    Menus
                </Link>

                {!authData ? (
                    <>
                        <Link to="/login" className="btn btn-outline btn-sm text-primary border-primary hover:bg-primary hover:text-white">
                            Connexion
                        </Link>
                        <Link to="/register" className="btn btn-outline btn-sm text-primary border-primary hover:bg-primary hover:text-white">
                            Créer un compte
                        </Link>
                    </>
                ) : (
                    <>
                        <Link to="/reservations" className="btn btn-outline btn-sm text-primary border-primary hover:bg-primary hover:text-white">
                            📅 Mes Réservations
                        </Link>
                        <Link to="/dashboard" className="btn btn-primary btn-sm text-white hover:bg-primary-focus">
                            📊 Dashboard
                        </Link>
                        <LogoutButton/>
                        <Link to="/profile" className="btn btn-outline btn-sm text-primary border-primary hover:bg-primary hover:text-white">
                            Profil
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}