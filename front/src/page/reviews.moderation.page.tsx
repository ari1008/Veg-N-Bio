// src/page/reviews-moderation.page.tsx
import React, { useState, useMemo, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import Navbar from './component/navbar';
import Footer from './component/footer';
import { StarRating } from "./component/StarRating.tsx";
import type { Review } from "../api/review/review.ts";
import { useModerationManager } from "../api/review/hook.ts";
import { useGetAllRestaurant } from '../api/restaurant/hook/useRestaurant';
import { useGetAllDishes } from '../api/menu/hook/hook';
import type { Restaurant } from "../api/restaurant/dto/restaurant.ts";
import type { Dish } from "../api/menu/dto/dto.ts";

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
        { value: 'inappropriate', label: 'Contenu inapproprié', icon: '🚫' },
        { value: 'offensive', label: 'Langage offensant', icon: '🤬' },
        { value: 'unconstructive', label: 'Avis non constructif', icon: '📝' },
        { value: 'spam', label: 'Spam ou publicité', icon: '📢' },
        { value: 'false_info', label: 'Informations fausses', icon: '❌' },
        { value: 'duplicate', label: 'Avis dupliqué', icon: '📋' },
        { value: 'other', label: 'Autre', icon: '💭' },
    ];

    React.useEffect(() => {
        if (isOpen) {
            setReason('');
            setSelectedReason('');
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalReason = selectedReason === 'other' ? reason : predefinedReasons.find(r => r.value === selectedReason)?.label || selectedReason;

        if (!finalReason.trim()) {
            toast.error('Veuillez sélectionner ou saisir une raison');
            return;
        }

        onConfirm(finalReason);
    };

    if (!isOpen || !review) return null;

    return (
        <div className="modal modal-open">
            <div className="modal-box w-11/12 max-w-lg">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-3">
                        <div className="avatar placeholder">
                            <div className="bg-error text-error-content rounded-full w-10 h-10">
                                <span className="text-lg">⚠️</span>
                            </div>
                        </div>
                        Rejeter cet avis
                    </h3>
                    <button
                        onClick={onClose}
                        className="btn btn-sm btn-circle btn-ghost"
                    >
                        ✕
                    </button>
                </div>

                {/* Aperçu de l'avis */}
                <div className="alert alert-warning mb-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <StarRating rating={review.rating} size="sm" />
                            <div className="badge badge-neutral">{review.rating}/5</div>
                        </div>
                        {review.comment && (
                            <blockquote className="text-sm italic border-l-4 border-warning pl-3">
                                "{review.comment}"
                            </blockquote>
                        )}
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-control w-full mb-6">
                        <label className="label">
                            <span className="label-text font-semibold">Raison du rejet *</span>
                        </label>

                        {/* Raisons prédéfinies avec DaisyUI */}
                        <div className="space-y-2 mb-4">
                            {predefinedReasons.map((predefinedReason) => (
                                <label key={predefinedReason.value} className="label cursor-pointer justify-start gap-3 p-3 hover:bg-base-200 rounded-lg border-2 border-transparent hover:border-base-300">
                                    <input
                                        type="radio"
                                        name="reason"
                                        value={predefinedReason.value}
                                        checked={selectedReason === predefinedReason.value}
                                        onChange={(e) => setSelectedReason(e.target.value)}
                                        className="radio radio-error"
                                    />
                                    <span className="text-lg">{predefinedReason.icon}</span>
                                    <span className="label-text">{predefinedReason.label}</span>
                                </label>
                            ))}
                        </div>

                        {/* Raison personnalisée */}
                        {selectedReason === 'other' && (
                            <div className="form-control w-full">
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Précisez la raison..."
                                    rows={3}
                                    maxLength={500}
                                    className="textarea textarea-bordered textarea-error"
                                />
                                <label className="label">
                                    <span className="label-text-alt"></span>
                                    <span className="label-text-alt">{reason.length}/500</span>
                                </label>
                            </div>
                        )}
                    </div>

                    <div className="modal-action">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="btn btn-ghost"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || (!selectedReason || (selectedReason === 'other' && !reason.trim()))}
                            className={`btn btn-error ${isLoading ? 'loading' : ''}`}
                        >
                            {isLoading ? 'Rejet en cours...' : 'Confirmer le rejet'}
                        </button>
                    </div>
                </form>
            </div>
            <div className="modal-backdrop" onClick={onClose}></div>
        </div>
    );
};

