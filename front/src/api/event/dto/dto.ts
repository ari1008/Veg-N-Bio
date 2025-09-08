import { z } from "zod";

export interface EventRequest {
    id: string;
    customerId: string;
    customerName: string;
    restaurantId: string;
    restaurantName: string;
    meetingRoomId?: string;
    meetingRoomName?: string;
    type: 'ANNIVERSAIRE_ENFANT' | 'CONFERENCE' | 'SEMINAIRE' | 'REUNION_ENTREPRISE' | 'AUTRE';
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
    startTime: string;
    endTime: string;
    numberOfPeople: number;
    title: string;
    description?: string;
    contactPhone?: string;
    specialRequests?: string;
    estimatedPrice?: number;
    createdAt: string;
}

export const createEventRequestSchema = z.object({
    customerId: z.string().uuid("ID client invalide"),
    restaurantId: z.string().uuid("ID restaurant invalide"),
    meetingRoomId: z.union([
        z.string().uuid("ID salle invalide"),
        z.literal(""),
        z.undefined()
    ]).optional(),
    type: z.enum(['ANNIVERSAIRE_ENFANT', 'CONFERENCE', 'SEMINAIRE', 'REUNION_ENTREPRISE', 'AUTRE']),
    startTime: z.string().min(1, "Date de début requise"),
    endTime: z.string().min(1, "Date de fin requise"),
    numberOfPeople: z.number()
        .int("Le nombre de personnes doit être un entier")
        .min(1, "Au moins 1 personne")
        .max(500, "Maximum 500 personnes"),
    title: z.string()
        .min(1, "Le titre est requis")
        .max(200, "Maximum 200 caractères"),
    description: z.string()
        .max(2000, "Maximum 2000 caractères")
        .optional(),
    contactPhone: z.union([
        z.string().regex(/^[+]?[0-9]{10,15}$/, "Format de téléphone invalide"),
        z.literal(''),
        z.undefined()
    ]).optional(),
    specialRequests: z.string()
        .max(1000, "Maximum 1000 caractères")
        .optional()
}).refine(
    (data) => new Date(data.endTime) > new Date(data.startTime),
    {
        message: "L'heure de fin doit être après l'heure de début",
        path: ["endTime"]
    }
);

export type CreateEventRequestRequest = z.infer<typeof createEventRequestSchema>;

export const updateEventRequestStatusSchema = z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'])
});

export type UpdateEventRequestStatusRequest = z.infer<typeof updateEventRequestStatusSchema>;
