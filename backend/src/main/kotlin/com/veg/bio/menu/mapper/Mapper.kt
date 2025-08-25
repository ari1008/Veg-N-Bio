package com.veg.bio.menu.mapper

import com.veg.bio.infrastructure.table.OrderEntity
import com.veg.bio.infrastructure.table.OrderLineEntity
import com.veg.bio.infrastructure.table.RestaurantEntity
import com.veg.bio.infrastructure.table.UserEntity
import com.veg.bio.menu.dto.RestaurantDto
import com.veg.bio.menu.response.CustomerDto
import com.veg.bio.menu.response.OrderDetailDto
import com.veg.bio.menu.response.OrderLineDto
import com.veg.bio.menu.response.OrderSummaryDto

fun UserEntity.toDto(): CustomerDto {
    return CustomerDto(
        id = this.id!!,
        firstName = this.firstName.value,
        lastName = this.lastName.value,
        email = this.email.value,
        role = this.role
    )
}

fun OrderEntity.toSummaryDto(): OrderSummaryDto {
    return OrderSummaryDto(
        id = this.id!!,
        status = this.status,
        customerName = "${this.customer.firstName} ${this.customer.lastName}",
        customerId = this.customer.id!!,
        totalAmount = this.totalAmount,
        itemCount = this.lines.size,
        createdAt = this.createdAt,
        restaurant = this.restaurant.toRestaurantDto(),
    )
}

fun OrderLineEntity.toDto(): OrderLineDto {
    return OrderLineDto(
        id = this.id!!,
        dishId = this.dish.id!!,
        dishName = this.dishNameSnapshot,
        unitPrice = this.unitPriceSnapshot,
        quantity = this.quantity,
        lineTotal = this.lineTotal(),
        allergens = this.allergensSnapshot
    )
}

fun OrderEntity.toDetailDto(): OrderDetailDto {
    return OrderDetailDto(
        id = this.id!!,
        status = this.status,
        customer = this.customer.toDto(),
        totalAmount = this.totalAmount,
        createdAt = this.createdAt,
        lines = this.lines.map { it.toDto() },
        restaurant = this.restaurant.toRestaurantDto()
    )
}


fun RestaurantEntity.toRestaurantDto(): RestaurantDto {
    return RestaurantDto(
        id = this.id!!,
        name = this.nameRestaurant.value,
        addressEmbeddable = this.addressEmbeddable,
    )
}