import React, { useState } from 'react';
import {useReviews} from "../../api/review/hook.ts";
import {ReviewCard} from "./card/ReviewCard.tsx";

interface ReviewsListProps {
    resourceType: 'RESTAURANT' | 'DISH';
    resourceId: string;
    showPagination?: boolean;
    pageSize?: number;
}

export const ReviewsList: React.FC<ReviewsListProps> = ({
                                                            resourceType,
                                                            resourceId,
                                                            showPagination = true,
                                                            pageSize = 10,
                                                        }) => {
    const [currentPage, setCurrentPage] = useState(0);

    const { data: reviewsData, isLoading, error } = useReviews(
        resourceType,
        resourceId,
        currentPage,
        pageSize
    );

    if (isLoading) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                        <div className="bg-gray-200 rounded-lg h-32"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <div className="text-red-600 mb-2">Erreur lors du chargement des avis</div>
                <p className="text-gray-500 text-sm">{error.message}</p>
            </div>
        );
    }

    if (!reviewsData || reviewsData.content.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="text-gray-500">Aucun avis pour le moment</div>
                <p className="text-gray-400 text-sm mt-1">Soyez le premier à laisser un avis !</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Reviews */}
            {reviewsData.content.map((review) => (
                <ReviewCard key={review.id} review={review} />
            ))}

            {/* Pagination */}
            {showPagination && reviewsData.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                    <div className="flex flex-1 justify-between sm:hidden">
                        <button
                            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                            disabled={reviewsData.first}
                            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Précédent
                        </button>
                        <button
                            onClick={() => setCurrentPage(Math.min(reviewsData.totalPages - 1, currentPage + 1))}
                            disabled={reviewsData.last}
                            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Suivant
                        </button>
                    </div>
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Affichage de <span className="font-medium">{currentPage * pageSize + 1}</span> à{' '}
                                <span className="font-medium">
                  {Math.min((currentPage + 1) * pageSize, reviewsData.totalElements)}
                </span>{' '}
                                sur <span className="font-medium">{reviewsData.totalElements}</span> avis
                            </p>
                        </div>
                        <div>
                            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                <button
                                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                                    disabled={reviewsData.first}
                                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                >
                                    <span className="sr-only">Précédent</span>
                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                                    </svg>
                                </button>

                                {Array.from({ length: Math.min(5, reviewsData.totalPages) }, (_, i) => {
                                    const pageNum = i + Math.max(0, currentPage - 2);
                                    if (pageNum >= reviewsData.totalPages) return null;

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                                pageNum === currentPage
                                                    ? 'z-10 bg-blue-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                                                    : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                                            }`}
                                        >
                                            {pageNum + 1}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={() => setCurrentPage(Math.min(reviewsData.totalPages - 1, currentPage + 1))}
                                    disabled={reviewsData.last}
                                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                >
                                    <span className="sr-only">Suivant</span>
                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
