import { z } from 'zod';

export const NumberMettingPlace = z.number()
    .int()
    .min(1, { message: "Impossible minus 1" })
    .max(50, { message: "Impossible bigger 50" });

export const MeetingRoomSchema = z.object({
    id: z.uuid(),
    name: z.string().min(1, { message: "Name is required" }),
    numberMettingPlace: NumberMettingPlace,
    isReservable: z.boolean(),
});

export const CreateMeetingRoomSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    numberMettingPlace: NumberMettingPlace,
    isReservable: z.boolean().default(true),
    restaurantId: z.string().uuid(),
});

export const UpdateMeetingRoomSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }).optional(),
    numberMettingPlace: NumberMettingPlace.optional(),
    isReservable: z.boolean().optional(),
});

export type MeetingRoom = z.infer<typeof MeetingRoomSchema>;
export type CreateMeetingRoomRequest = z.infer<typeof CreateMeetingRoomSchema>;
export type UpdateMeetingRoomRequest = z.infer<typeof UpdateMeetingRoomSchema>;

export interface MeetingRoomFilter {
    restaurantId?: string;
    minCapacity?: number;
    maxCapacity?: number;
    reservableOnly?: boolean;
    name?: string;
}

export interface MeetingRoomAvailability extends MeetingRoom {
    isAvailable: boolean;
    nextAvailableSlot?: {
        startTime: string;
        endTime: string;
    };
    conflictingReservations?: {
        startTime: string;
        endTime: string;
        customerName: string;
    }[];
}