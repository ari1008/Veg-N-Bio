package com.veg.bio.event.mapper

import com.veg.bio.event.domain.EventRequest
import com.veg.bio.infrastructure.table.EventRequestEntity

object EventRequestMapper {

    fun toDomain(entity: EventRequestEntity): EventRequest {
        return EventRequest(
            id = entity.id,
            customerId = entity.customer.id!!,
            customerName = "${entity.customer.firstName.value} ${entity.customer.lastName.value}",
            restaurantId = entity.restaurant.id!!,
            restaurantName = entity.restaurant.nameRestaurant.value,
            meetingRoomId = entity.meetingRoom?.id,
            meetingRoomName = entity.meetingRoom?.name,
            type = entity.type.name,
            status = entity.status.name,
            startTime = entity.startTime,
            endTime = entity.endTime,
            numberOfPeople = entity.numberOfPeople,
            title = entity.title,
            description = entity.description,
            contactPhone = entity.contactPhone,
            specialRequests = entity.specialRequests,
            estimatedPrice = entity.estimatedPrice,
            createdAt = entity.createdAt
        )
    }
}