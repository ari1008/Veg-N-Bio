package com.veg.bio.mettingrom

import com.veg.bio.restaurant.domain.MeetingRoom
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.util.*

@RestController
@RequestMapping("/api/notprotected/meeting-rooms")
class MeetingRoomNotProtectedController(
    private val meetingRoomService: MeetingRoomService,
) {


    @GetMapping
    fun getAllMeetingRooms(): ResponseEntity<List<MeetingRoom>> {
        val meetingRooms = meetingRoomService.findAllMeetingRooms()
        return ResponseEntity.status(HttpStatus.OK).body(meetingRooms)
    }


    @GetMapping("/{id}")
    fun getMeetingRoomById(@PathVariable id: UUID): ResponseEntity<MeetingRoom> {
        val meetingRoom = meetingRoomService.findMeetingRoomById(id)
        return ResponseEntity.status(HttpStatus.OK).body(meetingRoom)
    }


    @GetMapping("/restaurant/{restaurantId}")
    fun getMeetingRoomsByRestaurant(@PathVariable restaurantId: UUID): ResponseEntity<List<MeetingRoom>> {
        val meetingRooms = meetingRoomService.findMeetingRoomsByRestaurant(restaurantId)
        return ResponseEntity.status(HttpStatus.OK).body(meetingRooms)
    }

    @GetMapping("/search")
    fun searchMeetingRooms(
        @RequestParam(required = false) restaurantId: UUID?,
        @RequestParam(required = false) minCapacity: Int?,
        @RequestParam(required = false) maxCapacity: Int?,
        @RequestParam(required = false, defaultValue = "true") reservableOnly: Boolean
    ): ResponseEntity<List<MeetingRoom>> {
        val meetingRooms = meetingRoomService.searchMeetingRooms(
            restaurantId = restaurantId,
            minCapacity = minCapacity,
            maxCapacity = maxCapacity,
            reservableOnly = reservableOnly
        )
        return ResponseEntity.status(HttpStatus.OK).body(meetingRooms)
    }

    @GetMapping("/available")
    fun getAvailableMeetingRooms(
        @RequestParam restaurantId: UUID?,
        @RequestParam startTime: String,
        @RequestParam endTime: String
    ): ResponseEntity<List<MeetingRoom>> {
        val availableRooms = meetingRoomService.findAvailableMeetingRooms(
            restaurantId = restaurantId,
            startTime = startTime,
            endTime = endTime
        )
        return ResponseEntity.status(HttpStatus.OK).body(availableRooms)
    }
}