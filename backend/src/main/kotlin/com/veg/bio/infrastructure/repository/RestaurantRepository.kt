package com.veg.bio.infrastructure.repository

import com.veg.bio.infrastructure.table.RestaurantEntity
import com.veg.bio.restaurant.domain.NameRestaurant
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface RestaurantRepository: JpaRepository<RestaurantEntity, UUID> {
    fun findByNameRestaurant(nameRestaurant: NameRestaurant): RestaurantEntity?
}