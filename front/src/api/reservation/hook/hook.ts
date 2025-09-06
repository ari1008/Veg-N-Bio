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

export const useCreateReservation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateReservationRequest) => createReservation(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["reservations"] });
        },
        onError: (error) => {
            console.error('Erreur lors de la création de la réservation:', error);
        }
    });
};

export const useRestaurantReservations = (restaurantId: string): UseQueryResult<Reservation[], Error> =>
    useQuery({
        queryKey: ["reservations", "restaurant", restaurantId],
        queryFn: () => getRestaurantReservations(restaurantId),
        enabled: !!restaurantId,
        staleTime: 30000,
        refetchInterval: 60000,
    });

export const useMyReservations = (): UseQueryResult<Reservation[], Error> =>
    useQuery({
        queryKey: ["reservations", "my"],
        queryFn: getAllMyReservations,
        staleTime: 30000,
        refetchOnWindowFocus: true,
    });


export const useCustomerReservations = (customerId: string): UseQueryResult<Reservation[], Error> =>
    useQuery({
        queryKey: ["reservations", "customer", customerId],
        queryFn: () => getCustomerReservations(customerId),
        enabled: !!customerId,
        staleTime: 30000,
    });


export const useRestaurantAvailability = (restaurantId: string): UseQueryResult<RestaurantAvailability, Error> =>
    useQuery({
        queryKey: ["availability", "restaurant", restaurantId],
        queryFn: () => getRestaurantAvailability(restaurantId),
        enabled: !!restaurantId,
        staleTime: 60000,
        refetchInterval: 120000,
    });


export const useUpdateReservationStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ reservationId, payload }: { reservationId: string; payload: UpdateReservationStatusRequest }) =>
            updateReservationStatus(reservationId, payload),
        onSuccess: (updatedReservation) => {

            queryClient.invalidateQueries({ queryKey: ["reservations"] });
            queryClient.invalidateQueries({ queryKey: ["availability"] });

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

export const useCancelReservation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (reservationId: string) => cancelReservation(reservationId),
        onSuccess: (cancelledReservation) => {
            queryClient.invalidateQueries({ queryKey: ["reservations"] });
            queryClient.invalidateQueries({ queryKey: ["availability"] });

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

export const useReservationById = (reservationId: string): UseQueryResult<Reservation, Error> =>
    useQuery({
        queryKey: ["reservation", reservationId],
        queryFn: () => {
            throw new Error("getReservationById not implemented");
        },
        enabled: !!reservationId,
    });

const arrayDateToYMD = (dateArray: number[] | string | Date): string | null => {
    if (!dateArray) return null;

    // Si c'est déjà une chaîne, l'utiliser directement
    if (typeof dateArray === 'string') {
        return dateArray;
    }

    // Si c'est un objet Date
    if (dateArray instanceof Date) {
        try {
            return isNaN(dateArray.getTime()) ? null : dateArray.toISOString().split('T')[0];
        } catch {
            return null;
        }
    }

    // Si c'est un tableau [année, mois, jour, heure, minute]
    if (Array.isArray(dateArray) && dateArray.length >= 3) {
        try {
            const [year, month, day] = dateArray;
            // Formater en YYYY-MM-DD
            const formattedMonth = month.toString().padStart(2, '0');
            const formattedDay = day.toString().padStart(2, '0');
            return `${year}-${formattedMonth}-${formattedDay}`;
        } catch {
            return null;
        }
    }

    return null;
};

// Fonction utilitaire pour convertir une date en format YYYY-MM-DD de manière sécurisée
const safeDateToYMD = (dateValue: number[] | string | Date): string | null => {
    return arrayDateToYMD(dateValue);
};

export const useReservationManager = (filters: {
    status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
    startDate?: string;
    endDate?: string;
    type?: 'RESTAURANT_FULL' | 'MEETING_ROOM';
} = {}) => {
    const { data: myReservations, isLoading } = useMyReservations();

    const filteredReservations = myReservations?.filter(reservation => {
        if (filters.status && reservation.status !== filters.status) return false;

        if (filters.startDate) {
            const reservationDate = safeDateToYMD(reservation.startTime);
            if (!reservationDate || reservationDate < filters.startDate) return false;
        }

        if (filters.endDate) {
            const reservationDate = safeDateToYMD(reservation.startTime);
            if (!reservationDate || reservationDate > filters.endDate) return false;
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