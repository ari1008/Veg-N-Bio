package com.veg.bio.reservation

import com.veg.bio.annotation.CurrentUserId
import com.veg.bio.keycloak.ROLE_RESTAURANT_OWNER
import com.veg.bio.reservation.domain.Reservation
import com.veg.bio.reservation.dto.CreateReservationDto
import com.veg.bio.reservation.dto.UpdateReservationStatusDto
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import java.util.*

@RestController
@RequestMapping("/api/reservations")
class ReservationController(
    private val reservationService: ReservationService
) {

    @PostMapping
    @PreAuthorize("hasRole(\"${ROLE_RESTAURANT_OWNER}\")")
    fun createReservation(
        @Valid @RequestBody request: CreateReservationDto,
        @CurrentUserId ownerClientId: String
    ): ResponseEntity<Reservation> {
        val reservation = reservationService.createReservation(request, ownerClientId)
        return ResponseEntity.status(HttpStatus.CREATED).body(reservation)
    }

    @GetMapping("/restaurant/{restaurantId}")
    @PreAuthorize("hasRole(\"${ROLE_RESTAURANT_OWNER}\")")
    fun getRestaurantReservations(
        @PathVariable restaurantId: UUID,
        @CurrentUserId ownerClientId: String
    ): ResponseEntity<List<Reservation>> {
        val reservations = reservationService.getRestaurantReservations(ownerClientId, restaurantId)
        return ResponseEntity.ok(reservations)
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole(\"${ROLE_RESTAURANT_OWNER}\")")
    fun getAllMyReservations(
        @CurrentUserId ownerClientId: String
    ): ResponseEntity<List<Reservation>> {
        val reservations = reservationService.getRestaurantReservations(ownerClientId)
        return ResponseEntity.ok(reservations)
    }

    @GetMapping("/customer/{customerId}")
    @PreAuthorize("hasRole(\"${ROLE_RESTAURANT_OWNER}\")")
    fun getCustomerReservations(
        @PathVariable customerId: UUID
    ): ResponseEntity<List<Reservation>> {
        val reservations = reservationService.getCustomerReservations(customerId)
        return ResponseEntity.ok(reservations)
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole(\"${ROLE_RESTAURANT_OWNER}\")")
    fun updateReservationStatus(
        @PathVariable id: UUID,
        @Valid @RequestBody request: UpdateReservationStatusDto,
        @CurrentUserId ownerClientId: String
    ): ResponseEntity<Reservation> {
        val reservation = reservationService.updateReservationStatus(id, request.status, ownerClientId)
        return ResponseEntity.ok(reservation)
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole(\"${ROLE_RESTAURANT_OWNER}\")")
    fun cancelReservation(
        @PathVariable id: UUID,
        @CurrentUserId ownerClientId: String
    ): ResponseEntity<Reservation> {
        val reservation = reservationService.cancelReservation(id, ownerClientId)
        return ResponseEntity.ok(reservation)
    }
}

