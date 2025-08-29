package com.veg.bio.menu.mapper

import com.veg.bio.infrastructure.table.OrderEntity
import com.veg.bio.infrastructure.table.OrderLineEntity
import com.veg.bio.infrastructure.table.RestaurantEntity
import com.veg.bio.infrastructure.table.UserEntity
import com.veg.bio.menu.domain.DishWithTotal
import com.veg.bio.menu.response.OrderLineResponse
import com.veg.bio.menu.response.OrderResponse
import java.time.OffsetTime

object OrderLineMapper {


    fun createOrderLineEntity(orderEntity: OrderEntity, dishTotal: DishWithTotal) {
        val line = OrderLineEntity(
            order = orderEntity,
            dish = dishTotal.dish,
            dishNameSnapshot = dishTotal.dish.name,
            unitPriceSnapshot = dishTotal.dish.price,
            allergensSnapshot = dishTotal.dish.allergens.toSet(),
            quantity = dishTotal.total
        )
        orderEntity.lines.add(line)
    }


    fun createOrderEntity(user: UserEntity, amount: Double, restaurantEntity: RestaurantEntity, flatDelivered: Boolean): OrderEntity{
        return OrderEntity(customer=user, totalAmount = amount, restaurant = restaurantEntity, flatDelivered = flatDelivered)
    }

    fun toResponse(entity: OrderEntity): OrderResponse {
        return OrderResponse(
            id = entity.id,
            status = entity.status,
            customerId = entity.customer.id!!,
            customerName = "${entity.customer.firstName} ${entity.customer.lastName}" ,
            totalAmount = entity.totalAmount,
            createdAt = entity.createdAt,
            lines = entity.lines.map { line ->
                OrderLineResponse(
                    id = line.id,
                    dishName = line.dishNameSnapshot,
                    unitPrice = line.unitPriceSnapshot,
                    quantity = line.quantity,
                    lineTotal = line.lineTotal(),
                    allergens = line.allergensSnapshot
                )
            },
            flatDelivered = entity.flatDelivered
        )
    }
}