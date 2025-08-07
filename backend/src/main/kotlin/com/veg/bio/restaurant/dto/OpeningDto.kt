package com.veg.bio.restaurant.dto

import com.veg.bio.restaurant.domain.TimeRange
import java.time.DayOfWeek

data class OpeningDto(
    val openingHours: Map<DayOfWeek, TimeRange>
)
