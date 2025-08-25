package com.veg.bio.menu.response

data class OrderListResponse(
    val content: List<OrderSummaryDto>,
    val page: Int,
    val size: Int,
    val totalElements: Long,
    val totalPages: Int,
    val first: Boolean,
    val last: Boolean,
    val hasNext: Boolean,
    val hasPrevious: Boolean
)
