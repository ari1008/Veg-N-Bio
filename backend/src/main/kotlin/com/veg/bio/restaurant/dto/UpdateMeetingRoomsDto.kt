package com.veg.bio.restaurant.dto

import com.veg.bio.restaurant.domain.MeetingRoom

data class UpdateMeetingRoomsDto(
    val roomsToAdd: List<MeetingRoom> = emptyList(),
    val roomsToRemove: List<MeetingRoom> = emptyList()
)