const ReviewsModerationPage: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(0);
    const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'old'>('pending');
    const [rejectModalReview, setRejectModalReview] = useState<Review | null>(null);
    const [selectedReviews, setSelectedReviews] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'date' | 'rating'>('date');
    const [viewMode, setViewMode] = useState<'list' | 'compact'>('list');
    const [showBulkActions, setShowBulkActions] = useState(false);
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

    // Hooks pour récupérer les données des restaurants et plats
    const { mutate: loadRestaurants, data: restaurants = [] } = useGetAllRestaurant();
    const { data: dishes = [] } = useGetAllDishes();

    // Charger les données au montage du composant
    React.useEffect(() => {
        loadRestaurants();
    }, [loadRestaurants]);

    const moderatorId = 'current-moderator-id';

    // DÉCLARATION PRIORITAIRE - AVANT TOUTE UTILISATION
    const filteredAndSortedReviews = useMemo(() => {
        if (!pendingReviews?.content) return [];

        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        let filtered = pendingReviews.content;

        // Filtrer par statut
        switch (selectedStatus) {
            case 'old':
                filtered = filtered.filter(review => new Date(review.createdAt) < sevenDaysAgo);
                break;
            case 'pending':
                filtered = filtered.filter(review => new Date(review.createdAt) >= sevenDaysAgo);
                break;
            default:
                break;
        }

        // Filtrer par recherche
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(review =>
                review.comment?.toLowerCase().includes(query) ||
                review.userId.toLowerCase().includes(query)
            );
        }

        // Trier
        filtered.sort((a, b) => {
            if (sortBy === 'date') {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            } else {
                return b.rating - a.rating;
            }
        });

        return filtered;
    }, [pendingReviews, selectedStatus, searchQuery, sortBy]);

    // États pour les détails des ressources
    const [resourceDetails, setResourceDetails] = useState<Map<string, any>>(new Map());

    // Fonction pour récupérer les détails d'une ressource en utilisant les hooks
    const getResourceDetails = useCallback((resourceType: string, resourceId: string) => {
        const cacheKey = `${resourceType}-${resourceId}`;

        // Vérifier le cache d'abord
        if (resourceDetails.has(cacheKey)) {
            return resourceDetails.get(cacheKey);
        }

        let details = null;

        if (resourceType === 'RESTAURANT') {
            // Chercher le restaurant dans les données chargées
            const restaurant = restaurants.find((r: Restaurant) => r.id === resourceId);
            if (restaurant) {
                details = {
                    name: restaurant.name,
                    address: restaurant.address,
                    cuisine: restaurant.restaurantFeatures?.join(', ') || 'Restaurant',
                    rating: 4.2, // À remplacer par la vraie note si disponible
                    phone: restaurant.phoneNumber || 'Non renseigné',
                    description: restaurant.description || '',
                    features: restaurant.restaurantFeatures || []
                };
            }
        } else if (resourceType === 'DISH') {
            // Chercher le plat dans les données chargées
            const dish = dishes.find((d: Dish) => d.id === resourceId);
            if (dish) {
                details = {
                    name: dish.name,
                    description: dish.description || 'Délicieux plat',
                    price: `€${dish.price.toFixed(2)}`,
                    category: dish.category,
                    allergens: dish.allergens || [],
                    available: dish.available,
                    restaurantName: 'Restaurant partenaire' // Pourrait être enrichi avec plus d'info
                };
            }
        }

        // Mettre en cache si trouvé
        if (details) {
            setResourceDetails(prev => new Map(prev).set(cacheKey, details));
        }

        return details;
    }, [resourceDetails, restaurants, dishes]);

    const getCategoryLabel = (category: string) => {
        const labels = {
            'ENTREE': '🥗 Entrée',
            'PLAT': '🍽️ Plat principal',
            'DESSERT': '🍰 Dessert',
            'BOISSON': '🥤 Boisson'
        };
        return labels[category as keyof typeof labels] || category;
    };

    const getAllergenLabel = (allergen: string) => {
        const labels = {
            'GLUTEN': 'Gluten',
            'CRUSTACEANS': 'Crustacés',
            'EGGS': 'Œufs',
            'FISH': 'Poisson',
            'PEANUTS': 'Arachides',
            'SOYBEANS': 'Soja',
            'MILK': 'Lait',
            'NUTS': 'Fruits à coque',
            'CELERY': 'Céleri',
            'MUSTARD': 'Moutarde',
            'SESAME_SEEDS': 'Graines de sésame',
            'SULPHITES': 'Sulfites',
            'LUPIN': 'Lupin',
            'MOLLUSCS': 'Mollusques'
        };
        return labels[allergen as keyof typeof labels] || allergen;
    };

    // MAINTENANT ON PEUT UTILISER filteredAndSortedReviews EN SÉCURITÉ
    const handleSelectReview = useCallback((reviewId: string, checked: boolean) => {
        setSelectedReviews(prev => {
            const newSet = new Set(prev);
            if (checked) {
                newSet.add(reviewId);
            } else {
                newSet.delete(reviewId);
            }
            setShowBulkActions(newSet.size > 0);
            return newSet;
        });
    }, []);

    const handleSelectAll = useCallback((checked: boolean) => {
        if (checked) {
            const newSet = new Set(filteredAndSortedReviews.map(r => r.id));
            setSelectedReviews(newSet);
            setShowBulkActions(true);
        } else {
            setSelectedReviews(new Set());
            setShowBulkActions(false);
        }
    }, [filteredAndSortedReviews]);

    const handleBulkApprove = useCallback(async () => {
        const promises = Array.from(selectedReviews).map(reviewId =>
            handleApprove(reviewId, moderatorId)
        );

        try {
            await Promise.all(promises);
            toast.success(`${selectedReviews.size} avis approuvés`);
            setSelectedReviews(new Set());
            setShowBulkActions(false);
        } catch (error) {
            toast.error('Erreur lors de l\'approbation en masse');
        }
    }, [selectedReviews, handleApprove, moderatorId]);

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
        <div data-theme="vegnbio" className="min-h-screen bg-base-200">
            <Navbar />

            <div className="container mx-auto px-4 py-6">
                {/* En-tête avec hero */}
                <div className="hero bg-base-100 rounded-box shadow-xl mb-8">
                    <div className="hero-content text-center">
                        <div className="max-w-md">
                            <div className="avatar placeholder mb-4">
                                <div className="bg-primary text-primary-content rounded-full w-20 h-20">
                                    <span className="text-3xl">🛡️</span>
                                </div>
                            </div>
                            <h1 className="text-4xl font-bold">Modération des Avis</h1>
                            <p className="py-6">
                                Gérez et validez les avis utilisateurs pour maintenir la qualité de votre plateforme
                            </p>
                            <div className="flex justify-center gap-2">
                                <div className="join">
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`btn join-item ${viewMode === 'list' ? 'btn-active' : ''}`}
                                    >
                                        📋 Liste
                                    </button>
                                    <button
                                        onClick={() => setViewMode('compact')}
                                        className={`btn join-item ${viewMode === 'compact' ? 'btn-active' : ''}`}
                                    >
                                        📊 Compact
                                    </button>
                                </div>
                                <button
                                    onClick={() => {
                                        refetchPending();
                                        refetchStats();
                                    }}
                                    className="btn btn-primary"
                                >
                                    🔄 Actualiser
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions en masse */}
                {showBulkActions && (
                    <div className="alert alert-info mb-6">
                        <div className="flex-1">
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                    <span className="badge badge-primary badge-lg">
                                        {selectedReviews.size}
                                    </span>
                                    <span>avis sélectionné{selectedReviews.size > 1 ? 's' : ''}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleBulkApprove}
                                        disabled={moderating}
                                        className={`btn btn-success btn-sm ${moderating ? 'loading' : ''}`}
                                    >
                                        ✅ Approuver tout
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedReviews(new Set());
                                            setShowBulkActions(false);
                                        }}
                                        className="btn btn-ghost btn-sm"
                                    >
                                        ❌ Annuler
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Statistiques avec DaisyUI */}
                {!statsLoading && stats && (
                    <div className="stats stats-vertical lg:stats-horizontal shadow-xl mb-8 w-full">
                        <div className="stat">
                            <div className="stat-figure text-warning">
                                <div className="avatar placeholder">
                                    <div className="bg-warning text-warning-content rounded-full w-16 h-16">
                                        <span className="text-2xl">⏳</span>
                                    </div>
                                </div>
                            </div>
                            <div className="stat-title">En attente</div>
                            <div className="stat-value text-warning">{stats.pending}</div>
                            <div className="stat-desc">À modérer</div>
                        </div>

                        <div className="stat">
                            <div className="stat-figure text-success">
                                <div className="avatar placeholder">
                                    <div className="bg-success text-success-content rounded-full w-16 h-16">
                                        <span className="text-2xl">✅</span>
                                    </div>
                                </div>
                            </div>
                            <div className="stat-title">Approuvés</div>
                            <div className="stat-value text-success">{stats.approved}</div>
                            <div className="stat-desc">Validés</div>
                        </div>

                        <div className="stat">
                            <div className="stat-figure text-error">
                                <div className="avatar placeholder">
                                    <div className="bg-error text-error-content rounded-full w-16 h-16">
                                        <span className="text-2xl">❌</span>
                                    </div>
                                </div>
                            </div>
                            <div className="stat-title">Rejetés</div>
                            <div className="stat-value text-error">{stats.rejected}</div>
                            <div className="stat-desc">Refusés</div>
                        </div>

                        <div className="stat">
                            <div className="stat-figure text-orange-500">
                                <div className="avatar placeholder">
                                    <div className="bg-orange-100 text-orange-600 rounded-full w-16 h-16">
                                        <span className="text-2xl">🚨</span>
                                    </div>
                                </div>
                            </div>
                            <div className="stat-title">Urgents</div>
                            <div className="stat-value text-orange-600">{stats.oldPending}</div>
                            <div className="stat-desc">+ 7 jours</div>
                        </div>

                        <div className="stat">
                            <div className="stat-figure text-info">
                                <div className="avatar placeholder">
                                    <div className="bg-info text-info-content rounded-full w-16 h-16">
                                        <span className="text-2xl">📊</span>
                                    </div>
                                </div>
                            </div>
                            <div className="stat-title">Total traité</div>
                            <div className="stat-value text-info">{stats.totalProcessed}</div>
                            <div className="stat-desc">
                                {stats.totalProcessed > 0 ? `${Math.round((stats.approved / stats.totalProcessed) * 100)}%` : '0%'} approuvés
                            </div>
                        </div>
                    </div>
                )}

                {/* Barre de recherche et filtres avec DaisyUI */}
                <div className="card bg-base-100 shadow-xl mb-6">
                    <div className="card-body">
                        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                            {/* Recherche */}
                            <div className="form-control w-full max-w-md">
                                <label className="label">
                                    <span className="label-text">🔍 Rechercher</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Rechercher dans les avis..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="input input-bordered w-full"
                                />
                            </div>

                            {/* Tri */}
                            <div className="form-control w-full max-w-xs">
                                <label className="label">
                                    <span className="label-text">📊 Trier par</span>
                                </label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as 'date' | 'rating')}
                                    className="select select-bordered w-full"
                                >
                                    <option value="date">📅 Date</option>
                                    <option value="rating">⭐ Note</option>
                                </select>
                            </div>

                            {/* Filtres de statut */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">🏷️ Filtres</span>
                                </label>
                                <div className="join">
                                    {[
                                        { key: 'pending', label: 'Récents', count: stats ? stats.pending - stats.oldPending : 0, emoji: '🆕' },
                                        { key: 'old', label: 'Anciens', count: stats?.oldPending, emoji: '⚠️' },
                                        { key: 'all', label: 'Tous', count: stats?.pending, emoji: '📋' },
                                    ].map(({ key, label, count, emoji }) => (
                                        <button
                                            key={key}
                                            onClick={() => {
                                                setSelectedStatus(key as any);
                                                setCurrentPage(0);
                                            }}
                                            className={`btn join-item ${
                                                selectedStatus === key ? 'btn-active' : ''
                                            }`}
                                        >
                                            {emoji} {label}
                                            {count !== undefined && (
                                                <div className="badge badge-sm ml-2">
                                                    {count}
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Liste des avis */}
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-header bg-base-200">
                        <div className="card-body">
                            <div className="flex items-center justify-between">
                                <h2 className="card-title text-2xl">
                                    📝 Avis en attente
                                    {filteredAndSortedReviews.length > 0 && (
                                        <div className="badge badge-primary badge-lg">
                                            {filteredAndSortedReviews.length}
                                        </div>
                                    )}
                                </h2>

                                {/* Sélection globale */}
                                {filteredAndSortedReviews.length > 0 && (
                                    <div className="form-control">
                                        <label className="label cursor-pointer gap-2">
                                            <span className="label-text">Tout sélectionner</span>
                                            <input
                                                type="checkbox"
                                                checked={selectedReviews.size === filteredAndSortedReviews.length}
                                                onChange={(e) => handleSelectAll(e.target.checked)}
                                                className="checkbox checkbox-primary"
                                            />
                                        </label>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="card-body">
                        {pendingReviewsLoading ? (
                            <div className="flex flex-col items-center justify-center py-16">
                                <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
                                <p className="text-base-content/60">Chargement des avis...</p>
                            </div>
                        ) : pendingReviewsError ? (
                            <div className="alert alert-error">
                                <div className="flex-1">
                                    <div className="flex flex-col items-center text-center">
                                        <span className="text-4xl mb-4">🚨</span>
                                        <h3 className="font-bold">Erreur lors du chargement</h3>
                                        <p className="text-sm">{pendingReviewsError.message}</p>
                                        <button
                                            onClick={refetchPending}
                                            className="btn btn-error btn-sm mt-4"
                                        >
                                            Réessayer
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : filteredAndSortedReviews.length === 0 ? (
                            <div className="hero py-16">
                                <div className="hero-content text-center">
                                    <div className="max-w-md">
                                        <div className="avatar placeholder mb-4">
                                            <div className="bg-base-300 text-base-content rounded-full w-20 h-20">
                                                <span className="text-3xl">🎉</span>
                                            </div>
                                        </div>
                                        <h3 className="text-2xl font-bold">Aucun avis trouvé</h3>
                                        <p className="py-4">
                                            {searchQuery ? `Aucun résultat pour "${searchQuery}"` :
                                                selectedStatus === 'old' ? 'Aucun avis ancien en attente' : 'Tous les avis ont été traités !'}
                                        </p>
                                        {searchQuery && (
                                            <button
                                                onClick={() => setSearchQuery('')}
                                                className="btn btn-primary"
                                            >
                                                Effacer la recherche
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredAndSortedReviews.map((review) => {
                                    const details = getResourceDetails(review.resourceType, review.resourceId);

                                    return (
                                        <div
                                            key={review.id}
                                            className={`card bg-base-100 shadow-md hover:shadow-lg transition-all duration-300 ${
                                                selectedReviews.has(review.id) ? 'ring-2 ring-primary' : ''
                                            } ${
                                                isOldReview(review.createdAt) ? 'border-l-4 border-l-error' :
                                                    review.rating <= 2 ? 'border-l-4 border-l-warning' : 'border-l-4 border-l-primary'
                                            }`}
                                        >
                                            <div className="card-body">
                                                <div className="flex items-start gap-4">
                                                    {/* Checkbox */}
                                                    <div className="form-control">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedReviews.has(review.id)}
                                                            onChange={(e) => handleSelectReview(review.id, e.target.checked)}
                                                            className="checkbox checkbox-primary"
                                                        />
                                                    </div>

                                                    {/* Avatar avec priorité */}
                                                    <div className="avatar placeholder">
                                                        <div className={`w-12 h-12 rounded-full ${
                                                            isOldReview(review.createdAt) ? 'bg-error text-error-content' :
                                                                review.rating <= 2 ? 'bg-warning text-warning-content' : 'bg-primary text-primary-content'
                                                        }`}>
                                                            <span className="text-lg">
                                                                {isOldReview(review.createdAt) ? '🚨' : review.rating <= 2 ? '⚠️' : '👤'}
                                                            </span>
                                                        </div>
                                                        {isOldReview(review.createdAt) && (
                                                            <div className="avatar-indicator indicator">
                                                                <span className="indicator-item badge badge-error badge-xs">!</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Contenu */}
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <h3 className="font-semibold">
                                                                Utilisateur {review.userId.substring(0, 8)}***
                                                            </h3>
                                                            <div className={`badge ${
                                                                getResourceTypeLabel(review.resourceType) === 'Restaurant'
                                                                    ? 'badge-info' : 'badge-success'
                                                            }`}>
                                                                {getResourceTypeLabel(review.resourceType)}
                                                            </div>
                                                            {isOldReview(review.createdAt) && (
                                                                <div className="badge badge-error animate-pulse">
                                                                    🚨 Urgent
                                                                </div>
                                                            )}
                                                            {review.rating <= 2 && (
                                                                <div className="badge badge-warning">
                                                                    ⚠️ Note faible
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Détails de la ressource */}
                                                        <div className="mb-3">
                                                            {!details ? (
                                                                <div className="flex items-center gap-2 text-sm opacity-60">
                                                                    <div className="loading loading-spinner loading-xs"></div>
                                                                    <span>Ressource #{review.resourceId.substring(0, 8)}...</span>
                                                                </div>
                                                            ) : review.resourceType === 'RESTAURANT' ? (
                                                                <div className="space-y-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-lg">🏪</span>
                                                                        <span className="font-medium text-primary">{details.name}</span>
                                                                        {details.features && details.features.length > 0 && (
                                                                            <div className="badge badge-outline badge-sm">
                                                                                {details.features[0]}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center gap-2 text-sm opacity-70">
                                                                        <span>📍</span>
                                                                        <span className="truncate">{details.address}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-4 text-sm opacity-70">
                                                                        <div className="flex items-center gap-1">
                                                                            <span>⭐</span>
                                                                            <span>{details.rating}/5</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-1">
                                                                            <span>📞</span>
                                                                            <span>{details.phone}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="space-y-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-lg">🍽️</span>
                                                                        <span className="font-medium text-success">{details.name}</span>
                                                                        <div className="badge badge-success badge-outline badge-sm">
                                                                            {details.price}
                                                                        </div>
                                                                        {!details.available && (
                                                                            <div className="badge badge-error badge-sm">
                                                                                Indisponible
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center gap-2 text-sm opacity-70">
                                                                        <span className="truncate">{getCategoryLabel(details.category)}</span>
                                                                    </div>
                                                                    <div className="text-sm opacity-70 italic">"{details.description}"</div>
                                                                    {details.allergens && details.allergens.length > 0 && (
                                                                        <div className="flex items-center gap-1 flex-wrap">
                                                                            <span className="text-sm">⚠️ Allergènes:</span>
                                                                            {details.allergens.slice(0, 3).map((allergen: string, index: number) => (
                                                                                <div key={index} className="badge badge-warning badge-xs">
                                                                                    {getAllergenLabel(allergen)}
                                                                                </div>
                                                                            ))}
                                                                            {details.allergens.length > 3 && (
                                                                                <div className="badge badge-warning badge-xs">
                                                                                    +{details.allergens.length - 3}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center gap-3 mb-3">
                                                            <StarRating rating={review.rating} size="sm" />
                                                            <span className="text-sm opacity-70">
                                                                {formatDate(review.createdAt)}
                                                            </span>
                                                            <div className="badge badge-ghost badge-sm">
                                                                #{review.id.substring(0, 8)}
                                                            </div>
                                                        </div>

                                                        {review.comment && (
                                                            <div className="alert alert-info">
                                                                <div className="flex-1">
                                                                    <blockquote className="italic">
                                                                        "{review.comment}"
                                                                    </blockquote>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex flex-col gap-2">
                                                        <button
                                                            onClick={() => handleApproveClick(review)}
                                                            disabled={moderating}
                                                            className={`btn btn-success btn-sm ${moderating ? 'loading' : ''}`}
                                                        >
                                                            <span className="text-sm">✅</span>
                                                            Approuver
                                                        </button>
                                                        <button
                                                            onClick={() => handleRejectClick(review)}
                                                            disabled={moderating}
                                                            className={`btn btn-error btn-sm ${moderating ? 'loading' : ''}`}
                                                        >
                                                            <span className="text-sm">❌</span>
                                                            Rejeter
                                                        </button>
                                                        {isOldReview(review.createdAt) && (
                                                            <div className="text-xs text-error font-bold">
                                                                📅 {Math.floor((new Date().getTime() - new Date(review.createdAt).getTime()) / (1000 * 60 * 60 * 24))} jours
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Pagination avec DaisyUI */}
                    {pendingReviews && pendingReviews.totalPages > 1 && (
                        <div className="card-actions justify-between items-center bg-base-200 p-4">
                            <div className="text-sm opacity-70">
                                Affichage de <span className="font-bold">{currentPage * pageSize + 1}</span> à{' '}
                                <span className="font-bold">
                                    {Math.min((currentPage + 1) * pageSize, pendingReviews.totalElements)}
                                </span>{' '}
                                sur <span className="font-bold">{pendingReviews.totalElements}</span> avis
                            </div>

                            <div className="join">
                                <button
                                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                                    disabled={pendingReviews.first}
                                    className="join-item btn btn-sm"
                                >
                                    «
                                </button>

                                {Array.from({ length: Math.min(5, pendingReviews.totalPages) }, (_, i) => {
                                    const pageNum = i + Math.max(0, currentPage - 2);
                                    if (pageNum >= pendingReviews.totalPages) return null;

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`join-item btn btn-sm ${
                                                pageNum === currentPage ? 'btn-active' : ''
                                            }`}
                                        >
                                            {pageNum + 1}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={() => setCurrentPage(Math.min(pendingReviews.totalPages - 1, currentPage + 1))}
                                    disabled={pendingReviews.last}
                                    className="join-item btn btn-sm"
                                >
                                    »
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Indicateurs de performance avec DaisyUI */}
                {stats && (
                    <div className="card bg-gradient-to-r from-primary to-secondary text-primary-content shadow-xl mt-8">
                        <div className="card-body">
                            <h2 className="card-title text-2xl mb-6">
                                📊 Aperçu des performances
                            </h2>
                            <div className="stats stats-vertical lg:stats-horizontal bg-base-100/20 backdrop-blur">
                                <div className="stat">
                                    <div className="stat-figure">
                                        <div className="avatar placeholder">
                                            <div className="bg-success text-success-content rounded-full w-16 h-16">
                                                <span className="text-2xl">📈</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="stat-title text-primary-content/70">Taux d'approbation</div>
                                    <div className="stat-value text-success">
                                        {stats.totalProcessed > 0 ? Math.round((stats.approved / stats.totalProcessed) * 100) : 0}%
                                    </div>
                                    <div className="stat-desc text-primary-content/60">
                                        {stats.approved} sur {stats.totalProcessed}
                                    </div>
                                </div>

                                <div className="stat">
                                    <div className="stat-figure">
                                        <div className="avatar placeholder">
                                            <div className="bg-warning text-warning-content rounded-full w-16 h-16">
                                                <span className="text-2xl">⏰</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="stat-title text-primary-content/70">File d'attente</div>
                                    <div className="stat-value text-warning">{stats.pending}</div>
                                    <div className="stat-desc text-primary-content/60">
                                        {stats.pending > 0 ? 'Avis à traiter' : 'Aucun en attente'}
                                    </div>
                                </div>

                                <div className="stat">
                                    <div className="stat-figure">
                                        <div className="avatar placeholder">
                                            <div className="bg-error text-error-content rounded-full w-16 h-16">
                                                <span className="text-2xl">🚨</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="stat-title text-primary-content/70">Avis urgents</div>
                                    <div className="stat-value text-error">{stats.oldPending}</div>
                                    <div className="stat-desc text-primary-content/60">
                                        {stats.oldPending > 0 ? 'Nécessitent une action' : 'Aucun urgent'}
                                    </div>
                                </div>
                            </div>

                            {/* Progress bars pour visualiser les ratios */}
                            <div className="mt-6 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Progression générale</span>
                                    <span>{stats.totalProcessed} avis traités</span>
                                </div>
                                <progress
                                    className="progress progress-success w-full"
                                    value={stats.totalProcessed}
                                    max={stats.totalProcessed + stats.pending}
                                ></progress>

                                {stats.oldPending > 0 && (
                                    <>
                                        <div className="flex justify-between text-sm">
                                            <span>Avis urgents</span>
                                            <span className="text-error">{stats.oldPending} à traiter rapidement</span>
                                        </div>
                                        <progress
                                            className="progress progress-error w-full"
                                            value={stats.oldPending}
                                            max={stats.pending}
                                        ></progress>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Conseils et raccourcis avec DaisyUI */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                    <div className="card bg-info text-info-content shadow-lg">
                        <div className="card-body">
                            <h3 className="card-title">💡 Conseils de modération</h3>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                <li>Traitez les avis urgents (🚨) en priorité</li>
                                <li>Utilisez la sélection multiple pour les actions en masse</li>
                                <li>Vérifiez les notes faibles (⚠️) avec attention</li>
                                <li>Documentez les rejets avec des raisons précises</li>
                            </ul>
                        </div>
                    </div>

                    <div className="card bg-success text-success-content shadow-lg">
                        <div className="card-body">
                            <h3 className="card-title">⌨️ Raccourcis clavier</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Actualiser</span>
                                    <kbd className="kbd kbd-sm">F5</kbd>
                                </div>
                                <div className="flex justify-between">
                                    <span>Recherche</span>
                                    <kbd className="kbd kbd-sm">Ctrl + F</kbd>
                                </div>
                                <div className="flex justify-between">
                                    <span>Sélectionner tout</span>
                                    <kbd className="kbd kbd-sm">Ctrl + A</kbd>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Toast personnalisé pour les notifications */}
                <div className="toast toast-top toast-end">
                    {moderating && (
                        <div className="alert alert-info">
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="loading loading-spinner loading-sm"></span>
                                    <span>Modération en cours...</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de rejet avec DaisyUI */}
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