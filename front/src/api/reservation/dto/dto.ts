import { z } from "zod";

export interface Reservation {
    id: string;
    customerId: string;
    customerName: string;
    restaurantId: string;
    restaurantName: string;
    meetingRoomId?: string;
    meetingRoomName?: string;
    type: 'RESTAURANT_FULL' | 'MEETING_ROOM';
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
    startTime: string;
    endTime: string;
    numberOfPeople: number;
    notes?: string;
    totalPrice?: number;
    createdAt: string;
}

export interface RestaurantAvailability {
    schedule: {
        [day: string]: {
            open?: string;
            close?: string;
            isOpen: boolean;
        };
    };
    restaurantName: string;
    totalCapacity: number;
    meetingRooms: {
        id: string;
        name: string;
        capacity: number;
    }[];
}

export interface Customer {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
}

export const createReservationSchema = z.object({
    customerId: z.uuid("ID client invalide"),
    restaurantId: z.uuid("ID restaurant invalide"),
    meetingRoomId: z.union([
        z.uuid("ID salle invalide"),
        z.literal(""),
        z.undefined()
    ]).optional(),
    type: z.enum(['RESTAURANT_FULL', 'MEETING_ROOM']),
    startTime: z.string().min(1, "Date de début requise"),
    endTime: z.string().min(1, "Date de fin requise"),
    numberOfPeople: z.number()
        .int("Le nombre de personnes doit être un entier")
        .min(1, "Au moins 1 personne")
        .max(200, "Maximum 200 personnes"),
    notes: z.string().max(1000, "Maximum 1000 caractères").optional()
}).refine(
    (data) => new Date(data.endTime) > new Date(data.startTime),
    {
        message: "L'heure de fin doit être après l'heure de début",
        path: ["endTime"]
    }
).refine(
    (data) => {
        if (data.type === 'MEETING_ROOM') {
            return data.meetingRoomId !== undefined && data.meetingRoomId !== "";
        }
        return true;
    },
    {
        message: "Une salle doit être sélectionnée pour ce type de réservation",
        path: ["meetingRoomId"]
    }
);

export type CreateReservationRequest = z.infer<typeof createReservationSchema>;

export const updateReservationStatusSchema = z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'])
});

export type UpdateReservationStatusRequest = z.infer<typeof updateReservationStatusSchema>;