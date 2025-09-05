package com.veg.bio.reservation.dto

import com.veg.bio.infrastructure.table.ReservationStatus
import com.veg.bio.infrastructure.table.ReservationType
import java.time.LocalDateTime
import java.util.*

data class ReservationResponseDto(
    val id: UUID,
    val customerId: UUID,
    val customerName: String,
    val restaurantId: UUID,
    val restaurantName: String,
    val meetingRoomId: UUID? = null,
    val meetingRoomName: String? = null,
    val type: ReservationType,
    val status: ReservationStatus,
    val startTime: LocalDateTime,
    val endTime: LocalDateTime,
    val numberOfPeople: Int,
    val notes: String? = null,
    val totalPrice: Double? = null,
    val createdAt: LocalDateTime
)