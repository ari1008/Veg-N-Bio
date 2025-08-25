package com.veg.bio.menu.response

import com.veg.bio.infrastructure.table.OrderStatus
import com.veg.bio.menu.dto.RestaurantDto
import java.time.LocalDateTime
import java.util.UUID

data class OrderSummaryDto(
    val id: UUID,
    val status: OrderStatus,
    val customerName: String,
    val customerId: UUID,
    val totalAmount: Double,
    val itemCount: Int,
    val createdAt: LocalDateTime,
    val restaurant: RestaurantDto,
)
