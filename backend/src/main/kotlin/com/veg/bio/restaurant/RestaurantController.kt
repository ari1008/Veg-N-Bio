package com.veg.bio.restaurant

import com.veg.bio.keycloak.ROLE_RESTAURANT_OWNER
import com.veg.bio.restaurant.domain.MeetingRoom
import com.veg.bio.restaurant.domain.Restaurant
import com.veg.bio.restaurant.domain.RestaurantFeature
import com.veg.bio.restaurant.domain.TimeRange
import com.veg.bio.restaurant.dto.OpeningDto
import com.veg.bio.restaurant.dto.UpdateMeetingRoomsDto
import com.veg.bio.restaurant.dto.UpdateRestaurantFeaturesRequest
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import java.time.DayOfWeek
import java.util.*

@RestController
@RequestMapping("/api/restaurant")
class RestaurantController(
    private val restaurantService: RestaurantService,
) {


    @PostMapping
    @PreAuthorize("hasRole(\"${ROLE_RESTAURANT_OWNER}\")")
    fun createRestaurant(@RequestBody restaurant: Restaurant): ResponseEntity<Map<String, String>> {
        restaurantService.saveRestaurant(restaurant)
        return ResponseEntity.status(HttpStatus.CREATED).body(mapOf("success" to "good"))
    }

    @PatchMapping("/api/restaurant/{id}/features")
    @PreAuthorize("hasRole(\"${ROLE_RESTAURANT_OWNER}\")")
    fun modifyFeatures(
        id: UUID,
        @RequestBody updateRestaurantFeaturesRequest: UpdateRestaurantFeaturesRequest
    ): ResponseEntity<Set<RestaurantFeature>> {
        val features = restaurantService.updateFeature(id, updateRestaurantFeaturesRequest)
        return ResponseEntity.status(HttpStatus.CREATED).body(features)
    }


    @PatchMapping("/api/restaurant/{id}/opening")
    @PreAuthorize("hasRole(\"${ROLE_RESTAURANT_OWNER}\")")
    fun updateOpeningHour(
        id: UUID,
        @RequestBody openingDto: OpeningDto,
    ): ResponseEntity<Map<DayOfWeek, TimeRange>> {
        val openingHour = restaurantService.updateHourOfOpening(id, openingDto)
        return ResponseEntity.status(HttpStatus.CREATED).body(openingHour)
    }


    @PatchMapping("/api/restaurant/{id}/meetingRooms")
    @PreAuthorize("hasRole(\"${ROLE_RESTAURANT_OWNER}\")")
    fun updateMeetingRooms(
        id: UUID,
        @RequestBody updateMeetingRoomsDto: UpdateMeetingRoomsDto,
    ): ResponseEntity<List<MeetingRoom>> {
        val updateMeetingHour = restaurantService.updateMeetingRooms(id, updateMeetingRoomsDto)
        return ResponseEntity.status(HttpStatus.CREATED).body(updateMeetingHour)
    }

}