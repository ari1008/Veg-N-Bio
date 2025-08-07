package com.veg.bio.restaurant

import com.veg.bio.restaurant.domain.Availability
import com.veg.bio.restaurant.domain.Restaurant
import com.veg.bio.restaurant.domain.RestaurantFeature
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.*


@RestController
@RequestMapping("/api/notprotected/restaurant")
class RestaurantNotProtectedController(
    private val restaurantService: RestaurantService,
) {


    @GetMapping
    fun getAllRestaurant(): ResponseEntity<List<Restaurant>> {
        val restaurants = restaurantService.findAllRestaurant()
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(restaurants)
    }

    @GetMapping("{id}")
    fun getOneRestaurant(
        @PathVariable id: UUID,
    ): ResponseEntity<Restaurant> {
        val restaurant = restaurantService.findOneRestaurant(id)
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(restaurant)
    }

    @GetMapping("/features")
    fun getAllFeatures(): ResponseEntity<List<String>> {
        val listFeature = RestaurantFeature.entries.map { it.name }
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(listFeature)
    }


    @GetMapping("/availability/{id}")
    fun getAvailability(
        @PathVariable id: UUID,
    ): ResponseEntity<Availability>{
        val availability =  restaurantService.findAvailabilityById(id)
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(availability)
    }
}