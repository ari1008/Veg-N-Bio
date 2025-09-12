import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
    useGetAllSessions,
    useGetSessionDetail,
    useChatbotStats
} from '../api/chatbot/hook/hook';
import type { ChatbotSession, ChatbotSessionDetail } from '../api/chatbot/dto/dto';
import ChatbotLayout from "./component/ChatbotLayout.tsx";

interface SessionsFilters {
    race: string;
    startDate: string;
    endDate: string;
    hasReports: '' | 'true' | 'false';
}

interface SessionStats {
    totalSessions: number;
    todaySessions: number;
    avgPerDay: number;
    mostPopularRace: string;
}

const ChatbotSessionsPage: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize] = useState(15);
    const [filters, setFilters] = useState<SessionsFilters>({
        race: '',
        startDate: '',
        endDate: '',
        hasReports: ''
    });


    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const { data: sessionsData, isLoading, refetch } = useGetAllSessions(currentPage, pageSize);
    const { data: sessionDetail, isLoading: isLoadingDetail } = useGetSessionDetail(selectedSessionId || '');
    const { data: globalStats } = useChatbotStats();

    const sessionStats: SessionStats = React.useMemo(() => {
        if (!sessionsData?.content) {
            return {
                totalSessions: 0,
                todaySessions: 0,
                avgPerDay: 0,
                mostPopularRace: 'N/A'
            };
        }

        const today = new Date().toDateString();
        const todaySessions = sessionsData.content.filter(
            session => new Date(session.createdAt).toDateString() === today
        ).length;

        const raceCounts = sessionsData.content.reduce((acc, session) => {
            acc[session.race] = (acc[session.race] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const mostPopularRace = Object.entries(raceCounts)
            .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

        return {
            totalSessions: sessionsData.totalElements || 0,
            todaySessions,
            avgPerDay: Math.round((sessionsData.totalElements || 0) / 30), // Approximation 30 jours
            mostPopularRace
        };
    }, [sessionsData]);

    const filteredSessions = sessionsData?.content.filter(session => {
        const matchesRace = !filters.race || session.race.toLowerCase().includes(filters.race.toLowerCase());

        const sessionDate = new Date(session.createdAt);
        const matchesStartDate = !filters.startDate || sessionDate >= new Date(filters.startDate);
        const matchesEndDate = !filters.endDate || sessionDate <= new Date(filters.endDate + 'T23:59:59');

        const matchesReports = filters.hasReports === '' ||
            (filters.hasReports === 'true' && session.hasReports) ||
            (filters.hasReports === 'false' && !session.hasReports);

        return matchesRace && matchesStartDate && matchesEndDate && matchesReports;
    }) || [];

    const openDetailModal = (sessionId: string) => {
        setSelectedSessionId(sessionId);
        setIsDetailModalOpen(true);
    };

    const closeDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedSessionId(null);
    };

    const exportSessions = () => {
        if (!filteredSessions.length) {
            toast.error('Aucune session à exporter');
            return;
        }

        const csvContent = [
            ['ID Session', 'Race', 'Symptômes', 'Date', 'A des signalements'].join(','),
            ...filteredSessions.map(session => [
                session.id,
                session.race,
                `"${session.symptoms.join(', ')}"`,
                new Date(session.createdAt).toLocaleString('fr-FR'),
                session.hasReports ? 'Oui' : 'Non'
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `sessions-chatbot-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success('Export réussi !');
    };

    const getTimeAgo = (dateString: string) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) return 'Il y a moins d\'1h';
        if (diffInHours < 24) return `Il y a ${diffInHours}h`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays === 1) return 'Hier';
        if (diffInDays < 7) return `Il y a ${diffInDays} jours`;

        return date.toLocaleDateString('fr-FR');
    };

    const getRaceIcon = (race: string) => {
        const lowerRace = race.toLowerCase();
        if (lowerRace.includes('chat')) return '🐱';
        if (lowerRace.includes('chien') || lowerRace.includes('berger') || lowerRace.includes('labrador')) return '🐕';
        return '🐾';
    };

    return (
        <ChatbotLayout
            title="Historique des Sessions"
            subtitle="Consultations vétérinaires effectuées"
        >
            <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="stat bg-base-100 rounded-lg shadow-sm border border-base-300">
                        <div className="stat-figure text-primary">
                            <span className="text-3xl">📊</span>
                        </div>
                        <div className="stat-title text-xs">Total Sessions</div>
                        <div className="stat-value text-primary text-2xl">{sessionStats.totalSessions}</div>
                        <div className="stat-desc">Tous les diagnostics</div>
                    </div>

                    <div className="stat bg-base-100 rounded-lg shadow-sm border border-base-300">
                        <div className="stat-figure text-secondary">
                            <span className="text-3xl">📅</span>
                        </div>
                        <div className="stat-title text-xs">Aujourd'hui</div>
                        <div className="stat-value text-secondary text-2xl">{sessionStats.todaySessions}</div>
                        <div className="stat-desc">Nouvelles consultations</div>
                    </div>

                    <div className="stat bg-base-100 rounded-lg shadow-sm border border-base-300">
                        <div className="stat-figure text-accent">
                            <span className="text-3xl">📈</span>
                        </div>
                        <div className="stat-title text-xs">Moyenne/Jour</div>
                        <div className="stat-value text-accent text-2xl">{sessionStats.avgPerDay}</div>
                        <div className="stat-desc">Derniers 30 jours</div>
                    </div>

                    <div className="stat bg-base-100 rounded-lg shadow-sm border border-base-300">
                        <div className="stat-figure text-info">
                            <span className="text-3xl">{getRaceIcon(sessionStats.mostPopularRace)}</span>
                        </div>
                        <div className="stat-title text-xs">Race Populaire</div>
                        <div className="stat-value text-info text-lg">{sessionStats.mostPopularRace}</div>
                        <div className="stat-desc">Plus consultée</div>
                    </div>
                </div>

                {/* Header with Actions */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-semibold text-base-content">
                            {filteredSessions.length} session{filteredSessions.length > 1 ? 's' : ''}
                            {filteredSessions.length !== sessionStats.totalSessions && (
                                <span className="text-sm text-base-content/60 ml-2">
                                    (sur {sessionStats.totalSessions} total)
                                </span>
                            )}
                        </h2>
                        <button
                            onClick={() => refetch()}
                            className="btn btn-ghost btn-sm"
                            disabled={isLoading}
                        >
                            🔄 Actualiser
                        </button>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={exportSessions}
                            className="btn btn-outline btn-sm"
                            disabled={filteredSessions.length === 0}
                        >
                            📥 Exporter CSV
                        </button>
                        <button
                            onClick={() => setFilters({ race: '', startDate: '', endDate: '', hasReports: '' })}
                            className="btn btn-ghost btn-sm"
                        >
                            🗑️ Réinitialiser filtres
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="card bg-base-100 shadow-sm border border-base-300">
                    <div className="card-body">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="label">
                                    <span className="label-text font-medium">Race</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Rechercher par race..."
                                    className="input input-bordered input-sm w-full"
                                    value={filters.race}
                                    onChange={(e) => setFilters(prev => ({ ...prev, race: e.target.value }))}
                                />
                            </div>

                            <div>
                                <label className="label">
                                    <span className="label-text font-medium">Date début</span>
                                </label>
                                <input
                                    type="date"
                                    className="input input-bordered input-sm w-full"
                                    value={filters.startDate}
                                    onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                                />
                            </div>

                            <div>
                                <label className="label">
                                    <span className="label-text font-medium">Date fin</span>
                                </label>
                                <input
                                    type="date"
                                    className="input input-bordered input-sm w-full"
                                    value={filters.endDate}
                                    onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                                />
                            </div>

                            <div>
                                <label className="label">
                                    <span className="label-text font-medium">Signalements</span>
                                </label>
                                <select
                                    className="select select-bordered select-sm w-full"
                                    value={filters.hasReports}
                                    onChange={(e) => setFilters(prev => ({ ...prev, hasReports: e.target.value as any }))}
                                >
                                    <option value="">Toutes</option>
                                    <option value="true">Avec signalements</option>
                                    <option value="false">Sans signalements</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sessions List */}
                <div className="space-y-3">
                    {isLoading ? (
                        <div className="space-y-3">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="card bg-base-100 shadow-sm border border-base-300">
                                    <div className="card-body animate-pulse">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className="w-12 h-12 bg-base-300 rounded-full"></div>
                                                <div className="space-y-2 flex-1">
                                                    <div className="h-4 bg-base-300 rounded w-1/4"></div>
                                                    <div className="h-3 bg-base-300 rounded w-2/3"></div>
                                                    <div className="h-3 bg-base-300 rounded w-1/3"></div>
                                                </div>
                                            </div>
                                            <div className="w-20 h-8 bg-base-300 rounded"></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredSessions.length === 0 ? (
                        <div className="card bg-base-100 shadow-sm border border-base-300">
                            <div className="card-body text-center py-16">
                                <span className="text-6xl mb-4 block">🔍</span>
                                <h3 className="text-xl font-bold text-base-content mb-2">
                                    Aucune session trouvée
                                </h3>
                                <p className="text-base-content/60 mb-6">
                                    {Object.values(filters).some(v => v)
                                        ? "Aucune session ne correspond à vos critères de recherche"
                                        : "Aucune consultation vétérinaire n'a encore été effectuée"
                                    }
                                </p>
                                {Object.values(filters).some(v => v) && (
                                    <button
                                        onClick={() => setFilters({ race: '', startDate: '', endDate: '', hasReports: '' })}
                                        className="btn btn-primary"
                                    >
                                        Réinitialiser les filtres
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        filteredSessions.map((session) => (
                            <div key={session.id} className="card bg-base-100 shadow-sm border border-base-300 hover:shadow-md transition-all duration-200">
                                <div className="card-body p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="avatar placeholder">
                                                <div className="bg-neutral-focus text-neutral-content rounded-full w-12 h-12">
                                                    <span className="text-2xl">{getRaceIcon(session.race)}</span>
                                                </div>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-sm font-bold text-base-content truncate">
                                                        Session #{session.id.slice(-8)}
                                                    </h3>
                                                    {session.hasReports && (
                                                        <div className="badge badge-warning badge-sm">
                                                            ⚠️ Signalé
                                                        </div>
                                                    )}
                                                </div>

                                                <p className="text-sm text-base-content/80 font-medium capitalize">
                                                    {session.race}
                                                </p>

                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {session.symptoms.slice(0, 3).map((symptom, idx) => (
                                                        <span key={idx} className="badge badge-outline badge-xs">
                                                            {symptom}
                                                        </span>
                                                    ))}
                                                    {session.symptoms.length > 3 && (
                                                        <span className="badge badge-ghost badge-xs">
                                                            +{session.symptoms.length - 3}
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="text-xs text-base-content/50 mt-1">
                                                    {getTimeAgo(session.createdAt)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={() => openDetailModal(session.id)}
                                                className="btn btn-outline btn-sm"
                                            >
                                                👁️ Voir détail
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {sessionsData && sessionsData.totalPages > 1 && (
                    <div className="flex justify-center">
                        <div className="join">
                            <button
                                className="join-item btn btn-sm"
                                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                                disabled={currentPage === 0}
                            >
                                « Précédent
                            </button>

                            {Array.from({ length: Math.min(7, sessionsData.totalPages) }, (_, i) => {
                                const pageNum = Math.max(0, Math.min(
                                    sessionsData.totalPages - 7,
                                    currentPage - 3
                                )) + i;

                                return (
                                    <button
                                        key={pageNum}
                                        className={`join-item btn btn-sm ${currentPage === pageNum ? 'btn-active' : ''}`}
                                        onClick={() => setCurrentPage(pageNum)}
                                    >
                                        {pageNum + 1}
                                    </button>
                                );
                            })}

                            <button
                                className="join-item btn btn-sm"
                                onClick={() => setCurrentPage(prev => Math.min(sessionsData.totalPages - 1, prev + 1))}
                                disabled={currentPage === sessionsData.totalPages - 1}
                            >
                                Suivant »
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Session Detail Modal */}
            {isDetailModalOpen && selectedSessionId && (
                <SessionDetailModal
                    sessionDetail={sessionDetail}
                    isLoading={isLoadingDetail}
                    onClose={closeDetailModal}
                />
            )}
        </ChatbotLayout>
    );
};


interface SessionDetailModalProps {
    sessionDetail: ChatbotSessionDetail | undefined;
    isLoading: boolean;
    onClose: () => void;
}

const SessionDetailModal: React.FC<SessionDetailModalProps> = ({
                                                                   sessionDetail,
                                                                   isLoading,
                                                                   onClose
                                                               }) => {
    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case 'HIGH': return 'text-error';
            case 'MEDIUM': return 'text-warning';
            case 'LOW': return 'text-success';
            default: return 'text-base-content';
        }
    };

    const getUrgencyBadge = (urgency: string) => {
        switch (urgency) {
            case 'HIGH': return 'badge-error';
            case 'MEDIUM': return 'badge-warning';
            case 'LOW': return 'badge-success';
            default: return 'badge-ghost';
        }
    };

    return (
        <div className="modal modal-open">
            <div className="modal-box max-w-4xl max-h-screen">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg">
                        📋 Détail de la Session
                    </h3>
                    <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
                        ✕
                    </button>
                </div>

                {isLoading ? (
                    <div className="space-y-4">
                        <div className="animate-pulse">
                            <div className="h-4 bg-base-300 rounded w-1/4 mb-4"></div>
                            <div className="h-20 bg-base-300 rounded mb-4"></div>
                            <div className="h-40 bg-base-300 rounded mb-4"></div>
                            <div className="h-20 bg-base-300 rounded"></div>
                        </div>
                    </div>
                ) : sessionDetail ? (
                    <div className="space-y-6">
                        {/* Session Info */}
                        <div className="bg-base-200 rounded-lg p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <span className="text-sm text-base-content/60">ID Session:</span>
                                    <p className="font-mono text-sm font-semibold">#{sessionDetail.id}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-base-content/60">Date:</span>
                                    <p className="font-semibold">{new Date(sessionDetail.createdAt).toLocaleString('fr-FR')}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-base-content/60">Race:</span>
                                    <p className="font-semibold capitalize">{sessionDetail.race}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-base-content/60">Signalements:</span>
                                    <p className="font-semibold">
                                        {sessionDetail.reports.length > 0 ? (
                                            <span className="text-warning">
                                                {sessionDetail.reports.length} signalement{sessionDetail.reports.length > 1 ? 's' : ''}
                                            </span>
                                        ) : (
                                            <span className="text-success">Aucun</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Symptoms */}
                        <div>
                            <h4 className="text-md font-bold text-base-content mb-3">Symptômes observés</h4>
                            <div className="flex flex-wrap gap-2">
                                {sessionDetail.symptoms.map((symptom, idx) => (
                                    <span key={idx} className="badge badge-primary badge-lg">
                                        {symptom}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Diagnosis Results */}
                        <div>
                            <h4 className="text-md font-bold text-base-content mb-3">Résultats du diagnostic</h4>
                            {sessionDetail.diagnosisResult.length === 0 ? (
                                <div className="alert alert-info">
                                    <span className="text-sm">Aucun diagnostic spécifique trouvé pour ces symptômes.</span>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {sessionDetail.diagnosisResult.map((disease, idx) => (
                                        <div key={idx} className="card bg-base-100 border border-base-300">
                                            <div className="card-body p-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <h5 className="font-bold text-base-content">
                                                                {disease.name}
                                                            </h5>
                                                            <div className={`badge ${getUrgencyBadge(disease.urgency)}`}>
                                                                {disease.urgency === 'HIGH' ? 'Élevée' :
                                                                    disease.urgency === 'MEDIUM' ? 'Modérée' : 'Faible'}
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-base-content/70 mb-3">
                                                            {disease.description}
                                                        </p>
                                                        <div className="bg-base-50 p-3 rounded-lg">
                                                            <span className="text-sm font-medium text-base-content/70">Conseils:</span>
                                                            <p className="text-sm text-base-content mt-1">
                                                                {disease.advice}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-right">
                                                            <div className={`text-2xl font-bold ${getUrgencyColor(disease.urgency)}`}>
                                                                {disease.probability}%
                                                            </div>
                                                            <div className="text-xs text-base-content/60">
                                                                Probabilité
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Reports */}
                        {sessionDetail.reports.length > 0 && (
                            <div>
                                <h4 className="text-md font-bold text-base-content mb-3">
                                    ⚠️ Signalements ({sessionDetail.reports.length})
                                </h4>
                                <div className="space-y-3">
                                    {sessionDetail.reports.map((report) => (
                                        <div key={report.id} className="alert alert-warning">
                                            <div className="flex-1">
                                                <div class="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium">
                                                        {new Date(report.createdAt).toLocaleString('fr-FR')}
                                                    </span>
                                                    {report.resolved && (
                                                        <span className="badge badge-success badge-sm">Résolu</span>
                                                    )}
                                                </div>
                                                <p className="text-sm">{report.feedback}</p>
                                                {report.actualDiagnosis && (
                                                    <div className="mt-2">
                                                        <span className="text-xs font-medium">Diagnostic suggéré: </span>
                                                        <span className="text-xs">{report.actualDiagnosis}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <span className="text-4xl mb-4 block">❌</span>
                        <p className="text-base-content/60">Session non trouvée</p>
                    </div>
                )}

                <div className="modal-action">
                    <button onClick={onClose} className="btn">
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatbotSessionsPage;