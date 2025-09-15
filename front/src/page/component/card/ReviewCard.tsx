import React from 'react';
import type {Review} from "../../../api/review/review.ts";
import {StarRating} from "../StarRating.tsx";

interface ReviewCardProps {
    review: Review;
    showResourceInfo?: boolean;
    onModerate?: (reviewId: string, action: 'approve' | 'reject', reason?: string) => void;
    isAdmin?: boolean;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
                                                          review,
                                                          showResourceInfo = false,
                                                          onModerate,
                                                          isAdmin = false,
                                                      }) => {
    const getStatusBadge = () => {
        const badges = {
            PENDING: 'bg-yellow-100 text-yellow-800',
            APPROVED: 'bg-green-100 text-green-800',
            REJECTED: 'bg-red-100 text-red-800',
        };

        const labels = {
            PENDING: 'En attente',
            APPROVED: 'Approuvé',
            REJECTED: 'Rejeté',
        };

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[review.status]}`}>
        {labels[review.status]}
      </span>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div>
                        <div className="font-medium text-gray-900">
                            Utilisateur {review.userId.substring(0, 8)}***
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                            <StarRating rating={review.rating} size="sm" />
                            <span className="text-sm text-gray-500">
                {formatDate(review.createdAt)}
              </span>
                        </div>
                    </div>
                </div>
                {getStatusBadge()}
            </div>

            {/* Comment */}
            {review.comment && (
                <div className="mb-4">
                    <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                </div>
            )}

            {/* Resource Info */}
            {showResourceInfo && (
                <div className="mb-4">
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
            {review.resourceType === 'RESTAURANT' ? 'Restaurant' : 'Plat'} • {review.resourceId}
          </span>
                </div>
            )}

            {/* Moderation Info */}
            {review.status === 'REJECTED' && review.moderationReason && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-700">
                        <strong>Raison du rejet:</strong> {review.moderationReason}
                    </p>
                </div>
            )}

            {/* Admin Actions */}
            {isAdmin && review.status === 'PENDING' && onModerate && (
                <div className="flex items-center space-x-2 pt-4 border-t border-gray-200">
                    <button
                        onClick={() => onModerate(review.id, 'approve')}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                        Approuver
                    </button>
                    <button
                        onClick={() => onModerate(review.id, 'reject', 'Contenu inapproprié')}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        Rejeter
                    </button>
                </div>
            )}
        </div>
    );
};