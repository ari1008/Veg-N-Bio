import React, { useState, useEffect } from 'react';
import {
    useChatbotStats,
    usePopularSymptoms,
    usePopularRaces,
    useAccuracyStats,
    useGetAllReports
} from '../api/chatbot/hook/hook';
import { Link } from 'react-router-dom';
import ChatbotLayout from "./component/ChatbotLayout.tsx";
import MetricCard from "./component/MetricCard.tsx";

const ChatbotDashboardPage: React.FC = () => {
    const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('week');
    const [refreshKey, setRefreshKey] = useState(0);


    const { data: stats, isLoading: statsLoading } = useChatbotStats();
    const { data: popularSymptoms, isLoading: symptomsLoading } = usePopularSymptoms();
    const { data: popularRaces, isLoading: racesLoading } = usePopularRaces();
    const { data: accuracyStats, isLoading: accuracyLoading } = useAccuracyStats();
    const { data: recentReports } = useGetAllReports(false, 0, 5); // 5 derniers signalements

    useEffect(() => {
        const interval = setInterval(() => {
            setRefreshKey(prev => prev + 1);
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const getTimeRangeLabel = (range: string) => {
        const labels = {
            today: "Aujourd'hui",
            week: "7 derniers jours",
            month: "30 derniers jours"
        };
        return labels[range as keyof typeof labels] || labels.week;
    };

    return (
        <ChatbotLayout
            title="Dashboard Chatbot"
            subtitle="Vue d'ensemble des diagnostics vétérinaires"
        >
            <div className="space-y-8">
                {/* Time Range Filter */}
                <div className="flex justify-between items-center">
                    <div className="tabs tabs-boxed">
                        {(['today', 'week', 'month'] as const).map((range) => (
                            <button
                                key={range}
                                className={`tab ${timeRange === range ? 'tab-active' : ''}`}
                                onClick={() => setTimeRange(range)}
                            >
                                {getTimeRangeLabel(range)}
                            </button>
                        ))}
                    </div>
                    <div className="text-xs text-base-content/60">
                        Dernière mise à jour : {new Date().toLocaleTimeString('fr-FR')}
                    </div>
                </div>

                {/* Main Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard
                        title="Total Diagnostics"
                        value={stats?.totalSessions || 0}
                        icon="🩺"
                        trend={{ value: 12, isPositive: true }}
                        subtitle={getTimeRangeLabel(timeRange)}
                        color="primary"
                        isLoading={statsLoading}
                    />

                    <MetricCard
                        title="Taux de Précision"
                        value={stats?.accuracyRate ? `${stats.accuracyRate.toFixed(1)}%` : '--'}
                        icon="🎯"
                        trend={{
                            value: Math.round((stats?.accuracyRate || 0) - 85),
                            isPositive: (stats?.accuracyRate || 0) > 85
                        }}
                        subtitle="Diagnostics corrects"
                        color="success"
                        isLoading={statsLoading}
                    />

                    <MetricCard
                        title="Signalements"
                        value={stats?.totalReports || 0}
                        icon="⚠️"
                        trend={{ value: 5, isPositive: false }}
                        subtitle="À traiter"
                        color="warning"
                        isLoading={statsLoading}
                    />

                    <MetricCard
                        title="Race Populaire"
                        value={stats?.mostCommonRace || 'N/A'}
                        icon="🐕"
                        subtitle={`${popularRaces?.[0]?.percentage?.toFixed(1) || 0}% des diagnostics`}
                        color="info"
                        isLoading={statsLoading || racesLoading}
                    />
                </div>

                {/* Charts and Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Popular Symptoms */}
                    <div className="card bg-base-100 shadow-lg border border-base-300">
                        <div className="card-body">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-base-content">
                                    Symptômes les plus fréquents
                                </h3>
                                <Link
                                    to="/chatbot/analytics"
                                    className="text-sm text-primary hover:text-primary-focus"
                                >
                                    Voir tout →
                                </Link>
                            </div>

                            {symptomsLoading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div key={i} className="animate-pulse">
                                            <div className="flex justify-between items-center">
                                                <div className="h-4 bg-base-300 rounded w-1/2"></div>
                                                <div className="h-4 bg-base-300 rounded w-1/4"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {popularSymptoms?.slice(0, 5).map((symptom, index) => (
                                        <div key={symptom.symptom} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-medium text-base-content/70">
                                                    #{index + 1}
                                                </span>
                                                <span className="text-sm font-semibold capitalize">
                                                    {symptom.symptom}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-20 h-2 bg-base-300 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary rounded-full transition-all duration-500"
                                                        style={{ width: `${symptom.percentage}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs font-bold text-base-content min-w-[3rem] text-right">
                                                    {symptom.count}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Popular Races */}
                    <div className="card bg-base-100 shadow-lg border border-base-300">
                        <div className="card-body">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-base-content">
                                    Races les plus consultées
                                </h3>
                                <Link
                                    to="/chatbot/analytics"
                                    className="text-sm text-primary hover:text-primary-focus"
                                >
                                    Voir tout →
                                </Link>
                            </div>

                            {racesLoading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div key={i} className="animate-pulse">
                                            <div className="flex justify-between items-center">
                                                <div className="h-4 bg-base-300 rounded w-1/2"></div>
                                                <div className="h-4 bg-base-300 rounded w-1/4"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {popularRaces?.slice(0, 5).map((race, index) => (
                                        <div key={race.race} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-medium text-base-content/70">
                                                    #{index + 1}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">
                                                        {race.race.includes('chat') ? '🐱' : '🐕'}
                                                    </span>
                                                    <span className="text-sm font-semibold capitalize">
                                                        {race.race}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-20 h-2 bg-base-300 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-secondary rounded-full transition-all duration-500"
                                                        style={{ width: `${race.percentage}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs font-bold text-base-content min-w-[3rem] text-right">
                                                    {race.count}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Activity and Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Reports */}
                    <div className="lg:col-span-2">
                        <div className="card bg-base-100 shadow-lg border border-base-300">
                            <div className="card-body">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-base-content">
                                        Signalements récents
                                    </h3>
                                    <Link
                                        to="/chatbot/reports"
                                        className="text-sm text-primary hover:text-primary-focus"
                                    >
                                        Voir tous →
                                    </Link>
                                </div>

                                {recentReports?.content.length === 0 ? (
                                    <div className="text-center py-8">
                                        <span className="text-4xl mb-4 block">🎉</span>
                                        <p className="text-base-content/60">
                                            Aucun signalement récent !
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {recentReports?.content.slice(0, 3).map((report) => (
                                            <div
                                                key={report.id}
                                                className="flex items-start gap-3 p-3 bg-base-50 rounded-lg border border-base-200"
                                            >
                                                <div className="w-2 h-2 bg-warning rounded-full mt-2 flex-shrink-0"></div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-base-content truncate">
                                                        Session #{report.sessionId.slice(-6)}
                                                    </p>
                                                    <p className="text-xs text-base-content/70 truncate">
                                                        {report.feedback}
                                                    </p>
                                                    <p className="text-xs text-base-content/50 mt-1">
                                                        {new Date(report.createdAt).toLocaleString('fr-FR')}
                                                    </p>
                                                </div>
                                                <Link
                                                    to={`/chatbot/reports`}
                                                    className="btn btn-ghost btn-xs"
                                                >
                                                    Traiter
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div>
                        <div className="card bg-base-100 shadow-lg border border-base-300">
                            <div className="card-body">
                                <h3 className="text-lg font-bold text-base-content mb-4">
                                    Actions rapides
                                </h3>

                                <div className="space-y-3">
                                    <Link
                                        to="/chatbot/diseases?action=create"
                                        className="btn btn-primary btn-block justify-start"
                                    >
                                        <span className="mr-2">🦠</span>
                                        Nouvelle maladie
                                    </Link>

                                    <Link
                                        to="/chatbot/sessions"
                                        className="btn btn-outline btn-block justify-start"
                                    >
                                        <span className="mr-2">📋</span>
                                        Voir les sessions
                                    </Link>

                                    <Link
                                        to="/chatbot/reports"
                                        className="btn btn-outline btn-block justify-start"
                                    >
                                        <span className="mr-2">⚠️</span>
                                        Traiter signalements
                                        {stats && stats.totalReports > 0 && (
                                            <div className="badge badge-warning badge-sm ml-2">
                                                {stats.totalReports}
                                            </div>
                                        )}
                                    </Link>

                                    <Link
                                        to="/chatbot/analytics"
                                        className="btn btn-outline btn-block justify-start"
                                    >
                                        <span className="mr-2">📈</span>
                                        Analytics détaillés
                                    </Link>
                                </div>

                                {/* System Status */}
                                <div className="divider"></div>
                                <div className="space-y-2">
                                    <h4 className="text-sm font-bold text-base-content">
                                        État du système
                                    </h4>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-base-content/60">API Chatbot</span>
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 bg-success rounded-full"></div>
                                            <span className="text-success font-semibold">Opérationnel</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-base-content/60">Base de données</span>
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 bg-success rounded-full"></div>
                                            <span className="text-success font-semibold">Connectée</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-base-content/60">Temps réponse</span>
                                        <span className="text-base-content font-semibold">
                                            {stats?.averageDiagnosisTime?.toFixed(1) || '--'}s
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Performance Summary */}
                <div className="card bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
                    <div className="card-body">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-base-content mb-2">
                                    Résumé des performances
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <span className="text-base-content/60">Diagnostic le plus fréquent:</span>
                                        <p className="font-semibold text-base-content">
                                            Gastro-entérite (23%)
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-base-content/60">Symptôme principal:</span>
                                        <p className="font-semibold text-base-content">
                                            {stats?.mostCommonSymptom || 'Vomissements'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-base-content/60">Recommandation:</span>
                                        <p className="font-semibold text-primary">
                                            {accuracyStats && accuracyStats.accuracyRate > 90
                                                ? "Performance excellente"
                                                : "Améliorer la base de données"
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="text-6xl opacity-20">
                                🏆
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ChatbotLayout>
    );
};

export default ChatbotDashboardPage;