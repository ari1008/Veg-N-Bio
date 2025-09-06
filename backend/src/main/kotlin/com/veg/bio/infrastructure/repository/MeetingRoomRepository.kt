package com.veg.bio.infrastructure.repository

import com.veg.bio.infrastructure.table.MeetingRomEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.time.LocalDateTime
import java.util.*

@Repository
interface MeetingRoomRepository : JpaRepository<MeetingRomEntity, UUID> {

    @Query(value = "SELECT * FROM meeting_room mr WHERE mr.restaurant_id = :restaurantId", nativeQuery = true)
    fun findByRestaurantId(@Param("restaurantId") restaurantId: UUID): List<MeetingRomEntity>


    @Query(value = """
        SELECT * FROM meeting_room mr 
        WHERE (:restaurantId IS NULL OR mr.restaurant_id = :restaurantId)
        AND (:minCapacity IS NULL OR mr.number_of_metting_place >= :minCapacity)
        AND (:maxCapacity IS NULL OR mr.number_of_metting_place <= :maxCapacity)
        AND (:reservableOnly = false OR mr.is_reservable = true)
        ORDER BY mr.name
    """, nativeQuery = true)
    fun findMeetingRoomsByCriteria(
        @Param("restaurantId") restaurantId: UUID?,
        @Param("minCapacity") minCapacity: Int?,
        @Param("maxCapacity") maxCapacity: Int?,
        @Param("reservableOnly") reservableOnly: Boolean
    ): List<MeetingRomEntity>

    @Query(value = """
    SELECT * FROM meeting_room mr 
    WHERE mr.is_reservable = true
    AND (:restaurantId IS NULL OR mr.restaurant_id = :restaurantId)
    AND mr.id NOT IN (
        SELECT r.meeting_room_id FROM reservations r 
        WHERE r.meeting_room_id IS NOT NULL
        AND r.status != 'CANCELED'
        AND (
            (r.start_time <= :startTime AND r.end_time > :startTime) OR
            (r.start_time < :endTime AND r.end_time >= :endTime) OR
            (r.start_time >= :startTime AND r.end_time <= :endTime)
        )
    )
    ORDER BY mr.name
""", nativeQuery = true)
    fun findAvailableMeetingRooms(
        @Param("restaurantId") restaurantId: UUID?,
        @Param("startTime") startTime: LocalDateTime,
        @Param("endTime") endTime: LocalDateTime
    ): List<MeetingRomEntity>

    fun findByIsReservableTrue(): List<MeetingRomEntity>

    @Query("SELECT mr FROM MeetingRomEntity mr WHERE mr.numberMettingPlace >= :minCapacity ORDER BY mr.numberMettingPlace")
    fun findByMinCapacity(@Param("minCapacity") minCapacity: Int): List<MeetingRomEntity>
}