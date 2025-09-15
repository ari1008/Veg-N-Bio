import {
    useQuery,
    useMutation,
    useQueryClient,
    type UseQueryResult,
    type UseMutationResult
} from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
    createReview, type CreateReviewRequest,
    getAllReviews, getModerationStats, getPendingReviews,
    getReviews,
    getReviewStats, moderateReview, type ModerationRequest,
    type PaginatedReviews, type Review,
    type ReviewStats,
    userHasReviewed
} from "./review.ts";


export const useReviews = (
    resourceType: 'RESTAURANT' | 'DISH',
    resourceId: string,
    page: number = 0,
    size: number = 20,
    enabled: boolean = true
): UseQueryResult<PaginatedReviews, Error> => {
    return useQuery({
        queryKey: ['reviews', resourceType, resourceId, page, size],
        queryFn: () => getReviews(resourceType, resourceId, page, size),
        enabled: enabled && !!resourceType && !!resourceId,
        staleTime: 30000, // 30 secondes
        refetchOnWindowFocus: false,
    });
};


export const useAllReviews = (
    resourceType: 'RESTAURANT' | 'DISH',
    resourceId: string,
    enabled: boolean = true
): UseQueryResult<Review[], Error> => {
    return useQuery({
        queryKey: ['reviews', resourceType, resourceId, 'all'],
        queryFn: () => getAllReviews(resourceType, resourceId),
        enabled: enabled && !!resourceType && !!resourceId,
        staleTime: 60000, // 1 minute
        refetchOnWindowFocus: false,
    });
};


export const useReviewStats = (
    resourceType: 'RESTAURANT' | 'DISH',
    resourceId: string,
    enabled: boolean = true
): UseQueryResult<ReviewStats, Error> => {
    return useQuery({
        queryKey: ['reviewStats', resourceType, resourceId],
        queryFn: () => getReviewStats(resourceType, resourceId),
        enabled: enabled && !!resourceType && !!resourceId,
        staleTime: 5 * 60000, // 5 minutes
        refetchOnWindowFocus: false,
    });
};


export const useUserHasReviewed = (
    userId: string,
    resourceType: 'RESTAURANT' | 'DISH',
    resourceId: string,
    enabled: boolean = true
): UseQueryResult<boolean, Error> => {
    return useQuery({
        queryKey: ['userHasReviewed', userId, resourceType, resourceId],
        queryFn: () => userHasReviewed(userId, resourceType, resourceId),
        enabled: enabled && !!userId && !!resourceType && !!resourceId,
        staleTime: 2 * 60000, // 2 minutes
        refetchOnWindowFocus: false,
        retry: false, // Ne pas retry en cas d'erreur (403, etc.)
    });
};


export const usePendingReviews = (
    page: number = 0,
    size: number = 20,
    enabled: boolean = true
): UseQueryResult<PaginatedReviews, Error> => {
    return useQuery({
        queryKey: ['pendingReviews', page, size],
        queryFn: () => getPendingReviews(page, size),
        enabled,
        staleTime: 10000, // 10 secondes
        refetchOnWindowFocus: true, // Refresh pour voir les nouveaux avis
        refetchInterval: 30000, // Auto-refresh toutes les 30 secondes
    });
};


export const useModerationStats = (
    enabled: boolean = true
): UseQueryResult<{
    pending: number;
    approved: number;
    rejected: number;
    oldPending: number;
    totalProcessed: number;
}, Error> => {
    return useQuery({
        queryKey: ['moderationStats'],
        queryFn: getModerationStats,
        enabled,
        staleTime: 30000, // 30 secondes
        refetchOnWindowFocus: true,
        refetchInterval: 60000, // Auto-refresh toutes les minutes
    });
};


export const useCreateReview = (): UseMutationResult<Review, Error, CreateReviewRequest, unknown> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createReview,
        onSuccess: (newReview, variables) => {
            // Invalider les queries liées à cette ressource
            queryClient.invalidateQueries({
                queryKey: ['reviews', variables.resourceType, variables.resourceId]
            });
            queryClient.invalidateQueries({
                queryKey: ['reviewStats', variables.resourceType, variables.resourceId]
            });
            queryClient.invalidateQueries({
                queryKey: ['userHasReviewed', variables.userId, variables.resourceType, variables.resourceId]
            });

            toast.success('Avis créé avec succès ! Il sera publié après modération.');
        },
        onError: (error) => {
            console.error('Erreur lors de la création de l\'avis:', error);
            toast.error(error.message || 'Erreur lors de la création de l\'avis');
        }
    });
};


