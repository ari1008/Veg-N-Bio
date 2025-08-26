import type {CreateDishRequest, Dish, OrderDetail, OrderFilters, OrderListResponse} from "./dto/dto.ts";
import apiPrivate from "../api.private.ts";
import api from "../api.ts";

const orderPath = "/menu/order";
const menuPath = "/notprotected/menu";


// API Functions Orders (existantes)
export const getAllOrders = async (filters: OrderFilters = {}): Promise<OrderListResponse> => {
    const params = new URLSearchParams();

    // Ajouter les paramètres de filtrage
    if (filters.status) params.append('status', filters.status);
    if (filters.customerId) params.append('customerId', filters.customerId);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.page !== undefined) params.append('page', filters.page.toString());
    if (filters.size !== undefined) params.append('size', filters.size.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortDirection) params.append('sortDirection', filters.sortDirection);

    const response = await apiPrivate.get(`${orderPath}?${params}`);
    return response.data;
};

export const getOneOrder = async (id: string): Promise<OrderDetail> => {
    const response = await apiPrivate.get(`${orderPath}/${id}`);
    return response.data;
};

export const updateOrderStatus = async ({ orderId, status }: { orderId: string; status: string }): Promise<OrderDetail> => {
    const response = await apiPrivate.put(`${orderPath}/status/${orderId}`, { status });
    return response.data;
};

// API Functions Menu (nouvelles)
export const getAllDishes = async (): Promise<Dish[]> => {
    const response = await api.get(menuPath);
    return response.data;
};

export const getOneDish = async (id: string): Promise<Dish> => {
    const response = await api.get(`${menuPath}/${id}`);
    return response.data;
};

export const createDish = async (payload: CreateDishRequest) => {
    console.log("[createDish] payload envoyé =", payload);
    try {
        const { data } = await apiPrivate.post("/menu", payload);
        return data;
    } catch (err: any) {
        console.error(
            "[createDish] status =", err?.response?.status,
            "data =", err?.response?.data
        );
        throw err;
    }
};