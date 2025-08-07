package com.veg.bio.restaurant.mapper

import com.veg.bio.infrastructure.table.AddressEmbeddable
import com.veg.bio.infrastructure.table.MeetingRomEntity
import com.veg.bio.infrastructure.table.OpeningHourEntity
import com.veg.bio.infrastructure.table.RestaurantEntity
import com.veg.bio.restaurant.domain.*
import java.util.*

object MapperRestaurant {


    fun toDomain(restaurantEntity: RestaurantEntity, id: UUID? = null): Restaurant {
        return Restaurant(
            id = id,
            name = restaurantEntity.nameRestaurant,
            address = Address(
                streetNumber = restaurantEntity.addressEmbeddable.streetNumber,
                streetName = restaurantEntity.addressEmbeddable.streetName,
                postalCode = restaurantEntity.addressEmbeddable.postalCode,
                city = restaurantEntity.addressEmbeddable.city,
                country = restaurantEntity.addressEmbeddable.country
            ),
            availability = mapAvailability(restaurantEntity.openingHours),
            meetingRooms = restaurantEntity.meetingRoms.stream().map {
                MeetingRoom(it.id, it.name, it.numberMettingPlace, it.isReservable)
            }.toList(),
            numberPlace = restaurantEntity.numberOfPlace,
            restaurantFeatures = restaurantEntity.features,
        )
    }

    fun toEntity(restaurant: Restaurant, id: UUID? = null): RestaurantEntity {
        return RestaurantEntity(
            nameRestaurant = restaurant.name,
            id = id,
            openingHours = mapHourOpening(restaurant.availability),
            numberOfPlace = restaurant.numberPlace,
            addressEmbeddable = AddressEmbeddable(
                streetName = restaurant.address.streetName,
                streetNumber = restaurant.address.streetNumber,
                postalCode = restaurant.address.postalCode,
                city = restaurant.address.city
            ),
            features = restaurant.restaurantFeatures,
            meetingRoms = restaurant.meetingRooms.stream().map {
                MeetingRomEntity(
                    name = it.name,
                    numberMettingPlace = it.numberMettingPlace,
                    isReservable = it.isReservable
                )
            }.toList(),
        )
    }

    fun mapHourOpening(availability: Availability): List<OpeningHourEntity> {
        return availability.openingHours.map { (dayOfWeek, timeRange) ->
            OpeningHourEntity(dayOfWeek = dayOfWeek, startTime = timeRange.start, endTime = timeRange.end)

        }.toList()

    }

    fun mapMeeting(meetingRoom: MeetingRoom): MeetingRomEntity {
        return MeetingRomEntity(
            name = meetingRoom.name,
            numberMettingPlace = meetingRoom.numberMettingPlace,
            isReservable = meetingRoom.isReservable
        )
    }

    fun mapMeetingRoom(meetingRomEntity: MeetingRomEntity): MeetingRoom {
        return MeetingRoom(
            meetingRomEntity.id,
            meetingRomEntity.name,
            meetingRomEntity.numberMettingPlace,
            meetingRomEntity.isReservable
        )
    }

    fun mapAvailability(openingHourEntities: List<OpeningHourEntity>): Availability {
        val openingHours = openingHourEntities.associate { entity ->
            entity.dayOfWeek to TimeRange(
                start = entity.startTime,
                end = entity.endTime
            )
        }
        return Availability(openingHours)
    }

}