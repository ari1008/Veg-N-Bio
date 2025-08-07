package com.veg.bio.restaurant

import com.veg.bio.restaurant.domain.Restaurant
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController


@RestController
@RequestMapping("/api/notprotected/restaurant")
class RestaurantNotProtectedController(
    private val restaurantService: RestaurantService,
) {


    @GetMapping
    fun getAllRestaurant(): List<Restaurant>{
        val restaurants = restaurantService.findAllRestaurant()
        return restaurants
    }
}