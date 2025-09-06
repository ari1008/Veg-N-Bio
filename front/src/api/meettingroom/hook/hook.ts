// front/src/api/meetingroom/hook/hook.ts
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import type { MeetingRoom } from "../dto/dto";
import {
    getAllMeetingRooms,
    getMeetingRoomById,
    getMeetingRoomsByRestaurant,
    searchMeetingRooms,
    getAvailableMeetingRooms
} from "../meetingroom";

export interface MeetingRoomSearchParams {
    restaurantId?: string;
    minCapacity?: number;
    maxCapacity?: number;
    reservableOnly?: boolean;
}

export interface AvailabilityParams {
    restaurantId?: string;
    startTime: string;
    endTime: string;
}

/**
 * Hook pour récupérer toutes les salles de réunion
 */
export const useAllMeetingRooms = (): UseQueryResult<MeetingRoom[], Error> =>
    useQuery({
        queryKey: ["meetingRooms", "all"],
        queryFn: getAllMeetingRooms,
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
    });

/**
 * Hook pour récupérer une salle de réunion spécifique
 */
export const useMeetingRoomById = (id: string): UseQueryResult<MeetingRoom, Error> =>
    useQuery({
        queryKey: ["meetingRooms", id],
        queryFn: () => getMeetingRoomById(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

/**
 * Hook pour récupérer les salles de réunion d'un restaurant
 */
export const useMeetingRoomsByRestaurant = (restaurantId: string): UseQueryResult<MeetingRoom[], Error> =>
    useQuery({
        queryKey: ["meetingRooms", "restaurant", restaurantId],
        queryFn: () => getMeetingRoomsByRestaurant(restaurantId),
        enabled: !!restaurantId,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

/**
 * Hook pour rechercher des salles de réunion selon des critères
 */
export const useSearchMeetingRooms = (params: MeetingRoomSearchParams = {}) =>
    useQuery({
        queryKey: ["meetingRooms", "search", params],
        queryFn: () => searchMeetingRooms(params),
        staleTime: 2 * 60 * 1000, // 2 minutes
        enabled: !!(params.restaurantId || params.minCapacity || params.maxCapacity), // Seulement si il y a des critères
        refetchOnWindowFocus: false,
    });

/**
 * Hook pour récupérer les salles de réunion disponibles pour une période
 */
export const useAvailableMeetingRooms = (params: AvailabilityParams) =>
    useQuery({
        queryKey: ["meetingRooms", "available", params],
        queryFn: () => getAvailableMeetingRooms(params),
        enabled: !!(params.startTime && params.endTime && params.restaurantId),
        staleTime: 1 * 60 * 1000, // 1 minute (données plus volatiles)
        refetchOnWindowFocus: false,
    });

/**
 * Hook personnalisé pour la recherche de salles avec debounce
 */
export const useMeetingRoomSearch = (initialParams: MeetingRoomSearchParams = {}) => {
    const [searchParams, setSearchParams] = useState(initialParams);
    const [debouncedParams, setDebouncedParams] = useState(initialParams);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedParams(searchParams);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchParams]);

    const { data: searchResults, isLoading: searchLoading } = useSearchMeetingRooms(debouncedParams);
    const { data: allRooms, isLoading: allRoomsLoading } = useAllMeetingRooms();

    const hasSearchCriteria = !!(debouncedParams.restaurantId || debouncedParams.minCapacity || debouncedParams.maxCapacity);
    const meetingRooms = hasSearchCriteria ? searchResults : allRooms;
    const isLoading = hasSearchCriteria ? searchLoading : allRoomsLoading;

    return {
        meetingRooms: meetingRooms || [],
        isLoading,
        searchParams,
        setSearchParams,
        hasSearchCriteria,
    };
};