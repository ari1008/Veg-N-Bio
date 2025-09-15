// src/page/reviews-moderation.page.tsx
import React, { useState, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import Navbar from './component/navbar';
import Footer from './component/footer';
import {StarRating} from "./component/StarRating.tsx";
import type {Review} from "../api/review/review.ts";
import {useModerationManager} from "../api/review/hook.ts";

interface RejectModalProps {
    review: Review | null;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    isLoading: boolean;
}

const RejectModal: React.FC<RejectModalProps> = ({
                                                     review,
                                                     isOpen,
                                                     onClose,
                                                     onConfirm,
                                                     isLoading,
                                                 }) => {
    const [reason, setReason] = useState('');
    const [selectedReason, setSelectedReason] = useState('');

    const predefinedReasons = [
        'Contenu inapproprié',
        'Langage offensant',
        'Avis non constructif',
        'Spam ou publicité',
        'Informations fausses',
        'Autre',
    ];

    React.useEffect(() => {
        if (isOpen) {
            setReason('');
            setSelectedReason('');
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalReason = selectedReason === 'Autre' ? reason : selectedReason;

        if (!finalReason.trim()) {
            toast.error('Veuillez sélectionner ou saisir une raison');
            return;
        }

        onConfirm(finalReason);
    };

    if (!isOpen || !review) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose}></div>

                <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                            Rejeter cet avis
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Aperçu de l'avis */}
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                            <StarRating rating={review.rating} size="sm" />
                            <span className="text-sm text-gray-600">
                {review.rating}/5
              </span>
                        </div>
                        {review.comment && (
                            <p className="text-sm text-gray-700 line-clamp-3">
                                {review.comment}
                            </p>
                        )}
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Raison du rejet *
                            </label>

                            {/* Raisons prédéfinies */}
                            <div className="space-y-2 mb-3">
                                {predefinedReasons.map((predefinedReason) => (
                                    <label key={predefinedReason} className="flex items-center">
                                        <input
                                            type="radio"
                                            name="reason"
                                            value={predefinedReason}
                                            checked={selectedReason === predefinedReason}
                                            onChange={(e) => setSelectedReason(e.target.value)}
                                            className="mr-2 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">{predefinedReason}</span>
                                    </label>
                                ))}
                            </div>

                            {/* Raison personnalisée */}
                            {selectedReason === 'Autre' && (
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Précisez la raison..."
                                    rows={3}
                                    maxLength={500}
                                    className="w-full mt-2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                />
                            )}
                        </div>

                        <div className="flex items-center justify-end space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isLoading}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading || (!selectedReason || (selectedReason === 'Autre' && !reason.trim()))}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Rejet...
                                    </>
                                ) : (
                                    'Confirmer le rejet'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

const ReviewsModerationPage: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(0);
    const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'old'>('pending');
    const [rejectModalReview, setRejectModalReview] = useState<Review | null>(null);
    const pageSize = 10;

    const {
        pendingReviews,
        pendingReviewsLoading,
        pendingReviewsError,
        stats,
        statsLoading,
        moderating,
        handleApprove,
        handleReject,
        refetchPending,
        refetchStats,
    } = useModerationManager(currentPage, pageSize);

    // Simuler un ID de modérateur - à récupérer du contexte auth
    const moderatorId = 'current-moderator-id';

    const filteredReviews = useMemo(() => {
        if (!pendingReviews?.content) return [];

        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        switch (selectedStatus) {
            case 'old':
                return pendingReviews.content.filter(review =>
                    new Date(review.createdAt) < sevenDaysAgo
                );
            case 'pending':
                return pendingReviews.content.filter(review =>
                    new Date(review.createdAt) >= sevenDaysAgo
                );
            default:
                return pendingReviews.content;
        }
    }, [pendingReviews, selectedStatus]);

    const handleApproveClick = (review: Review) => {
        handleApprove(review.id, moderatorId);
    };

    const handleRejectClick = (review: Review) => {
        setRejectModalReview(review);
    };

    const handleRejectConfirm = (reason: string) => {
        if (rejectModalReview) {
            handleReject(rejectModalReview.id, moderatorId, reason);
            setRejectModalReview(null);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getResourceTypeLabel = (type: string) => {
        return type === 'RESTAURANT' ? 'Restaurant' : 'Plat';
    };

    const isOldReview = (dateString: string) => {
        const now = new Date();
        const reviewDate = new Date(dateString);
        const daysDiff = (now.getTime() - reviewDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff > 7;
    };

    return (
        <div data-theme="vegnbio" className="min-h-screen bg-base-100">
            <Navbar />

            <main className="container mx-auto px-4 py-6">
                {/* En-tête */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Modération des Avis</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Gérez les avis en attente de validation
                        </p>
                    </div>

                    <div className="mt-4 sm:mt-0">
                        <button
                            onClick={() => {
                                refetchPending();
                                refetchStats();
                            }}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Actualiser
                        </button>
                    </div>
                </div>

                {/* Statistiques */}
                {!statsLoading && stats && (
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                                            <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                En attente
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                {stats.pending}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                                            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Approuvés
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                {stats.approved}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-red-100 rounded-md flex items-center justify-center">
                                            <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Rejetés
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                {stats.rejected}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-orange-100 rounded-md flex items-center justify-center">
                                            <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Anciens
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                {stats.oldPending}
                                            </dd>
                                            <dd className="text-xs text-gray-500">
                                                + de 7 jours
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                                            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Total traité
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                {stats.totalProcessed}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filtres */}
                <div className="bg-white shadow rounded-lg mb-6">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center space-x-4">
                            <span className="text-sm font-medium text-gray-700">Filtrer par:</span>
                            <div className="flex space-x-2">
                                {[
                                    { key: 'pending', label: 'Récents', count: stats ? stats.pending - stats.oldPending : 0 },
                                    { key: 'old', label: 'Anciens', count: stats?.oldPending },
                                    { key: 'all', label: 'Tous', count: stats?.pending },
                                ].map(({ key, label, count }) => (
                                    <button
                                        key={key}
                                        onClick={() => {
                                            setSelectedStatus(key as any);
                                            setCurrentPage(0);
                                        }}
                                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                            selectedStatus === key
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                        }`}
                                    >
                                        {label}
                                        {count !== undefined && (
                                            <span className="ml-1 bg-white rounded-full px-1">
                        {count}
                      </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Liste des avis */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">
                            Avis en attente de modération
                        </h2>
                    </div>

                    {pendingReviewsLoading ? (
                        <div className="px-6 py-12">
                            <div className="flex items-center justify-center">
                                <svg className="animate-spin h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="ml-2 text-gray-500">Chargement des avis...</span>
                            </div>
                        </div>
                    ) : pendingReviewsError ? (
                        <div className="px-6 py-12">
                            <div className="text-center">
                                <div className="text-red-600 mb-2">Erreur lors du chargement</div>
                                <p className="text-gray-500 text-sm">{pendingReviewsError.message}</p>
                                <button
                                    onClick={refetchPending}
                                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    Réessayer
                                </button>
                            </div>
                        </div>
                    ) : filteredReviews.length === 0 ? (
                        <div className="px-6 py-12">
                            <div className="text-center">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun avis en attente</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {selectedStatus === 'old' ? 'Aucun avis ancien' : 'Tous les avis ont été traités'}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {filteredReviews.map((review) => (
                                <div key={review.id} className="px-6 py-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex space-x-3 flex-1">
                                            {/* Avatar */}
                                            <div className="flex-shrink-0">
                                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            </div>

                                            {/* Contenu */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm font-medium text-gray-900">
                            Utilisateur {review.userId.substring(0, 8)}***
                          </span>
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                                        getResourceTypeLabel(review.resourceType) === 'Restaurant'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-green-100 text-green-800'
                                                    }`}>
                            {getResourceTypeLabel(review.resourceType)}
                          </span>
                                                    {isOldReview(review.createdAt) && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              Ancien
                            </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center space-x-2 mb-2">
                                                    <StarRating rating={review.rating} size="sm" />
                                                    <span className="text-sm text-gray-500">
                            {formatDate(review.createdAt)}
                          </span>
                                                </div>

                                                {review.comment && (
                                                    <div className="mt-2">
                                                        <p className="text-sm text-gray-700 leading-relaxed">
                                                            {review.comment}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center space-x-2 ml-4">
                                            <button
                                                onClick={() => handleApproveClick(review)}
                                                disabled={moderating}
                                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                                            >
                                                ✓ Approuver
                                            </button>
                                            <button
                                                onClick={() => handleRejectClick(review)}
                                                disabled={moderating}
                                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                                            >
                                                ✗ Rejeter
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {pendingReviews && pendingReviews.totalPages > 1 && (
                        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                            <div className="flex-1 flex justify-between sm:hidden">
                                <button
                                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                                    disabled={pendingReviews.first}
                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Précédent
                                </button>
                                <button
                                    onClick={() => setCurrentPage(Math.min(pendingReviews.totalPages - 1, currentPage + 1))}
                                    disabled={pendingReviews.last}
                                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Suivant
                                </button>
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Affichage de <span className="font-medium">{currentPage * pageSize + 1}</span> à{' '}
                                        <span className="font-medium">
                      {Math.min((currentPage + 1) * pageSize, pendingReviews.totalElements)}
                    </span>{' '}
                                        sur <span className="font-medium">{pendingReviews.totalElements}</span> avis
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                        <button
                                            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                                            disabled={pendingReviews.first}
                                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            <span className="sr-only">Précédent</span>
                                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                                            </svg>
                                        </button>

                                        {Array.from({ length: Math.min(5, pendingReviews.totalPages) }, (_, i) => {
                                            const pageNum = i + Math.max(0, currentPage - 2);
                                            if (pageNum >= pendingReviews.totalPages) return null;

                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => setCurrentPage(pageNum)}
                                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                        pageNum === currentPage
                                                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {pageNum + 1}
                                                </button>
                                            );
                                        })}

                                        <button
                                            onClick={() => setCurrentPage(Math.min(pendingReviews.totalPages - 1, currentPage + 1))}
                                            disabled={pendingReviews.last}
                                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            <span className="sr-only">Suivant</span>
                                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Modal de rejet */}
            <RejectModal
                review={rejectModalReview}
                isOpen={!!rejectModalReview}
                onClose={() => setRejectModalReview(null)}
                onConfirm={handleRejectConfirm}
                isLoading={moderating}
            />

            <Footer />
        </div>
    );
};

export default ReviewsModerationPage;