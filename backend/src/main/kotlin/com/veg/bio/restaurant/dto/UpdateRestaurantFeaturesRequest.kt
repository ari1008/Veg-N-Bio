package com.veg.bio.restaurant.dto

import com.veg.bio.restaurant.domain.RestaurantFeature

data class UpdateRestaurantFeaturesRequest(
    val featuresToAdd: Set<RestaurantFeature> = emptySet(),
    val featuresToRemove: Set<RestaurantFeature> = emptySet()
)
