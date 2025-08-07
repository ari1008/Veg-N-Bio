package com.veg.bio.restaurant.domain

import com.veg.bio.restaurant.NotGoodAvailability
import java.time.DayOfWeek
import java.time.LocalTime

data class Availability(
    val openingHours: Map<DayOfWeek, TimeRange>
) {
    init {
        validate()
    }

    companion object {
        fun create(dayOfWeek: DayOfWeek, startDate: LocalTime, endDate: LocalTime): Availability {
            return Availability(
                openingHours = mapOf(
                    dayOfWeek to TimeRange(start = startDate, end = endDate)
                )
            )
        }
    }

    fun add(dayOfWeek: DayOfWeek, startDate: LocalTime, endDate: LocalTime): Availability {
        if (openingHours.containsKey(dayOfWeek)) {
            throw NotGoodAvailability()
        }

        val newEntry = dayOfWeek to TimeRange(start = startDate, end = endDate)
        return Availability(openingHours + newEntry)
    }

    private fun validate() {
        if (openingHours.size != openingHours.keys.toSet().size) {
            throw NotGoodAvailability()
        }

        openingHours.forEach { (day, range) ->
            when {
                range.start == range.end -> {
                    throw NotGoodAvailability()
                }
                !range.isOvernight && range.end < range.start -> {
                    throw NotGoodAvailability()
                }
            }
        }
    }

}
