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

// Hook pour créer une demande d'événement
export const useCreateEventRequest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateEventRequestRequest) => createEventRequest(data),
        onSuccess: () => {
            // Invalider les caches des listes d'événements
            queryClient.invalidateQueries({ queryKey: ['eventRequests'] });
        },
        onError: (error) => {
            console.error('Erreur lors de la création de la demande d\'événement:', error);
        }
    });
};

// Hook pour récupérer toutes mes demandes d'événements
export const useAllMyEventRequests = (): UseQueryResult<EventRequest[], Error> => {
    return useQuery({
        queryKey: ['eventRequests', 'all'],
        queryFn: getAllMyEventRequests,
        staleTime: 30000, // 30 secondes
        refetchOnWindowFocus: false,
    });
};

// Hook pour récupérer les demandes d'événements d'un restaurant
export const useRestaurantEventRequests = (restaurantId: string): UseQueryResult<EventRequest[], Error> => {
    return useQuery({
        queryKey: ['eventRequests', 'restaurant', restaurantId],
        queryFn: () => getRestaurantEventRequests(restaurantId),
        enabled: !!restaurantId,
        staleTime: 30000,
        refetchOnWindowFocus: false,
    });
};

// Hook pour récupérer les demandes d'événements d'un client
export const useCustomerEventRequests = (customerId: string): UseQueryResult<EventRequest[], Error> => {
    return useQuery({
        queryKey: ['eventRequests', 'customer', customerId],
        queryFn: () => getCustomerEventRequests(customerId),
        enabled: !!customerId,
        staleTime: 30000,
        refetchOnWindowFocus: false,
    });
};

// Hook pour mettre à jour le statut d'une demande d'événement
export const useUpdateEventRequestStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ eventRequestId, payload }: { eventRequestId: string; payload: UpdateEventRequestStatusRequest }) =>
            updateEventRequestStatus(eventRequestId, payload),
        onSuccess: (updatedEventRequest) => {
            // Invalider tous les caches d'événements
            queryClient.invalidateQueries({ queryKey: ['eventRequests'] });

            // Mettre à jour le cache spécifique si on l'a
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

// Hook pour annuler une demande d'événement
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

// Hook manager avec filtres (similaire à useReservationManager)
interface EventRequestFilters {
    status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
    type?: 'ANNIVERSAIRE_ENFANT' | 'CONFERENCE' | 'SEMINAIRE' | 'REUNION_ENTREPRISE' | 'AUTRE';
    startDate?: string;
    endDate?: string;
    restaurantId?: string;
}

export const useEventRequestManager = (filters: EventRequestFilters = {}) => {
    const { data: allEventRequests, isLoading } = useAllMyEventRequests();

    // Filtrer les demandes d'événements côté client
    const filteredEventRequests = useMemo(() => {
        if (!allEventRequests) return [];

        return allEventRequests.filter(eventRequest => {
            // Filtre par statut
            if (filters.status && eventRequest.status !== filters.status) {
                return false;
            }

            // Filtre par type
            if (filters.type && eventRequest.type !== filters.type) {
                return false;
            }

            // Filtre par restaurant
            if (filters.restaurantId && eventRequest.restaurantId !== filters.restaurantId) {
                return false;
            }

            // Filtre par date de début
            if (filters.startDate) {
                const eventDate = new Date(eventRequest.startTime);
                const filterStartDate = new Date(filters.startDate);
                if (eventDate < filterStartDate) {
                    return false;
                }
            }

            // Filtre par date de fin
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

// Hook pour récupérer une demande d'événement par ID
export const useEventRequestById = (eventRequestId: string): UseQueryResult<EventRequest, Error> => {
    return useQuery({
        queryKey: ['eventRequest', eventRequestId],
        queryFn: () => {
            // Cette fonction n'est pas encore implémentée côté backend
            throw new Error("getEventRequestById not implemented");
        },
        enabled: !!eventRequestId,
    });
};