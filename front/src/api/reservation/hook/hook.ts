import type {  UseQueryResult } from "@tanstack/react-query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
    CreateReservationRequest,
    Reservation,
    RestaurantAvailability,
    UpdateReservationStatusRequest
} from "../dto/dto.ts";
import {
    createReservation,
    getRestaurantReservations,
    getAllMyReservations,
    getCustomerReservations,
    getRestaurantAvailability,
    updateReservationStatus,
    cancelReservation
} from "../reservation.ts";

// Hook pour créer une réservation
export const useCreateReservation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateReservationRequest) => createReservation(data),
        onSuccess: () => {
            // Invalider les queries liées aux réservations après création
            queryClient.invalidateQueries({ queryKey: ["reservations"] });
        },
        onError: (error) => {
            console.error('Erreur lors de la création de la réservation:', error);
        }
    });
};

// Hook pour obtenir toutes les réservations d'un restaurant
export const useRestaurantReservations = (restaurantId: string): UseQueryResult<Reservation[], Error> =>
    useQuery({
        queryKey: ["reservations", "restaurant", restaurantId],
        queryFn: () => getRestaurantReservations(restaurantId),
        enabled: !!restaurantId,
        staleTime: 30000, // 30 secondes
        refetchInterval: 60000, // Refresh toutes les minutes
    });

// Hook pour obtenir toutes mes réservations
export const useMyReservations = (): UseQueryResult<Reservation[], Error> =>
    useQuery({
        queryKey: ["reservations", "my"],
        queryFn: getAllMyReservations,
        staleTime: 30000, // 30 secondes
        refetchOnWindowFocus: true,
    });

// Hook pour obtenir les réservations d'un client
export const useCustomerReservations = (customerId: string): UseQueryResult<Reservation[], Error> =>
    useQuery({
        queryKey: ["reservations", "customer", customerId],
        queryFn: () => getCustomerReservations(customerId),
        enabled: !!customerId,
        staleTime: 30000, // 30 secondes
    });

// Hook pour obtenir la disponibilité d'un restaurant
export const useRestaurantAvailability = (restaurantId: string): UseQueryResult<RestaurantAvailability, Error> =>
    useQuery({
        queryKey: ["availability", "restaurant", restaurantId],
        queryFn: () => getRestaurantAvailability(restaurantId),
        enabled: !!restaurantId,
        staleTime: 60000, // 1 minute
        refetchInterval: 120000, // Refresh toutes les 2 minutes
    });

// Hook pour mettre à jour le statut d'une réservation
export const useUpdateReservationStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ reservationId, payload }: { reservationId: string; payload: UpdateReservationStatusRequest }) =>
            updateReservationStatus(reservationId, payload),
        onSuccess: (updatedReservation) => {
            // Invalider et mettre à jour les caches
            queryClient.invalidateQueries({ queryKey: ["reservations"] });
            queryClient.invalidateQueries({ queryKey: ["availability"] });

            // Optionnel : mettre à jour directement le cache avec la nouvelle réservation
            queryClient.setQueryData(
                ["reservation", updatedReservation.id],
                updatedReservation
            );
        },
        onError: (error) => {
            console.error('Erreur lors de la mise à jour du statut:', error);
        }
    });
};

// Hook pour annuler une réservation
export const useCancelReservation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (reservationId: string) => cancelReservation(reservationId),
        onSuccess: (cancelledReservation) => {
            // Invalider les queries liées aux réservations
            queryClient.invalidateQueries({ queryKey: ["reservations"] });
            queryClient.invalidateQueries({ queryKey: ["availability"] });

            // Optionnel : mettre à jour directement le cache
            queryClient.setQueryData(
                ["reservation", cancelledReservation.id],
                cancelledReservation
            );
        },
        onError: (error) => {
            console.error('Erreur lors de l\'annulation de la réservation:', error);
        }
    });
};

// Hook pour obtenir une réservation spécifique (si vous avez besoin)
export const useReservationById = (reservationId: string): UseQueryResult<Reservation, Error> =>
    useQuery({
        queryKey: ["reservation", reservationId],
        queryFn: () => {
            // Vous pourriez avoir besoin d'ajouter cette fonction à votre API
            // Pour l'instant, on peut utiliser une des fonctions existantes
            throw new Error("getReservationById not implemented");
        },
        enabled: !!reservationId,
    });

// Hook personnalisé pour la gestion des réservations avec recherche/filtrage
export const useReservationManager = (filters: {
    status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
    startDate?: string;
    endDate?: string;
    type?: 'RESTAURANT_FULL' | 'MEETING_ROOM';
} = {}) => {
    const { data: myReservations, isLoading } = useMyReservations();

    // Filtrer les réservations si nécessaire
    const filteredReservations = myReservations?.filter(reservation => {
        if (filters.status && reservation.status !== filters.status) return false;

        if (filters.startDate) {
            const reservationDate = new Date(reservation.startTime).toISOString().split('T')[0];
            if (reservationDate < filters.startDate) return false;
        }

        if (filters.endDate) {
            const reservationDate = new Date(reservation.startTime).toISOString().split('T')[0];
            if (reservationDate > filters.endDate) return false;
        }

        if (filters.type && reservation.type !== filters.type) return false;

        return true;
    }) || [];

    return {
        reservations: filteredReservations,
        allReservations: myReservations || [],
        isLoading,
        totalCount: myReservations?.length || 0,
        filteredCount: filteredReservations.length,
    };
};