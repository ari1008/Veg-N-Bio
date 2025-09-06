import api from "../api";
import type { MeetingRoom } from "./dto/dto";
import type { MeetingRoomSearchParams, AvailabilityParams } from "./hook/hook";

const meetingRoomPath = "/notprotected/meeting-rooms";


export const getAllMeetingRooms = async (): Promise<MeetingRoom[]> => {
    try {
        const response = await api.get(meetingRoomPath);
        return response.data;
    } catch (err: any) {
        console.error(
            "[getAllMeetingRooms] status =", err?.response?.status,
            "data =", err?.response?.data
        );
        throw err;
    }
};

export const getMeetingRoomById = async (id: string): Promise<MeetingRoom> => {
    try {
        const response = await api.get(`${meetingRoomPath}/${id}`);
        return response.data;
    } catch (err: any) {
        console.error(
            "[getMeetingRoomById] status =", err?.response?.status,
            "data =", err?.response?.data
        );
        throw err;
    }
};


export const getMeetingRoomsByRestaurant = async (restaurantId: string): Promise<MeetingRoom[]> => {
    try {
        const response = await api.get(`${meetingRoomPath}/restaurant/${restaurantId}`);
        return response.data;
    } catch (err: any) {
        console.error(
            "[getMeetingRoomsByRestaurant] status =", err?.response?.status,
            "data =", err?.response?.data
        );
        throw err;
    }
};


export const searchMeetingRooms = async (params: MeetingRoomSearchParams = {}): Promise<MeetingRoom[]> => {
    try {
        const searchParams = new URLSearchParams();

        if (params.restaurantId) searchParams.append('restaurantId', params.restaurantId);
        if (params.minCapacity) searchParams.append('minCapacity', params.minCapacity.toString());
        if (params.maxCapacity) searchParams.append('maxCapacity', params.maxCapacity.toString());
        if (params.reservableOnly !== undefined) searchParams.append('reservableOnly', params.reservableOnly.toString());

        const response = await api.get(`${meetingRoomPath}/search?${searchParams}`);
        return response.data;
    } catch (err: any) {
        console.error(
            "[searchMeetingRooms] status =", err?.response?.status,
            "data =", err?.response?.data
        );
        throw err;
    }
};


export const getAvailableMeetingRooms = async (params: AvailabilityParams): Promise<MeetingRoom[]> => {
    try {
        const searchParams = new URLSearchParams();

        if (params.restaurantId) searchParams.append('restaurantId', params.restaurantId);
        searchParams.append('startTime', params.startTime);
        searchParams.append('endTime', params.endTime);

        const response = await api.get(`${meetingRoomPath}/available?${searchParams}`);
        return response.data;
    } catch (err: any) {
        console.error(
            "[getAvailableMeetingRooms] status =", err?.response?.status,
            "data =", err?.response?.data
        );
        throw err;
    }
};