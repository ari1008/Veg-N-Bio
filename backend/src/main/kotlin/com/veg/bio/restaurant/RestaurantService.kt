package com.veg.bio.restaurant

import com.veg.bio.infrastructure.repository.RestaurantRepository
import com.veg.bio.restaurant.domain.*
import com.veg.bio.restaurant.dto.OpeningDto
import com.veg.bio.restaurant.dto.UpdateMeetingRoomsDto
import com.veg.bio.restaurant.dto.UpdateRestaurantFeaturesRequest
import com.veg.bio.restaurant.mapper.MapperRestaurant
import org.springframework.stereotype.Service
import java.time.DayOfWeek
import java.util.*
import kotlin.jvm.optionals.getOrElse


@Service
class RestaurantService(
    private val restaurantRepository: RestaurantRepository,
) {


    fun saveRestaurant(restaurant: Restaurant) {
        checkIfTheNameExist(restaurant.name)
        verifyIsNameSameForMeetingRooms(restaurant.meetingRooms)
        verificationGoodAvailability(restaurant.availability)

        val restaurantEntity = MapperRestaurant.toEntity(restaurant)
        restaurantRepository.save(restaurantEntity)
    }

    fun findAllRestaurant(): List<Restaurant> {
        return restaurantRepository.findAll().stream().map { MapperRestaurant.toDomain(it, it.id) }.toList()
    }

    fun findAvailabilityById(id: UUID): Availability {
        val restaurant = restaurantRepository.findById(id).getOrElse { throw RestaurantNotFound() }
        return MapperRestaurant.toDomain(restaurant, restaurant.id).availability
    }


    fun findOneRestaurant(id: UUID): Restaurant {
        val restaurant = restaurantRepository.findById(id).getOrElse { throw RestaurantNotFound() }
        return MapperRestaurant.toDomain(restaurant, restaurant.id)
    }

    fun updateFeature(
        id: UUID,
        updateRestaurantFeaturesRequest: UpdateRestaurantFeaturesRequest
    ): Set<RestaurantFeature> {
        val restaurant = restaurantRepository.findById(id).getOrElse { throw RestaurantNotFound() }
        val updatedFeatures = restaurant.features
            .plus(updateRestaurantFeaturesRequest.featuresToAdd)
            .minus(updateRestaurantFeaturesRequest.featuresToRemove)

        val updatedRestaurant = restaurant.copy(features = updatedFeatures)
        return restaurantRepository.save(updatedRestaurant).features
    }

    fun updateHourOfOpening(id: UUID, openingDto: OpeningDto): Map<DayOfWeek, TimeRange> {
        val restaurant = restaurantRepository.findById(id).getOrElse { throw RestaurantNotFound() }
        val openingHour = MapperRestaurant.mapHourOpening(Availability(openingDto.openingHours))
        val updatedRestaurant = restaurant.copy(openingHours = openingHour)
        restaurantRepository.save(updatedRestaurant)
        return openingDto.openingHours
    }


    private fun checkIfTheNameExist(nameRestaurant: NameRestaurant) {
        if (restaurantRepository.findByNameRestaurant(nameRestaurant) != null) {
            throw RestaurantNameExistError()
        }
    }

    fun updateMeetingRooms(id: UUID, request: UpdateMeetingRoomsDto): List<MeetingRoom> {
        val restaurant = restaurantRepository.findById(id)
            .orElseThrow { RestaurantNotFound() }

        val currentRooms = restaurant.meetingRoms

        val namesToRemove = request.roomsToRemove
            .map { MapperRestaurant.mapMeeting(it).name }
            .toSet()

        val filteredRooms = currentRooms.filterNot { it.name in namesToRemove }

        val roomsToAdd = request.roomsToAdd
            .distinctBy { it.name }
            .map { MapperRestaurant.mapMeeting(it) }
            .filterNot { new -> filteredRooms.any { it.name == new.name } }


        val updatedRooms = (filteredRooms.filterNot { it.name in roomsToAdd.map { r -> r.name } }) + roomsToAdd


        val updatedRestaurant = restaurant.copy(meetingRoms = updatedRooms)
        return restaurantRepository
            .save(updatedRestaurant)
            .meetingRoms
            .stream()
            .map { MapperRestaurant.mapMeetingRoom(it) }.toList()
    }


    private fun verifyIsNameSameForMeetingRooms(meetingRooms: List<MeetingRoom>) {
        val verifyNameOfRoom = meetingRooms
            .groupingBy { it.name }
            .eachCount()
            .filter { it.value > 1 }.isNotEmpty()
        if (verifyNameOfRoom) throw RestaurantHasMeetingRoomSameName()

    }


    private fun verificationGoodAvailability(availability: Availability){
        availability.openingHours.forEach {
            if (it.value.start > it.value.end) throw NotGoodAvailability()
        }
    }
}