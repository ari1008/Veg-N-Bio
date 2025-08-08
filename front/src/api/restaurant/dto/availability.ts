import { z } from 'zod'

export const DayOfWeek = z.enum([
    "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"
])

export const TimeString = z.string().regex(/^([01]\d|2[0-4]):[0-5]\d$/, {
    message: "Invalid time format. Expected HH:mm"
})

export const TimeRange = z.object({
    start: TimeString,
    end: TimeString
}).refine(data => data.start !== data.end, {
    message: "Start and end time must be different",
}).refine(data => {
    const [startH, startM] = data.start.split(":").map(Number)
    const [endH, endM] = data.end.split(":").map(Number)
    const startMinutes = startH * 60 + startM
    const endMinutes = endH * 60 + endM
    return startMinutes < endMinutes || endMinutes < startMinutes // overnight allowed
}, {
    message: "End time must be after start time or be an overnight shift",
})

export const Availability = z.object({
    openingHours: z.record(DayOfWeek, TimeRange)
}).refine(data => {
    const keys = Object.keys(data.openingHours)
    return new Set(keys).size === keys.length
}, {
    message: "Duplicate days in openingHours"
})
