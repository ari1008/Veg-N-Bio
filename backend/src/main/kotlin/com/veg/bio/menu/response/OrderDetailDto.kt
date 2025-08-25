package com.veg.bio.menu.response

import com.veg.bio.infrastructure.table.OrderStatus
import com.veg.bio.menu.dto.RestaurantDto
import java.time.LocalDateTime
import java.util.UUID

data class OrderDetailDto(
    val id: UUID,
    val status: OrderStatus,
    val customer: CustomerDto,
    val totalAmount: Double,
    val createdAt: LocalDateTime,
    val restaurant: RestaurantDto,
    val lines: List<OrderLineDto>
)
