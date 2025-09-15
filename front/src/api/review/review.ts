import apiPrivate from "../api.private.ts";
import api from "../api.ts";

export interface Review {
    id: string;
    userId: string;
    resourceType: 'RESTAURANT' | 'DISH';
    resourceId: string;
    rating: number;
    comment?: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    moderatedBy?: string;
    moderatedAt?: string;
    moderationReason?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateReviewRequest {
    userId: string;
    resourceType: 'RESTAURANT' | 'DISH';
    resourceId: string;
    rating: number;
    comment?: string;
}

export interface ReviewStats {
    averageRating: number;
    totalReviews: number;
    ratingsDistribution: Record<number, number>;
}

export interface PaginatedReviews {
    content: Review[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
    first: boolean;
    last: boolean;
}

export interface ModerationRequest {
    status: 'APPROVED' | 'REJECTED';
    moderatorId: string;
    reason?: string;
}

// ===== API FUNCTIONS =====

// Créer un avis (AUTH REQUIRED)
export const createReview = async (request: CreateReviewRequest): Promise<Review> => {
    try {
        const response = await apiPrivate.post('/reviews', request);
        return response.data;
    } catch (err: any) {
        console.error('[createReview] Error:', err?.response?.status, err?.response?.data);

        if (err?.response?.status === 409) {
            throw new Error('Vous avez déjà laissé un avis pour cette ressource');
        }
        if (err?.response?.status === 404) {
            throw new Error('Ressource non trouvée');
        }
        if (err?.response?.status === 400) {
            const errorData = err?.response?.data;
            if (errorData?.message) {
                throw new Error(errorData.message);
            }
            throw new Error('Données invalides');
        }

        throw new Error(err?.response?.data?.message || 'Erreur lors de la création de l\'avis');
    }
};

// Récupérer les avis paginés (PUBLIC)
export const getReviews = async (
    resourceType: 'RESTAURANT' | 'DISH',
    resourceId: string,
    page: number = 0,
    size: number = 20
): Promise<PaginatedReviews> => {
    try {
        const response = await api.get(`/reviews/${resourceType}/${resourceId}`, {
            params: { page, size }
        });
        return response.data;
    } catch (err: any) {
        console.error('[getReviews] Error:', err?.response?.status, err?.response?.data);

        if (err?.response?.status === 404) {
            throw new Error('Ressource non trouvée');
        }

        throw new Error('Erreur lors du chargement des avis');
    }
};

// Récupérer tous les avis (PUBLIC)
export const getAllReviews = async (
    resourceType: 'RESTAURANT' | 'DISH',
    resourceId: string
): Promise<Review[]> => {
    try {
        const response = await api.get(`/reviews/${resourceType}/${resourceId}/all`);
        return response.data;
    } catch (err: any) {
        console.error('[getAllReviews] Error:', err?.response?.status, err?.response?.data);

        if (err?.response?.status === 404) {
            throw new Error('Ressource non trouvée');
        }

        throw new Error('Erreur lors du chargement des avis');
    }
};

// Récupérer les statistiques d'avis (PUBLIC)
export const getReviewStats = async (
    resourceType: 'RESTAURANT' | 'DISH',
    resourceId: string
): Promise<ReviewStats> => {
    try {
        const response = await api.get(`/reviews/${resourceType}/${resourceId}/stats`);
        return response.data;
    } catch (err: any) {
        console.error('[getReviewStats] Error:', err?.response?.status, err?.response?.data);

        if (err?.response?.status === 404) {
            throw new Error('Ressource non trouvée');
        }

        throw new Error('Erreur lors du chargement des statistiques');
    }
};

// Vérifier si un utilisateur a déjà laissé un avis (AUTH REQUIRED)
export const userHasReviewed = async (
    userId: string,
    resourceType: 'RESTAURANT' | 'DISH',
    resourceId: string
): Promise<boolean> => {
    try {
        const response = await apiPrivate.get(`/reviews/${resourceType}/${resourceId}/user/${userId}/exists`);
        return response.data.hasReviewed;
    } catch (err: any) {
        console.error('[userHasReviewed] Error:', err?.response?.status, err?.response?.data);

        // En cas d'erreur, on assume que l'utilisateur n'a pas d'avis
        return false;
    }
};

// ===== ADMIN FUNCTIONS =====

// Récupérer les avis en attente de modération (ADMIN ONLY)
export const getPendingReviews = async (
    page: number = 0,
    size: number = 20
): Promise<PaginatedReviews> => {
    try {
        const response = await apiPrivate.get('/admin/reviews/pending', {
            params: { page, size }
        });
        return response.data;
    } catch (err: any) {
        console.error('[getPendingReviews] Error:', err?.response?.status, err?.response?.data);
        throw new Error('Erreur lors du chargement des avis en attente');
    }
};

// Modérer un avis (ADMIN ONLY)
export const moderateReview = async (
    reviewId: string,
    request: ModerationRequest
): Promise<Review> => {
    try {
        const response = await apiPrivate.put(`/admin/reviews/${reviewId}/moderate`, request);
        return response.data;
    } catch (err: any) {
        console.error('[moderateReview] Error:', err?.response?.status, err?.response?.data);

        if (err?.response?.status === 404) {
            throw new Error('Avis non trouvé');
        }
        if (err?.response?.status === 400) {
            const errorData = err?.response?.data;
            if (errorData?.message) {
                throw new Error(errorData.message);
            }
            throw new Error('Opération de modération invalide');
        }

        throw new Error('Erreur lors de la modération');
    }
};

// Récupérer les statistiques de modération (ADMIN ONLY)
export const getModerationStats = async (): Promise<{
    pending: number;
    approved: number;
    rejected: number;
    oldPending: number;
    totalProcessed: number;
}> => {
    try {
        const response = await apiPrivate.get('/admin/reviews/stats');
        return response.data;
    } catch (err: any) {
        console.error('[getModerationStats] Error:', err?.response?.status, err?.response?.data);
        throw new Error('Erreur lors du chargement des statistiques de modération');
    }
};