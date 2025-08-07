package com.veg.bio.restaurant

import com.veg.bio.infrastructure.repository.RestaurantRepository
import com.veg.bio.restaurant.domain.Availability
import com.veg.bio.restaurant.domain.MeetingRoom
import com.veg.bio.restaurant.domain.NameRestaurant
import com.veg.bio.restaurant.domain.Restaurant
import com.veg.bio.restaurant.mapper.MapperRestaurant
import org.springframework.stereotype.Service
import java.util.UUID
import kotlin.jvm.optionals.getOrElse


@Service
class RestaurantService(
    private val restaurantRepository: RestaurantRepository,
) {


    fun saveRestaurant(restaurant: Restaurant) {
        checkIfTheNameExist(restaurant.name)
        verifyIsNameSameForMeetingRooms(restaurant.meetingRooms)

        val restaurantEntity = MapperRestaurant.toEntity(restaurant)
        restaurantRepository.save(restaurantEntity)
    }

    fun findAllRestaurant(): List<Restaurant> {
        return restaurantRepository.findAll().stream().map { MapperRestaurant.toDomain(it) }.toList()
    }

    fun findAvailabilityById(id: UUID):  Availability {
        val restaurant = restaurantRepository.findById(id).getOrElse { throw RestaurantNotFound() }
        return MapperRestaurant.toDomain(restaurant, restaurant.id).availability
    }


    fun findOneRestaurant(id: UUID): Restaurant {
        val restaurant = restaurantRepository.findById(id).getOrElse { throw RestaurantNotFound() }
        return MapperRestaurant.toDomain(restaurant, restaurant.id)
    }


    private fun checkIfTheNameExist(nameRestaurant: NameRestaurant) {
        if (restaurantRepository.findByNameRestaurant(nameRestaurant) != null) {
            throw RestaurantNameExistError()
        }
    }

    private fun verifyIsNameSameForMeetingRooms(meetingRooms: List<MeetingRoom>){
        val verifyNameOfRoom = meetingRooms
            .groupingBy { it.name }
            .eachCount()
            .filter { it.value > 1 }.isNotEmpty()
        if (verifyNameOfRoom) throw RestaurantHasMeetingRoomSameName()

    }
}