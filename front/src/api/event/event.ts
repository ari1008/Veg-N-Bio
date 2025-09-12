
import type { EventRequest, CreateEventRequestRequest, UpdateEventRequestStatusRequest } from './dto/dto';
import apiPrivate from "../api.private.ts";

const EVENT_REQUEST_BASE_URL = '/event-requests';


export const createEventRequest = async (data: CreateEventRequestRequest): Promise<EventRequest> => {
    const response = await apiPrivate.post<EventRequest>(EVENT_REQUEST_BASE_URL, data);
    return response.data;
};

export const getRestaurantEventRequests = async (restaurantId: string): Promise<EventRequest[]> => {
    const response = await apiPrivate.get<EventRequest[]>(`${EVENT_REQUEST_BASE_URL}/restaurant/${restaurantId}`);
    return response.data;
};

export const getAllMyEventRequests = async (): Promise<EventRequest[]> => {
    const response = await apiPrivate.get<EventRequest[]>(`${EVENT_REQUEST_BASE_URL}/all`);
    return response.data;
};

export const getCustomerEventRequests = async (customerId: string): Promise<EventRequest[]> => {
    const response = await apiPrivate.get<EventRequest[]>(`${EVENT_REQUEST_BASE_URL}/customer/${customerId}`);
    return response.data;
};

export const updateEventRequestStatus = async (
    id: string,
    data: UpdateEventRequestStatusRequest
): Promise<EventRequest> => {
    const response = await apiPrivate.put<EventRequest>(`${EVENT_REQUEST_BASE_URL}/${id}/status`, data);
    return response.data;
};

export const cancelEventRequest = async (id: string): Promise<EventRequest> => {
    const response = await apiPrivate.delete<EventRequest>(`${EVENT_REQUEST_BASE_URL}/${id}`);
    return response.data;
};
