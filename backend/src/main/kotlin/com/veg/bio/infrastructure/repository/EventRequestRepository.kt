package com.veg.bio.infrastructure.repository

import com.veg.bio.infrastructure.table.EventRequestEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface EventRequestRepository : JpaRepository<EventRequestEntity, UUID> {
    fun findByRestaurantIdOrderByCreatedAtDesc(restaurantId: UUID): List<EventRequestEntity>
    fun findByCustomerIdOrderByCreatedAtDesc(customerId: UUID): List<EventRequestEntity>
    fun findAllByOrderByCreatedAtDesc(): List<EventRequestEntity>
}