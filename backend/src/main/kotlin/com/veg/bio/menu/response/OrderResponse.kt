package com.veg.bio.menu.response

import com.veg.bio.infrastructure.table.OrderStatus
import java.time.LocalDateTime
import java.util.UUID

data class OrderResponse(
    val id: UUID?,
    val status: OrderStatus,
    val customerId: UUID,
    val customerName: String,
    val totalAmount: Double,
    val lines: List<OrderLineResponse>,
    val createdAt: LocalDateTime,
    val flatDelivered: Boolean,
)