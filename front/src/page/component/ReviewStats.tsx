import React from 'react';
import { StarRating } from './StarRating';
import {useReviewStats} from "../../api/review/hook.ts";

interface ReviewStatsProps {
    resourceType: 'RESTAURANT' | 'DISH';
    resourceId: string;
    className?: string;
}

export const ReviewStats: React.FC<ReviewStatsProps> = ({
                                                            resourceType,
                                                            resourceId,
                                                            className = '',
                                                        }) => {
    const { data: stats, isLoading, error } = useReviewStats(resourceType, resourceId);

    if (isLoading) {
        return (
            <div className={`animate-pulse ${className}`}>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
        );
    }

    if (error || !stats) {
        return null;
    }

    if (stats.totalReviews === 0) {
        return (
            <div className={`flex items-center text-gray-500 text-sm ${className}`}>
                <StarRating rating={0} size="sm" />
                <span className="ml-2">Aucun avis</span>
            </div>
        );
    }

    return (
        <div className={`flex items-center space-x-2 ${className}`}>
            <StarRating rating={Math.round(stats.averageRating)} size="sm" />
            <span className="font-medium text-gray-900">
        {stats.averageRating.toFixed(1)}
      </span>
            <span className="text-gray-500 text-sm">
        ({stats.totalReviews} avis)
      </span>
        </div>
    );
};