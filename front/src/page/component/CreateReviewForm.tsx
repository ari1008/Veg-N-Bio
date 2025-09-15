import React, { useState } from 'react';
import { StarRating } from './StarRating';
import {useReviewCreation} from "../../api/review/hook.ts";

interface CreateReviewFormProps {
    resourceType: 'RESTAURANT' | 'DISH';
    resourceId: string;
    userId: string;
    resourceName?: string;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export const CreateReviewForm: React.FC<CreateReviewFormProps> = ({
                                                                      resourceType,
                                                                      resourceId,
                                                                      userId,
                                                                      resourceName,
                                                                      onSuccess,
                                                                      onCancel,
                                                                  }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    const { createReview, creating, createError, createSuccess } = useReviewCreation(
        resourceType,
        resourceId,
        userId
    );

    React.useEffect(() => {
        if (createSuccess && onSuccess) {
            onSuccess();
        }
    }, [createSuccess, onSuccess]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            return;
        }

        try {
            await createReview(rating, comment.trim() || undefined);
        } catch (error) {
            // Error is handled by the hook
        }
    };

    const isValid = rating > 0;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900">
                    Laissez votre avis
                </h3>
                {resourceName && (
                    <p className="mt-1 text-sm text-gray-600">
                        Pour: {resourceName}
                    </p>
                )}
            </div>

            {/* Rating */}
            <div className="text-center">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    Quelle note donnez-vous ?
                </label>
                <StarRating
                    rating={rating}
                    interactive
                    onRatingChange={setRating}
                    size="lg"
                    className="justify-center"
                />
                {rating > 0 && (
                    <p className="mt-2 text-sm text-gray-600">
                        {rating === 1 && 'Très décevant'}
                        {rating === 2 && 'Décevant'}
                        {rating === 3 && 'Correct'}
                        {rating === 4 && 'Très bien'}
                        {rating === 5 && 'Excellent'}
                    </p>
                )}
            </div>

            {/* Comment */}
            <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                    Commentaire (optionnel)
                </label>
                <textarea
                    id="comment"
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    maxLength={1000}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Partagez votre expérience..."
                />
                <p className="mt-1 text-xs text-gray-500">
                    {comment.length}/1000 caractères
                </p>
            </div>

            {/* Error */}
            {createError && (
                <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">
                                Erreur
                            </h3>
                            <div className="mt-2 text-sm text-red-700">
                                {createError.message}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={creating}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        Annuler
                    </button>
                )}
                <button
                    type="submit"
                    disabled={!isValid || creating}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {creating ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Envoi...
                        </>
                    ) : (
                        'Publier l\'avis'
                    )}
                </button>
            </div>
        </form>
    );
};