export const useModerateReview = (): UseMutationResult<
    Review,
    Error,
    { reviewId: string; request: ModerationRequest },
    unknown
> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ reviewId, request }) => moderateReview(reviewId, request),
        onSuccess: (moderatedReview, { request }) => {
            // Invalider les queries de modération
            queryClient.invalidateQueries({ queryKey: ['pendingReviews'] });
            queryClient.invalidateQueries({ queryKey: ['moderationStats'] });

            // Invalider les stats de la ressource concernée
            queryClient.invalidateQueries({
                queryKey: ['reviewStats', moderatedReview.resourceType, moderatedReview.resourceId]
            });

            // Si approuvé, invalider aussi les avis publics
            if (request.status === 'APPROVED') {
                queryClient.invalidateQueries({
                    queryKey: ['reviews', moderatedReview.resourceType, moderatedReview.resourceId]
                });
            }

            const action = request.status === 'APPROVED' ? 'approuvé' : 'rejeté';
            toast.success(`Avis ${action} avec succès`);
        },
        onError: (error) => {
            console.error('Erreur lors de la modération:', error);
            toast.error(error.message || 'Erreur lors de la modération');
        }
    });
};


export const useResourceReviews = (
    resourceType: 'RESTAURANT' | 'DISH',
    resourceId: string,
    userId?: string
) => {
    const reviews = useReviews(resourceType, resourceId);
    const stats = useReviewStats(resourceType, resourceId);
    const hasReviewed = useUserHasReviewed(
        userId || '',
        resourceType,
        resourceId,
        !!userId
    );

    return {
        reviews: reviews.data,
        reviewsLoading: reviews.isLoading,
        reviewsError: reviews.error,
        stats: stats.data,
        statsLoading: stats.isLoading,
        statsError: stats.error,
        userHasReviewed: hasReviewed.data || false,
        userHasReviewedLoading: hasReviewed.isLoading,
        refetchReviews: reviews.refetch,
        refetchStats: stats.refetch,
        refetchUserStatus: hasReviewed.refetch,
    };
};


export const useModerationManager = (page: number = 0, size: number = 20) => {
    const pendingReviews = usePendingReviews(page, size);
    const stats = useModerationStats();
    const moderateReviewMutation = useModerateReview();

    const handleModerate = (reviewId: string, request: ModerationRequest) => {
        moderateReviewMutation.mutate({ reviewId, request });
    };

    // FIX: Add reviewId parameter to these functions
    const handleApprove = (reviewId: string, reason?: string) => {
        handleModerate(reviewId, {
            status: 'APPROVED',
            reason,
        });
    };

    const handleReject = (reviewId: string, reason: string) => {
        handleModerate(reviewId, {
            status: 'REJECTED',
            reason,
        });
    };

    return {
        pendingReviews: pendingReviews.data,
        pendingReviewsLoading: pendingReviews.isLoading,
        pendingReviewsError: pendingReviews.error,
        stats: stats.data,
        statsLoading: stats.isLoading,
        statsError: stats.error,
        moderating: moderateReviewMutation.isPending,
        moderationError: moderateReviewMutation.error,
        handleApprove,
        handleReject,
        refetchPending: pendingReviews.refetch,
        refetchStats: stats.refetch,
    };
};


export const useReviewCreation = (
    resourceType: 'RESTAURANT' | 'DISH',
    resourceId: string,
    userId: string
) => {
    const createReviewMutation = useCreateReview();

    const createReview = async (rating: number, comment?: string) => {
        return createReviewMutation.mutateAsync({
            userId,
            resourceType,
            resourceId,
            rating,
            comment,
        });
    };

    const resetState = () => {
        createReviewMutation.reset();
    };

    return {
        createReview,
        creating: createReviewMutation.isPending,
        createError: createReviewMutation.error,
        createSuccess: createReviewMutation.isSuccess,
        createdReview: createReviewMutation.data,
        resetState,
    };
};