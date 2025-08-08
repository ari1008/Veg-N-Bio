import { z } from 'zod'


export const NumberMettingPlace = z.number()
    .int()
    .min(1, { message: "Impossible minus 1" })
    .max(50, { message: "Impossible bigger 50" })

export const MeetingRoom = z.object({
    id: z.uuid().optional(),
    name: z.string().min(1, { message: "Name is required" }),
    numberMettingPlace: NumberMettingPlace,
    isReservable: z.boolean().default(true)
})
