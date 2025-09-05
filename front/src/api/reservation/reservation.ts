import apiPrivate from "../api.private.ts";
import type {
    CreateReservationRequest,
    Reservation,
    RestaurantAvailability,
    UpdateReservationStatusRequest
} from "./dto/dto.ts";


const reservationPath = "/reservations";

export const createReservation = async (payload: CreateReservationRequest): Promise<Reservation> => {
    try {
        const response = await apiPrivate.post(reservationPath, payload);
        return response.data;
    } catch (err: any) {
        console.error(
            "[createReservation] status =", err?.response?.status,
            "data =", err?.response?.data
        );
        throw err;
    }
};

export const getRestaurantReservations = async (restaurantId: string): Promise<Reservation[]> => {
    try {
        const response = await apiPrivate.get(`${reservationPath}/restaurant/${restaurantId}`);
        return response.data;
    } catch (err: any) {
        console.error(
            "[getRestaurantReservations] status =", err?.response?.status,
            "data =", err?.response?.data
        );
        throw err;
    }
};

export const getAllMyReservations = async (): Promise<Reservation[]> => {
    try {
        const response = await apiPrivate.get(`${reservationPath}/all`);
        return response.data;
    } catch (err: any) {
        console.error(
            "[getAllMyReservations] status =", err?.response?.status,
            "data =", err?.response?.data
        );
        throw err;
    }
};

export const getCustomerReservations = async (customerId: string): Promise<Reservation[]> => {
    try {
        const response = await apiPrivate.get(`${reservationPath}/customer/${customerId}`);
        return response.data;
    } catch (err: any) {
        console.error(
            "[getCustomerReservations] status =", err?.response?.status,
            "data =", err?.response?.data
        );
        throw err;
    }
};

export const getRestaurantAvailability = async (restaurantId: string): Promise<RestaurantAvailability> => {
    try {
        const response = await apiPrivate.get(`${reservationPath}/availability/${restaurantId}`);
        return response.data;
    } catch (err: any) {
        console.error(
            "[getRestaurantAvailability] status =", err?.response?.status,
            "data =", err?.response?.data
        );
        throw err;
    }
};

export const updateReservationStatus = async (
    reservationId: string,
    payload: UpdateReservationStatusRequest
): Promise<Reservation> => {
    try {
        const response = await apiPrivate.put(`${reservationPath}/${reservationId}/status`, payload);
        return response.data;
    } catch (err: any) {
        console.error(
            "[updateReservationStatus] status =", err?.response?.status,
            "data =", err?.response?.data
        );
        throw err;
    }
};

export const cancelReservation = async (reservationId: string): Promise<Reservation> => {
    try {
        const response = await apiPrivate.delete(`${reservationPath}/${reservationId}`);
        return response.data;
    } catch (err: any) {
        console.error(
            "[cancelReservation] status =", err?.response?.status,
            "data =", err?.response?.data
        );
        throw err;
    }
};

