import React, { useMemo, useState } from 'react';
import {useReviews} from "../../api/review/hook.ts";
import {ReviewCard} from "./card/ReviewCard.tsx";
import { ReviewStats } from './ReviewStats.tsx';

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
    const [currentPageSize, setCurrentPageSize] = useState(pageSize);
    const [minRating, setMinRating] = useState<number | null>(null);

    const { data: reviewsData, isLoading, error, refetch } = useReviews(
        resourceType,
        resourceId,
        currentPage,
        currentPageSize
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
            <div className="text-center py-8 space-y-4">
                <div className="text-red-600">Erreur lors du chargement des avis</div>
                <p className="text-gray-500 text-sm">{error.message}</p>
                <button
                    onClick={() => refetch()}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                    Réessayer
                </button>
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

    const filteredContent = useMemo(() => {
        if (!minRating) return reviewsData.content;
        return reviewsData.content.filter(r => r.rating >= minRating);
    }, [reviewsData, minRating]);

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <ReviewStats resourceType={resourceType} resourceId={resourceId} />

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <label htmlFor="minRating" className="text-sm text-gray-600">Filtrer</label>
                        <select
                            id="minRating"
                            className="border-gray-300 rounded-md text-sm"
                            value={minRating ?? ''}
                            onChange={(e) => {
                                const val = e.target.value;
                                setMinRating(val ? Number(val) : null);
                                setCurrentPage(0);
                            }}
                        >
                            <option value="">Toutes notes</option>
                            <option value="5">5 étoiles et plus</option>
                            <option value="4">4 étoiles et plus</option>
                            <option value="3">3 étoiles et plus</option>
                            <option value="2">2 étoiles et plus</option>
                            <option value="1">1 étoile et plus</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <label htmlFor="pageSize" className="text-sm text-gray-600">Par page</label>
                        <select
                            id="pageSize"
                            className="border-gray-300 rounded-md text-sm"
                            value={currentPageSize}
                            onChange={(e) => {
                                const next = Number(e.target.value);
                                setCurrentPageSize(next);
                                setCurrentPage(0);
                            }}
                        >
                            {[5, 10, 20, 50].map(size => (
                                <option key={size} value={size}>{size}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
            {/* Reviews */}
            {filteredContent.map((review) => (
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
                                Affichage de <span className="font-medium">{currentPage * currentPageSize + 1}</span> à{' '}
                                <span className="font-medium">
                  {Math.min((currentPage + 1) * currentPageSize, reviewsData.totalElements)}
                </span>{' '}
                                sur <span className="font-medium">{reviewsData.totalElements}</span> avis
                                {minRating ? (
                                    <span className="text-gray-500"> — {filteredContent.length} visibles après filtre</span>
                                ) : null}
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
