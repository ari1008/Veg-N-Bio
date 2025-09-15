package com.veg.bio.review.dto

data class ReviewStatsDto(
    val averageRating: Double,
    val totalReviews: Int,
    val ratingsDistribution: Map<Int, Int> // rating -> count
)

