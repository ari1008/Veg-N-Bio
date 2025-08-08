package com.veg.bio.restaurant.domain

import java.util.UUID


data class Restaurant (
    val id: UUID? = null,
    val name: NameRestaurant,
    val address: Address,
    val availability: Availability,
    val meetingRooms: List<MeetingRoom>,
    val numberPlace: NumberPlace,
    val numberPrinter: Printer,
    val restaurantFeatures: Set<RestaurantFeature>
)
