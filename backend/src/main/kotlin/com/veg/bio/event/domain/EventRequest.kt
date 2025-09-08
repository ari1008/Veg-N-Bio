package com.veg.bio.event.domain

import java.time.LocalDateTime
import java.util.*

data class EventRequest(
    val id: UUID?,
    val customerId: UUID,
    val customerName: String,
    val restaurantId: UUID,
    val restaurantName: String,
    val meetingRoomId: UUID?,
    val meetingRoomName: String?,
    val type: String,
    val status: String,
    val startTime: LocalDateTime,
    val endTime: LocalDateTime,
    val numberOfPeople: Int,
    val title: String,
    val description: String?,
    val contactPhone: String?,
    val specialRequests: String?,
    val estimatedPrice: Double?,
    val createdAt: LocalDateTime
)