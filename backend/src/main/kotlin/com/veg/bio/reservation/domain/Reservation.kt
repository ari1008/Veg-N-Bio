package com.veg.bio.reservation.domain

import com.veg.bio.infrastructure.table.ReservationStatus
import com.veg.bio.infrastructure.table.ReservationType
import java.time.LocalDateTime
import java.util.*

data class Reservation(
    val id: UUID? = null,
    val customerId: UUID,
    val customerName: String? = null,
    val restaurantId: UUID,
    val restaurantName: String? = null,
    val meetingRoomId: UUID? = null,
    val meetingRoomName: String? = null,
    val type: ReservationType,
    val status: ReservationStatus,
    val startTime: LocalDateTime,
    val endTime: LocalDateTime,
    val numberOfPeople: Int,
    val notes: String? = null,
    val totalPrice: Double? = null,
    val createdAt: LocalDateTime? = null
)
