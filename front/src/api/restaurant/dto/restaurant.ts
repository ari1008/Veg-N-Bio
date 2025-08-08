import { z } from 'zod'
import {Availability} from "./availability.ts";
import {MeetingRoom} from "./meetingRoom.ts";
import {Address} from "./address.ts";
export const RestaurantFeature = z.enum([
    "WIFI_HAUT_DEBIT",
    "PLATEAUX_MEMBRES",
    "PLATEAUX_LIVRABLE"
])

export const NameRestaurant = z.string()
    .min(3, { message: "The name of restaurant is too short" })
    .max(100, { message: "The name of restaurant is too long" })
    .refine(val => val.trim() !== '', { message: "The name of restaurant cannot be blank" })

export const NumberPlace = z.number()
    .int()
    .min(1, { message: "Impossible minus 1" })
    .max(200, { message: "Impossible bigger 200" })


export const NumberPrinter = z.number()
    .int()
    .min(1, { message: "Require min 1" })
    .max(10, { message: "Require max 10" })


export const RestaurantSchema = z.object({
    id: z.uuid().optional(),
    name: NameRestaurant,
    address: Address,
    availability: Availability,
    meetingRooms: z.array(MeetingRoom),
    numberPlace: NumberPlace,
    numberPrinter: NumberPrinter,
    restaurantFeatures: z.array(RestaurantFeature)
})

export type Restaurant = z.infer<typeof RestaurantSchema>;
