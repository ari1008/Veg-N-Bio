package com.veg.bio.mettingrom
import com.veg.bio.infrastructure.repository.MeetingRoomRepository
import com.veg.bio.restaurant.domain.MeetingRoom
import com.veg.bio.infrastructure.table.MeetingRomEntity
import org.springframework.stereotype.Service
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.*

@Service
class MeetingRoomService(
    private val meetingRoomRepository: MeetingRoomRepository,
) {


    fun findAllMeetingRooms(): List<MeetingRoom> {
        return meetingRoomRepository.findAll()
            .map { it.toDomain() }
    }


    fun findMeetingRoomById(id: UUID): MeetingRoom {
        val entity = meetingRoomRepository.findById(id)
            .orElseThrow { RuntimeException("Salle de réunion non trouvée avec l'ID: $id") }
        return entity.toDomain()
    }


    fun findMeetingRoomsByRestaurant(restaurantId: UUID): List<MeetingRoom> {
        return meetingRoomRepository.findByRestaurantId(restaurantId)
            .map { it.toDomain() }
    }


    fun searchMeetingRooms(
        restaurantId: UUID?,
        minCapacity: Int?,
        maxCapacity: Int?,
        reservableOnly: Boolean
    ): List<MeetingRoom> {
        return meetingRoomRepository.findMeetingRoomsByCriteria(
            restaurantId = restaurantId,
            minCapacity = minCapacity,
            maxCapacity = maxCapacity,
            reservableOnly = reservableOnly
        ).map { it.toDomain() }
    }

    fun findAvailableMeetingRooms(
        restaurantId: UUID?,
        startTime: String,
        endTime: String
    ): List<MeetingRoom> {
        val start = LocalDateTime.parse(startTime, DateTimeFormatter.ISO_DATE_TIME)
        val end = LocalDateTime.parse(endTime, DateTimeFormatter.ISO_DATE_TIME)

        return meetingRoomRepository.findAvailableMeetingRooms(
            restaurantId = restaurantId,
            startTime = start,
            endTime = end
        ).map { it.toDomain() }
    }


    private fun MeetingRomEntity.toDomain(): MeetingRoom {
        return MeetingRoom(
            id = this.id,
            name = this.name,
            numberMettingPlace = this.numberMettingPlace,
            isReservable = this.isReservable
        )
    }
}