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

                        {/* Chatbot Dropdown Menu */}
                        <div className="dropdown dropdown-end">
                            <div tabIndex={0} role="button" className="btn btn-outline btn-sm text-primary border-primary hover:bg-primary hover:text-white">
                                🐕 Chatbot Véto
                                <svg className="fill-current" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24">
                                    <path d="M7 10l5 5 5-5z"/>
                                </svg>
                            </div>
                            <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-64 p-2 shadow-lg border border-base-300">
                                <li className="menu-title">
                                    <span className="text-xs text-base-content/60">Administration</span>
                                </li>
                                <li>
                                    <Link to="/chatbot/dashboard" className="text-sm">
                                        📊 Dashboard
                                        <span className="badge badge-primary badge-xs">Vue d'ensemble</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/chatbot/diseases" className="text-sm">
                                        🦠 Maladies
                                        <span className="badge badge-secondary badge-xs">CRUD</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/chatbot/sessions" className="text-sm">
                                        📋 Sessions
                                        <span className="badge badge-info badge-xs">Historique</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/chatbot/reports" className="text-sm">
                                        ⚠️ Signalements
                                        <span className="badge badge-warning badge-xs">Erreurs</span>
                                    </Link>
                                </li>
                                <div className="divider my-1"></div>
                                <li className="menu-title">
                                    <span className="text-xs text-base-content/60">Analyse</span>
                                </li>
                                <li>
                                    <Link to="/chatbot/analytics" className="text-sm">
                                        📈 Analytics
                                        <span className="badge badge-accent badge-xs">Graphiques</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/chatbot/settings" className="text-sm">
                                        ⚙️ Paramètres
                                        <span className="badge badge-ghost badge-xs">Config</span>
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Admin Reviews Moderation Button */}
                        <Link to="/admin/reviews/moderation" className="btn btn-outline btn-sm text-primary border-primary hover:bg-primary hover:text-white">
                            📝 Modération Avis
                        </Link>

                        <LogoutButton/>
                        <Link to="/event-requests" className="btn btn-outline btn-sm text-primary border-primary hover:bg-primary hover:text-white">
                            🎭 Événements
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}