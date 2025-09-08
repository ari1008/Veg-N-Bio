package com.veg.bio.infrastructure.repository

import com.veg.bio.infrastructure.table.EventRequestEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.time.LocalDateTime
import java.util.*

@Repository
interface EventRequestRepository : JpaRepository<EventRequestEntity, UUID> {
    fun findByRestaurantIdOrderByCreatedAtDesc(restaurantId: UUID): List<EventRequestEntity>
    fun findByCustomerIdOrderByCreatedAtDesc(customerId: UUID): List<EventRequestEntity>
    fun findAllByOrderByCreatedAtDesc(): List<EventRequestEntity>

    @Query("""
    SELECT e FROM EventRequestEntity e 
    WHERE e.meetingRoom.id = :roomId 
    AND e.status IN ('PENDING', 'CONFIRMED')
    AND ((e.startTime < :endTime AND e.endTime > :startTime))
""")
    fun findConflictingEventRequests(
        @Param("roomId") roomId: UUID,
        @Param("startTime") startTime: LocalDateTime,
        @Param("endTime") endTime: LocalDateTime
    ): List<EventRequestEntity>

    @Query("""
    SELECT e FROM EventRequestEntity e 
    WHERE e.restaurant.id = :restaurantId 
    AND e.status IN ('PENDING', 'CONFIRMED')
    AND e.meetingRoom IS NULL
    AND ((e.startTime < :endTime AND e.endTime > :startTime))
""")
    fun findConflictingRestaurantEvents(
        @Param("restaurantId") restaurantId: UUID,
        @Param("startTime") startTime: LocalDateTime,
        @Param("endTime") endTime: LocalDateTime
    ): List<EventRequestEntity>

    @Query("""
    SELECT e FROM EventRequestEntity e 
    WHERE e.restaurant.id = :restaurantId 
    AND e.status IN ('PENDING', 'CONFIRMED')
    AND e.meetingRoom IS NOT NULL
    AND ((e.startTime < :endTime AND e.endTime > :startTime))
""")
    fun findConflictingEventRequestsForRestaurant(
        @Param("restaurantId") restaurantId: UUID,
        @Param("startTime") startTime: LocalDateTime,
        @Param("endTime") endTime: LocalDateTime
    ): List<EventRequestEntity>
}