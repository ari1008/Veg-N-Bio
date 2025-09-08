package com.veg.bio.infrastructure.table

import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UuidGenerator
import java.time.LocalDateTime
import java.util.*

enum class EventRequestStatus {
    PENDING, CONFIRMED, CANCELLED, COMPLETED
}

enum class EventType {
    ANNIVERSAIRE_ENFANT, CONFERENCE, SEMINAIRE, REUNION_ENTREPRISE, AUTRE
}

@Entity
@Table(
    name = "event_requests",
    indexes = [
        Index(name = "idx_event_customer", columnList = "customer_id"),
        Index(name = "idx_event_restaurant", columnList = "restaurant_id"),
        Index(name = "idx_event_datetime", columnList = "start_time, end_time")
    ]
)
data class EventRequestEntity(
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
    val type: EventType,

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    val status: EventRequestStatus = EventRequestStatus.PENDING,

    @Column(name = "start_time", nullable = false)
    val startTime: LocalDateTime,

    @Column(name = "end_time", nullable = false)
    val endTime: LocalDateTime,

    @Column(name = "number_of_people", nullable = false)
    val numberOfPeople: Int,

    @Column(name = "title", nullable = false)
    val title: String,

    @Column(name = "description", columnDefinition = "text")
    val description: String? = null,

    @Column(name = "contact_phone")
    val contactPhone: String? = null,

    @Column(name = "special_requests", columnDefinition = "text")
    val specialRequests: String? = null,

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "estimated_price")
    val estimatedPrice: Double? = null
) {
    override fun toString(): String {
        return "EventRequestEntity(id=$id, title='$title', type=$type, status=$status, startTime=$startTime)"
    }
}
