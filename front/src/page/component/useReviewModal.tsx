import { useState } from 'react';

export const useReviewModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [reviewData, setReviewData] = useState<{
        resourceType: 'RESTAURANT' | 'DISH';
        resourceId: string;
        resourceName?: string;
    } | null>(null);

    const openReviewModal = (
        resourceType: 'RESTAURANT' | 'DISH',
        resourceId: string,
        resourceName?: string
    ) => {
        setReviewData({ resourceType, resourceId, resourceName });
        setIsOpen(true);
    };

    const closeReviewModal = () => {
        setIsOpen(false);
        setReviewData(null);
    };

    return {
        isOpen,
        reviewData,
        openReviewModal,
        closeReviewModal,
    };
};