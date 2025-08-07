package com.veg.bio.restaurant

import com.veg.bio.keycloak.ROLE_RESTAURANT_OWNER
import com.veg.bio.restaurant.domain.Restaurant
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

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
}