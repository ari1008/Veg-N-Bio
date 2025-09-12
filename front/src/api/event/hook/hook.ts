import { useQuery, useMutation, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import {  useMemo } from 'react';
import type { EventRequest, CreateEventRequestRequest, UpdateEventRequestStatusRequest } from '../dto/dto';
import {
    cancelEventRequest,
    createEventRequest,
    getAllMyEventRequests,
    getCustomerEventRequests,
    getRestaurantEventRequests, updateEventRequestStatus
} from "../event.ts";

export const useCreateEventRequest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateEventRequestRequest) => createEventRequest(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['eventRequests'] });
        },
        onError: (error) => {
            console.error('Erreur lors de la création de la demande d\'événement:', error);
        }
    });
};

export const useAllMyEventRequests = (): UseQueryResult<EventRequest[], Error> => {
    return useQuery({
        queryKey: ['eventRequests', 'all'],
        queryFn: getAllMyEventRequests,
        staleTime: 30000, // 30 secondes
        refetchOnWindowFocus: false,
    });
};

export const useRestaurantEventRequests = (restaurantId: string): UseQueryResult<EventRequest[], Error> => {
    return useQuery({
        queryKey: ['eventRequests', 'restaurant', restaurantId],
        queryFn: () => getRestaurantEventRequests(restaurantId),
        enabled: !!restaurantId,
        staleTime: 30000,
        refetchOnWindowFocus: false,
    });
};

export const useCustomerEventRequests = (customerId: string): UseQueryResult<EventRequest[], Error> => {
    return useQuery({
        queryKey: ['eventRequests', 'customer', customerId],
        queryFn: () => getCustomerEventRequests(customerId),
        enabled: !!customerId,
        staleTime: 30000,
        refetchOnWindowFocus: false,
    });
};

export const useUpdateEventRequestStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ eventRequestId, payload }: { eventRequestId: string; payload: UpdateEventRequestStatusRequest }) =>
            updateEventRequestStatus(eventRequestId, payload),
        onSuccess: (updatedEventRequest) => {
            queryClient.invalidateQueries({ queryKey: ['eventRequests'] });

            queryClient.setQueryData(
                ['eventRequest', updatedEventRequest.id],
                updatedEventRequest
            );
        },
        onError: (error) => {
            console.error('Erreur lors de la mise à jour du statut:', error);
        }
    });
};

export const useCancelEventRequest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (eventRequestId: string) => cancelEventRequest(eventRequestId),
        onSuccess: (cancelledEventRequest) => {
            queryClient.invalidateQueries({ queryKey: ['eventRequests'] });

            queryClient.setQueryData(
                ['eventRequest', cancelledEventRequest.id],
                cancelledEventRequest
            );
        },
        onError: (error) => {
            console.error('Erreur lors de l\'annulation de la demande d\'événement:', error);
        }
    });
};

interface EventRequestFilters {
    status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
    type?: 'ANNIVERSAIRE_ENFANT' | 'CONFERENCE' | 'SEMINAIRE' | 'REUNION_ENTREPRISE' | 'AUTRE';
    startDate?: string;
    endDate?: string;
    restaurantId?: string;
}

export const useEventRequestManager = (filters: EventRequestFilters = {}) => {
    const { data: allEventRequests, isLoading } = useAllMyEventRequests();

    const filteredEventRequests = useMemo(() => {
        if (!allEventRequests) return [];

        return allEventRequests.filter(eventRequest => {
            if (filters.status && eventRequest.status !== filters.status) {
                return false;
            }

            if (filters.type && eventRequest.type !== filters.type) {
                return false;
            }

            if (filters.restaurantId && eventRequest.restaurantId !== filters.restaurantId) {
                return false;
            }

            if (filters.startDate) {
                const eventDate = new Date(eventRequest.startTime);
                const filterStartDate = new Date(filters.startDate);
                if (eventDate < filterStartDate) {
                    return false;
                }
            }

            if (filters.endDate) {
                const eventDate = new Date(eventRequest.startTime);
                const filterEndDate = new Date(filters.endDate);
                if (eventDate > filterEndDate) {
                    return false;
                }
            }

            return true;
        });
    }, [allEventRequests, filters]);

    return {
        eventRequests: filteredEventRequests,
        isLoading,
        totalCount: filteredEventRequests.length
    };
};
