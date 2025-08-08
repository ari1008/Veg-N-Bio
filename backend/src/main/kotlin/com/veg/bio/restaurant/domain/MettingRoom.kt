package com.veg.bio.restaurant.domain

import java.util.UUID

data class MeetingRoom(
    val id: UUID? = null,
    val name: String,
    val numberMettingPlace: NumberMettingPlace,
    val isReservable: Boolean = true
)
