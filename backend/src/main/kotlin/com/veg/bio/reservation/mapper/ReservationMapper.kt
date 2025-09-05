package com.veg.bio.reservation.mapper

import com.veg.bio.infrastructure.table.ReservationEntity
import com.veg.bio.reservation.domain.Reservation
import com.veg.bio.reservation.dto.ReservationResponseDto

object ReservationMapper {

    fun toDomain(entity: ReservationEntity): Reservation {
        return Reservation(
            id = entity.id,
            customerId = entity.customer.id!!,
            customerName = "${entity.customer.firstName.value} ${entity.customer.lastName.value}",
            restaurantId = entity.restaurant.id!!,
            restaurantName = entity.restaurant.nameRestaurant.value,
            meetingRoomId = entity.meetingRoom?.id,
            meetingRoomName = entity.meetingRoom?.name,
            type = entity.type,
            status = entity.status,
            startTime = entity.startTime,
            endTime = entity.endTime,
            numberOfPeople = entity.numberOfPeople,
            notes = entity.notes,
            totalPrice = entity.totalPrice,
            createdAt = entity.createdAt
        )
    }

    fun toResponseDto(entity: ReservationEntity): ReservationResponseDto {
        return ReservationResponseDto(
            id = entity.id!!,
            customerId = entity.customer.id!!,
            customerName = "${entity.customer.firstName.value} ${entity.customer.lastName.value}",
            restaurantId = entity.restaurant.id!!,
            restaurantName = entity.restaurant.nameRestaurant.value,
            meetingRoomId = entity.meetingRoom?.id,
            meetingRoomName = entity.meetingRoom?.name,
            type = entity.type,
            status = entity.status,
            startTime = entity.startTime,
            endTime = entity.endTime,
            numberOfPeople = entity.numberOfPeople,
            notes = entity.notes,
            totalPrice = entity.totalPrice,
            createdAt = entity.createdAt
        )
    }
}
