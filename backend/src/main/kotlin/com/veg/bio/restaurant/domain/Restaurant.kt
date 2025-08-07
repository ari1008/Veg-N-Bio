package com.veg.bio.restaurant.domain


data class Restaurant (
    val name: NameRestaurant,
    val address: Address,
    val availability: Availability,
    val meetingRooms: List<MeetingRoom>,
    val numberPlace: NumberPlace,
    val restaurantFeatures: Set<RestaurantFeature>
)
