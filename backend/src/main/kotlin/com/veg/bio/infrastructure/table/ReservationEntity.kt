package com.veg.bio.infrastructure.table

import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UuidGenerator
import java.math.BigDecimal
import java.time.LocalDateTime
import java.util.*

enum class ReservationStatus {
    PENDING, CONFIRMED, CANCELLED, COMPLETED
}

enum class ReservationType {
    RESTAURANT_FULL, MEETING_ROOM
}

@Entity
@Table(
    name = "reservations",
    indexes = [
        Index(name = "idx_reservation_customer", columnList = "customer_id"),
        Index(name = "idx_reservation_restaurant", columnList = "restaurant_id"),
        Index(name = "idx_reservation_datetime", columnList = "start_time, end_time")
    ]
)
data class ReservationEntity(
    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(name = "id", updatable = false, nullable = false)
    val id: UUID? = null,

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    val customer: UserEntity,

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "restaurant_id", nullable = false)
    val restaurant: RestaurantEntity,

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "meeting_room_id", nullable = true)
    val meetingRoom: MeetingRomEntity? = null,

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 32)
    val type: ReservationType,

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    val status: ReservationStatus = ReservationStatus.PENDING,

    @Column(name = "start_time", nullable = false)
    val startTime: LocalDateTime,

    @Column(name = "end_time", nullable = false)
    val endTime: LocalDateTime,

    @Column(name = "number_of_people", nullable = false)
    val numberOfPeople: Int,

    @Column(name = "notes", columnDefinition = "text")
    val notes: String? = null,

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "total_price")
    val totalPrice: Double? = null
) {
    override fun toString(): String {
        return "ReservationEntity(id=$id, type=$type, status=$status, startTime=$startTime, endTime=$endTime)"
    }
}
