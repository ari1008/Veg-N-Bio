package com.veg.bio.restaurant.domain

import java.time.LocalTime

data class TimeRange(val start: LocalTime, val end: LocalTime){
    val isOvernight: Boolean get() = end.isBefore(start)
}
