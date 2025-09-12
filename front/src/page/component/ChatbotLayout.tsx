import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import MetricCard from "./MetricCard.tsx";
import {useChatbotStats} from "../../api/chatbot/hook/hook.ts";
import Navbar from "./navbar.tsx";
import Footer from "./footer.tsx";

interface ChatbotLayoutProps {
    children: ReactNode;
    title?: string;
    subtitle?: string;
}

interface NavigationItem {
    path: string;
    label: string;
    icon: string;
    badge?: number;
}

const ChatbotLayout: React.FC<ChatbotLayoutProps> = ({
                                                         children,
                                                         title = "Chatbot Vétérinaire",
                                                         subtitle = "Administration et suivi des diagnostics"
                                                     }) => {
    const location = useLocation();
    const { data: stats } = useChatbotStats();

    const navigationItems: NavigationItem[] = [
        {
            path: '/chatbot/dashboard',
            label: 'Dashboard',
            icon: '📊'
        },
        {
            path: '/chatbot/diseases',
            label: 'Maladies',
            icon: '🦠'
        },
        {
            path: '/chatbot/sessions',
            label: 'Sessions',
            icon: '📋',
            badge: stats?.totalSessions || 0
        },
        {
            path: '/chatbot/reports',
            label: 'Signalements',
            icon: '⚠️',
            badge: stats?.totalReports || 0
        },
        {
            path: '/chatbot/analytics',
            label: 'Analytics',
            icon: '📈'
        },
        {
            path: '/chatbot/settings',
            label: 'Paramètres',
            icon: '⚙️'
        }
    ];

    const isActivePath = (path: string): boolean => {
        return location.pathname === path;
    };

    return (
        <div data-theme="vegnbio" className="min-h-screen bg-base-100">
            <Navbar />

            <div className="flex">
                {/* Sidebar Navigation */}
                <div className="w-64 min-h-screen bg-base-200 border-r border-base-300">
                    <div className="p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <span className="text-2xl">🐕</span>
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-base-content">
                                    Chatbot Véto
                                </h2>
                                <p className="text-xs text-base-content/60">
                                    Administration
                                </p>
                            </div>
                        </div>

                        {/* Status Overview */}
                        <div className="bg-base-100 rounded-lg p-4 mb-6 border border-base-300">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-base-content/70">Statut</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                                    <span className="text-xs text-success font-semibold">Actif</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span className="text-base-content/60">Précision</span>
                                    <span className="font-semibold text-base-content">
                                        {stats?.accuracyRate ? `${stats.accuracyRate.toFixed(1)}%` : '--'}
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-base-content/60">Sessions aujourd'hui</span>
                                    <span className="font-semibold text-base-content">
                                        {stats?.totalSessions || '--'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Menu */}
                        <nav className="space-y-2">
                            {navigationItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                                        isActivePath(item.path)
                                            ? 'bg-primary text-primary-content shadow-sm'
                                            : 'text-base-content hover:bg-base-100 hover:shadow-sm'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg">{item.icon}</span>
                                        <span className="font-medium">{item.label}</span>
                                    </div>
                                    {item.badge !== undefined && item.badge > 0 && (
                                        <div className={`badge badge-sm ${
                                            isActivePath(item.path)
                                                ? 'badge-secondary'
                                                : 'badge-primary'
                                        }`}>
                                            {item.badge > 99 ? '99+' : item.badge}
                                        </div>
                                    )}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col">
                    {/* Header */}
                    <header className="bg-base-100 border-b border-base-300 px-8 py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-base-content">
                                    {title}
                                </h1>
                                <p className="text-base-content/60 mt-1">
                                    {subtitle}
                                </p>
                            </div>

                            {/* Quick Actions */}
                            <div className="flex items-center gap-3">
                                <div className="tooltip" data-tip="Actualiser les données">
                                    <button
                                        className="btn btn-ghost btn-circle"
                                        onClick={() => window.location.reload()}
                                    >
                                        🔄
                                    </button>
                                </div>
                                <div className="tooltip" data-tip="Nouvelle maladie">
                                    <Link
                                        to="/chatbot/diseases?action=create"
                                        className="btn btn-primary btn-sm"
                                    >
                                        + Maladie
                                    </Link>
                                </div>
                                <div className="tooltip" data-tip="Voir les alertes">
                                    <button className="btn btn-ghost btn-circle">
                                        <div className="indicator">
                                            <span className="text-lg">🔔</span>
                                            {stats && stats.totalReports > 0 && (
                                                <span className="badge badge-xs badge-error indicator-item">
                                                    {stats.totalReports}
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Content Area */}
                    <main className="flex-1 p-8 bg-base-50">
                        {children}
                    </main>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default ChatbotLayout;


export const MetricCardExamples: React.FC = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
                title="Total Diagnostics"
                value={1247}
                icon="🩺"
                trend={{ value: 12, isPositive: true }}
                subtitle="Ce mois-ci"
                color="primary"
            />

            <MetricCard
                title="Taux de Précision"
                value="94.2%"
                icon="🎯"
                trend={{ value: 3, isPositive: true }}
                subtitle="7 derniers jours"
                color="success"
            />

            <MetricCard
                title="Signalements"
                value={23}
                icon="⚠️"
                trend={{ value: 8, isPositive: false }}
                subtitle="À traiter"
                color="warning"
            />

            <MetricCard
                title="Race Populaire"
                value="Chat Européen"
                icon="🐱"
                subtitle="34% des diagnostics"
                color="info"
            />
        </div>
    );
};

export const LoadingMetricCards: React.FC = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((index) => (
                <MetricCard
                    key={index}
                    title=""
                    value=""
                    icon=""
                    isLoading={true}
                />
            ))}
        </div>
    );
};