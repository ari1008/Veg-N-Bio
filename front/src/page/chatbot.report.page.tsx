import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
    useGetAllReports,
    useResolveReport,
    useGetSessionDetail,
    useChatbotStats
} from '../api/chatbot/hook/hook';
import type { ChatbotReport, ChatbotSessionDetail, ResolveReportRequest } from '../api/chatbot/dto/dto';
import ChatbotLayout from "./component/ChatbotLayout.tsx";

interface ReportsFilters {
    startDate: string;
    endDate: string;
    search: string;
}

type TabType = 'pending' | 'resolved';

const ChatbotReportsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('pending');
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize] = useState(10);
    const [filters, setFilters] = useState<ReportsFilters>({
        startDate: '',
        endDate: '',
        search: ''
    });

    const [selectedReport, setSelectedReport] = useState<ChatbotReport | null>(null);
    const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

    const { data: reportsData, isLoading, refetch } = useGetAllReports(
        activeTab === 'resolved',
        currentPage,
        pageSize
    );
    const { mutate: resolveReport, isPending: isResolving } = useResolveReport();
    const { data: sessionDetail, isLoading: isLoadingSession } = useGetSessionDetail(selectedSessionId || '');
    const { data: stats } = useChatbotStats();

    useEffect(() => {
        setCurrentPage(0);
    }, [activeTab]);

    const filteredReports = reportsData?.content.filter(report => {
        const reportDate = new Date(report.createdAt);
        const matchesStartDate = !filters.startDate || reportDate >= new Date(filters.startDate);
        const matchesEndDate = !filters.endDate || reportDate <= new Date(filters.endDate + 'T23:59:59');
        const matchesSearch = !filters.search ||
            report.feedback.toLowerCase().includes(filters.search.toLowerCase()) ||
            report.actualDiagnosis?.toLowerCase().includes(filters.search.toLowerCase()) ||
            report.sessionId.toLowerCase().includes(filters.search.toLowerCase());

        return matchesStartDate && matchesEndDate && matchesSearch;
    }) || [];

    const handleResolveReport = (data: ResolveReportRequest) => {
        if (!selectedReport) return;

        resolveReport({ id: selectedReport.id, data }, {
            onSuccess: () => {
                toast.success('Signalement résolu avec succès !');
                setIsResolveModalOpen(false);
                setSelectedReport(null);
                refetch();
            },
            onError: (error: any) => {
                toast.error('Erreur lors de la résolution');
                console.error(error);
            }
        });
    };

    const openResolveModal = (report: ChatbotReport) => {
        setSelectedReport(report);
        setIsResolveModalOpen(true);
    };

    const openSessionDetail = (sessionId: string) => {
        setSelectedSessionId(sessionId);
        setIsDetailModalOpen(true);
    };

    const closeModals = () => {
        setIsResolveModalOpen(false);
        setIsDetailModalOpen(false);
        setSelectedReport(null);
        setSelectedSessionId(null);
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

    const getPriorityLevel = (report: ChatbotReport): 'high' | 'medium' | 'low' => {
        const age = Date.now() - new Date(report.createdAt).getTime();
        const daysSinceReport = age / (1000 * 60 * 60 * 24);

        if (daysSinceReport > 7) return 'high';
        if (daysSinceReport > 3) return 'medium';
        return 'low';
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'text-error';
            case 'medium': return 'text-warning';
            case 'low': return 'text-success';
            default: return 'text-base-content';
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'high': return 'badge-error';
            case 'medium': return 'badge-warning';
            case 'low': return 'badge-success';
            default: return 'badge-ghost';
        }
    };

    const exportReports = () => {
        if (!filteredReports.length) {
            toast.error('Aucun signalement à exporter');
            return;
        }

        const csvContent = [
            ['ID Signalement', 'ID Session', 'Feedback', 'Diagnostic Suggéré', 'Date', 'Résolu'].join(','),
            ...filteredReports.map(report => [
                report.id,
                report.sessionId,
                `"${report.feedback.replace(/"/g, '""')}"`,
                `"${report.actualDiagnosis?.replace(/"/g, '""') || 'N/A'}"`,
                new Date(report.createdAt).toLocaleString('fr-FR'),
                report.resolved ? 'Oui' : 'Non'
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `signalements-chatbot-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success('Export réussi !');
    };

    return (
        <ChatbotLayout
            title="Gestion des Signalements"
            subtitle="Traitement des erreurs et améliorations"
        >
            <div className="space-y-6">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="stat bg-base-100 rounded-lg shadow-sm border border-base-300">
                        <div className="stat-figure text-warning">
                            <span className="text-3xl">⚠️</span>
                        </div>
                        <div className="stat-title text-xs">Signalements Actifs</div>
                        <div className="stat-value text-warning text-2xl">
                            {stats?.totalReports || 0}
                        </div>
                        <div className="stat-desc">À traiter</div>
                    </div>

                    <div className="stat bg-base-100 rounded-lg shadow-sm border border-base-300">
                        <div className="stat-figure text-success">
                            <span className="text-3xl">✅</span>
                        </div>
                        <div className="stat-title text-xs">Taux de Résolution</div>
                        <div className="stat-value text-success text-2xl">
                            {reportsData ? Math.round((reportsData.totalElements > 0 ?
                                (reportsData.totalElements - (stats?.totalReports || 0)) / reportsData.totalElements * 100 : 0)) : 0}%
                        </div>
                        <div className="stat-desc">Signalements traités</div>
                    </div>

                    <div className="stat bg-base-100 rounded-lg shadow-sm border border-base-300">
                        <div className="stat-figure text-info">
                            <span className="text-3xl">📈</span>
                        </div>
                        <div className="stat-title text-xs">Précision Globale</div>
                        <div className="stat-value text-info text-2xl">
                            {stats?.accuracyRate ? `${stats.accuracyRate.toFixed(1)}%` : '--'}
                        </div>
                        <div className="stat-desc">Diagnostics corrects</div>
                    </div>
                </div>

                {/* Tabs and Actions */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="tabs tabs-boxed">
                        <button
                            className={`tab ${activeTab === 'pending' ? 'tab-active' : ''}`}
                            onClick={() => setActiveTab('pending')}
                        >
                            ⏳ Non résolus ({stats?.totalReports || 0})
                        </button>
                        <button
                            className={`tab ${activeTab === 'resolved' ? 'tab-active' : ''}`}
                            onClick={() => setActiveTab('resolved')}
                        >
                            ✅ Résolus
                        </button>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={exportReports}
                            className="btn btn-outline btn-sm"
                            disabled={filteredReports.length === 0}
                        >
                            📥 Exporter CSV
                        </button>
                        <button
                            onClick={() => refetch()}
                            className="btn btn-ghost btn-sm"
                            disabled={isLoading}
                        >
                            🔄 Actualiser
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="card bg-base-100 shadow-sm border border-base-300">
                    <div className="card-body">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="label">
                                    <span className="label-text font-medium">Recherche</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="ID session, feedback..."
                                    className="input input-bordered input-sm w-full"
                                    value={filters.search}
                                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
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
                        </div>

                        {Object.values(filters).some(v => v) && (
                            <div className="mt-4">
                                <button
                                    onClick={() => setFilters({ startDate: '', endDate: '', search: '' })}
                                    className="btn btn-ghost btn-sm"
                                >
                                    🗑️ Réinitialiser filtres
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Reports List */}
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="card bg-base-100 shadow-sm border border-base-300">
                                    <div className="card-body animate-pulse">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-base-300 rounded-lg"></div>
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 bg-base-300 rounded w-1/4"></div>
                                                <div className="h-3 bg-base-300 rounded w-3/4"></div>
                                                <div className="h-3 bg-base-300 rounded w-1/2"></div>
                                            </div>
                                            <div className="space-x-2">
                                                <div className="w-20 h-8 bg-base-300 rounded"></div>
                                                <div className="w-20 h-8 bg-base-300 rounded"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredReports.length === 0 ? (
                        <div className="card bg-base-100 shadow-sm border border-base-300">
                            <div className="card-body text-center py-16">
                                <span className="text-6xl mb-4 block">
                                    {activeTab === 'pending' ? '🎉' : '📋'}
                                </span>
                                <h3 className="text-xl font-bold text-base-content mb-2">
                                    {activeTab === 'pending'
                                        ? 'Aucun signalement en attente !'
                                        : 'Aucun signalement résolu'
                                    }
                                </h3>
                                <p className="text-base-content/60 mb-6">
                                    {activeTab === 'pending'
                                        ? 'Tous les signalements ont été traités. Excellent travail !'
                                        : Object.values(filters).some(v => v)
                                            ? 'Aucun signalement résolu ne correspond à vos critères'
                                            : 'Aucun signalement n\'a encore été résolu'
                                    }
                                </p>
                                {Object.values(filters).some(v => v) && (
                                    <button
                                        onClick={() => setFilters({ startDate: '', endDate: '', search: '' })}
                                        className="btn btn-primary"
                                    >
                                        Réinitialiser les filtres
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        filteredReports.map((report) => {
                            const priority = getPriorityLevel(report);

                            return (
                                <div key={report.id} className="card bg-base-100 shadow-sm border border-base-300 hover:shadow-md transition-all duration-200">
                                    <div className="card-body">
                                        <div className="flex items-start gap-4">
                                            <div className="flex-shrink-0">
                                                <div className="w-12 h-12 bg-warning/20 rounded-lg flex items-center justify-center">
                                                    <span className="text-2xl">⚠️</span>
                                                </div>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="text-sm font-bold text-base-content">
                                                            Signalement #{report.id.slice(-8)}
                                                        </h3>
                                                        {activeTab === 'pending' && (
                                                            <div className={`badge badge-sm ${getPriorityBadge(priority)}`}>
                                                                {priority === 'high' ? 'Urgent' :
                                                                    priority === 'medium' ? 'Moyen' : 'Récent'}
                                                            </div>
                                                        )}
                                                        {activeTab === 'resolved' && (
                                                            <div className="badge badge-success badge-sm">
                                                                ✅ Résolu
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-base-content/50">
                                                        {getTimeAgo(report.createdAt)}
                                                    </span>
                                                </div>

                                                <div className="space-y-3">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-xs font-medium text-base-content/70">Session:</span>
                                                            <button
                                                                onClick={() => openSessionDetail(report.sessionId)}
                                                                className="text-xs text-primary hover:text-primary-focus underline font-mono"
                                                            >
                                                                #{report.sessionId.slice(-8)}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <span className="text-xs font-medium text-base-content/70">Feedback utilisateur:</span>
                                                        <p className="text-sm text-base-content mt-1 bg-base-50 p-3 rounded-lg border-l-4 border-warning">
                                                            {report.feedback}
                                                        </p>
                                                    </div>

                                                    {report.actualDiagnosis && (
                                                        <div>
                                                            <span className="text-xs font-medium text-base-content/70">Diagnostic suggéré:</span>
                                                            <p className="text-sm text-base-content mt-1 bg-info/10 p-3 rounded-lg border-l-4 border-info">
                                                                {report.actualDiagnosis}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {report.resolved && report.resolution && (
                                                        <div>
                                                            <span className="text-xs font-medium text-base-content/70">Résolution:</span>
                                                            <p className="text-sm text-base-content mt-1 bg-success/10 p-3 rounded-lg border-l-4 border-success">
                                                                {report.resolution}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2 flex-shrink-0">
                                                <button
                                                    onClick={() => openSessionDetail(report.sessionId)}
                                                    className="btn btn-outline btn-sm"
                                                >
                                                    👁️ Session
                                                </button>

                                                {activeTab === 'pending' && (
                                                    <button
                                                        onClick={() => openResolveModal(report)}
                                                        className="btn btn-success btn-sm"
                                                    >
                                                        ✅ Résoudre
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Pagination */}
                {reportsData && reportsData.totalPages > 1 && (
                    <div className="flex justify-center">
                        <div className="join">
                            <button
                                className="join-item btn btn-sm"
                                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                                disabled={currentPage === 0}
                            >
                                « Précédent
                            </button>

                            {Array.from({ length: Math.min(5, reportsData.totalPages) }, (_, i) => {
                                const pageNum = Math.max(0, Math.min(
                                    reportsData.totalPages - 5,
                                    currentPage - 2
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
                                onClick={() => setCurrentPage(prev => Math.min(reportsData.totalPages - 1, prev + 1))}
                                disabled={currentPage === reportsData.totalPages - 1}
                            >
                                Suivant »
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Resolve Modal */}
            {isResolveModalOpen && selectedReport && (
                <ResolveReportModal
                    report={selectedReport}
                    onResolve={handleResolveReport}
                    onClose={closeModals}
                    isLoading={isResolving}
                />
            )}

            {/* Session Detail Modal */}
            {isDetailModalOpen && selectedSessionId && (
                <SessionDetailModal
                    sessionDetail={sessionDetail}
                    isLoading={isLoadingSession}
                    onClose={closeModals}
                />
            )}
        </ChatbotLayout>
    );
};


interface ResolveReportModalProps {
    report: ChatbotReport;
    onResolve: (data: ResolveReportRequest) => void;
    onClose: () => void;
    isLoading: boolean;
}

const ResolveReportModal: React.FC<ResolveReportModalProps> = ({
                                                                   report,
                                                                   onResolve,
                                                                   onClose,
                                                                   isLoading
                                                               }) => {
    const [resolution, setResolution] = useState('');
    const [updateDisease, setUpdateDisease] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!resolution.trim()) {
            toast.error('Veuillez saisir une résolution');
            return;
        }

        onResolve({
            resolution: resolution.trim(),
            updateDisease
        });
    };

    const quickResolutions = [
        "Diagnostic correct, erreur utilisateur",
        "Symptômes insuffisants pour diagnostic précis",
        "Maladie ajoutée à la base de données",
        "Diagnostic amélioré grâce au feedback",
        "Cas particulier documenté"
    ];

    return (
        <div className="modal modal-open">
            <div className="modal-box max-w-2xl">
                <h3 className="font-bold text-lg mb-4 text-success">
                    ✅ Résoudre le Signalement
                </h3>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Report Summary */}
                    <div className="bg-base-200 rounded-lg p-4">
                        <h4 className="font-semibold text-base-content mb-2">
                            Signalement #{report.id.slice(-8)}
                        </h4>
                        <div className="space-y-2 text-sm">
                            <div>
                                <span className="text-base-content/70">Session:</span>
                                <span className="ml-2 font-mono">#{report.sessionId.slice(-8)}</span>
                            </div>
                            <div>
                                <span className="text-base-content/70">Feedback:</span>
                                <p className="ml-2 text-base-content bg-base-100 p-2 rounded mt-1">
                                    {report.feedback}
                                </p>
                            </div>
                            {report.actualDiagnosis && (
                                <div>
                                    <span className="text-base-content/70">Diagnostic suggéré:</span>
                                    <p className="ml-2 text-base-content bg-base-100 p-2 rounded mt-1">
                                        {report.actualDiagnosis}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Resolutions */}
                    <div>
                        <label className="label">
                            <span className="label-text font-medium">Résolutions rapides</span>
                            <span className="label-text-alt">Cliquez pour utiliser</span>
                        </label>
                        <div className="space-y-2">
                            {quickResolutions.map((quickRes, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setResolution(quickRes)}
                                    className="btn btn-ghost btn-sm justify-start w-full text-left"
                                >
                                    💡 {quickRes}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Resolution */}
                    <div>
                        <label className="label">
                            <span className="label-text font-medium">Résolution personnalisée *</span>
                        </label>
                        <textarea
                            required
                            className="textarea textarea-bordered w-full h-32"
                            placeholder="Décrivez comment ce signalement a été traité et les actions entreprises..."
                            value={resolution}
                            onChange={(e) => setResolution(e.target.value)}
                        />
                    </div>

                    {/* Actions */}
                    <div className="form-control">
                        <label className="label cursor-pointer justify-start gap-3">
                            <input
                                type="checkbox"
                                className="checkbox checkbox-primary"
                                checked={updateDisease}
                                onChange={(e) => setUpdateDisease(e.target.checked)}
                            />
                            <div>
                                <span className="label-text font-medium">Mettre à jour la base de maladies</span>
                                <div className="label-text-alt">
                                    Cochez si ce signalement a conduit à une amélioration des diagnostics
                                </div>
                            </div>
                        </label>
                    </div>

                    <div className="modal-action">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn"
                            disabled={isLoading}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="btn btn-success"
                            disabled={isLoading || !resolution.trim()}
                        >
                            {isLoading ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    Résolution en cours...
                                </>
                            ) : (
                                'Marquer comme résolu'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
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
            <div className="modal-box max-w-3xl max-h-screen">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg">
                        📋 Session Associée
                    </h3>
                    <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
                        ✕
                    </button>
                </div>

                {isLoading ? (
                    <div className="animate-pulse space-y-4">
                        <div className="h-20 bg-base-300 rounded"></div>
                        <div className="h-32 bg-base-300 rounded"></div>
                        <div className="h-24 bg-base-300 rounded"></div>
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
                            <h4 className="text-md font-bold text-base-content mb-3">Diagnostics rendus</h4>
                            {sessionDetail.diagnosisResult.length === 0 ? (
                                <div className="alert alert-info">
                                    <span className="text-sm">Aucun diagnostic spécifique trouvé.</span>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {sessionDetail.diagnosisResult.map((disease, idx) => (
                                        <div key={idx} className="bg-base-100 p-4 rounded-lg border border-base-300">
                                            <div className="flex items-center justify-between mb-2">
                                                <h5 className="font-bold text-base-content">{disease.name}</h5>
                                                <div className="flex items-center gap-2">
                                                    <div className={`badge ${getUrgencyBadge(disease.urgency)}`}>
                                                        {disease.urgency === 'HIGH' ? 'Urgent' :
                                                            disease.urgency === 'MEDIUM' ? 'Modéré' : 'Faible'}
                                                    </div>
                                                    <span className="text-lg font-bold text-primary">
                                                        {disease.probability}%
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-sm text-base-content/70 mb-2">{disease.description}</p>
                                            <div className="text-sm bg-base-50 p-2 rounded">
                                                <strong>Conseils:</strong> {disease.advice}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
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

export default ChatbotReportsPage;