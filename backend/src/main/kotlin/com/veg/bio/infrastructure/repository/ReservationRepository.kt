package com.veg.bio.infrastructure.repository

import com.veg.bio.infrastructure.table.ReservationEntity
import com.veg.bio.infrastructure.table.ReservationStatus
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.time.LocalDateTime
import java.util.*

@Repository
interface ReservationRepository : JpaRepository<ReservationEntity, UUID> {

    // Réservations d'un client spécifique
    fun findByCustomerIdOrderByCreatedAtDesc(customerId: UUID): List<ReservationEntity>

    // Réservations d'un restaurant spécifique
    fun findByRestaurantIdOrderByCreatedAtDesc(restaurantId: UUID): List<ReservationEntity>

    // Toutes les réservations (pour admin/owner)
    fun findAllByOrderByCreatedAtDesc(): List<ReservationEntity>

    // Réservations par statut
    fun findByStatusOrderByCreatedAtDesc(status: ReservationStatus): List<ReservationEntity>

    // Conflits de réservation (existantes)
    @Query("""
        SELECT r FROM ReservationEntity r 
        WHERE r.restaurant.id = :restaurantId 
        AND (:meetingRoomId IS NULL OR r.meetingRoom.id = :meetingRoomId)
        AND r.status IN ('PENDING', 'CONFIRMED')
        AND (
            (r.startTime < :endTime AND r.endTime > :startTime)
        )
    """)
    fun findConflictingReservations(
        @Param("restaurantId") restaurantId: UUID,
        @Param("meetingRoomId") meetingRoomId: UUID?,
        @Param("startTime") startTime: LocalDateTime,
        @Param("endTime") endTime: LocalDateTime
    ): List<ReservationEntity>

    @Query("""
        SELECT r FROM ReservationEntity r 
        WHERE r.restaurant.id = :restaurantId 
        AND r.type = 'RESTAURANT_FULL'
        AND r.status IN ('PENDING', 'CONFIRMED')
        AND (
            (r.startTime < :endTime AND r.endTime > :startTime)
        )
    """)
    fun findConflictingFullRestaurantReservations(
        @Param("restaurantId") restaurantId: UUID,
        @Param("startTime") startTime: LocalDateTime,
        @Param("endTime") endTime: LocalDateTime
    ): List<ReservationEntity>
}