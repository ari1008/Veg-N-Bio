import { z } from 'zod'

export const Address = z.object({
    streetNumber: z.number()
        .int()
        .positive({ message: "Street number must be a positive integer" }),

    streetName: z.string()
        .min(1, { message: "Street name is required" }),

    postalCode: z.string()
        .regex(/^\d{5}$/, { message: "Postal code must be 5 digits" }),

    city: z.string()
        .min(1, { message: "City is required" }),

    country: z.string()
        .default("France")
})
