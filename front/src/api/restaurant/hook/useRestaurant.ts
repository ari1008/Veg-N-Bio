import type {UseMutationResult} from "@tanstack/react-query";
import type {Restaurant} from "../dto/restaurant.ts";
import {useMutation, useQuery} from "@tanstack/react-query";
import {getAllRestaurant, getOneRestaurant, postCreateRestaurant} from "../restaurant.ts";


export const useCreateRestaurant = (): UseMutationResult<Map<string, any>, unknown, Restaurant> =>
    useMutation({
        mutationFn: (data: Restaurant) => postCreateRestaurant(data)
    })

export const useGetAllRestaurant = (): UseMutationResult<Restaurant[], unknown, void> =>
    useMutation({
        mutationFn: () => getAllRestaurant()
    })

export const useRestaurantById = (id: string) =>
    useQuery<Restaurant>({
        queryKey: ["restaurant", id],
        queryFn: () => getOneRestaurant(id),
        enabled: !!id,
    });