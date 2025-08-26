import type {CreateDishRequest, OrderDetail, OrderFilters, OrderListResponse} from "../dto/dto.ts";
import type {UseMutationResult, UseQueryResult} from "@tanstack/react-query";
import {useMutation, useQuery} from "@tanstack/react-query";
import {createDish, getAllDishes, getAllOrders, getOneDish, getOneOrder, updateOrderStatus} from "../menu.ts";

export const useGetAllOrders = (filters: OrderFilters = {}): UseQueryResult<OrderListResponse, Error> =>
    useQuery({
        queryKey: ["orders", filters],
        queryFn: () => getAllOrders(filters),
        staleTime: 30000, // 30 secondes
        refetchInterval: 60000, // Refresh toutes les minutes
    });

export const useOrderById = (id: string): UseQueryResult<OrderDetail, Error> =>
    useQuery({
        queryKey: ["order", id],
        queryFn: () => getOneOrder(id),
        enabled: !!id,
    });

export const useUpdateOrderStatus = () =>
    useMutation({
        mutationFn: ({ orderId, status }: { orderId: string; status: string }) => updateOrderStatus({ orderId, status }),
    });

export const useGetAllDishes = () =>
    useQuery({
        queryKey: ["dishes"],
        queryFn: getAllDishes,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

export const useDishById = (id: string) =>
    useQuery({
        queryKey: ["dish", id],
        queryFn: () => getOneDish(id),
        enabled: !!id,
    });

export const useCreateDish = () =>
    useMutation({
        mutationFn: (dish: CreateDishRequest) => createDish(dish),
    });