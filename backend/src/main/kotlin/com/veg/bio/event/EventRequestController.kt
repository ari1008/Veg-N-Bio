package com.veg.bio.event
import com.veg.bio.annotation.CurrentUserId
import com.veg.bio.event.domain.EventRequest
import com.veg.bio.event.dto.CreateEventRequestDto
import com.veg.bio.event.dto.UpdateEventRequestStatusDto
import com.veg.bio.infrastructure.table.EventRequestStatus
import com.veg.bio.keycloak.ROLE_RESTAURANT_OWNER
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import java.util.*

@RestController
@RequestMapping("/api/event-requests")
class EventRequestController(
    private val eventRequestService: EventRequestService
) {

    @PostMapping
    @PreAuthorize("hasRole(\"${ROLE_RESTAURANT_OWNER}\")")
    fun createEventRequest(
        @Valid @RequestBody request: CreateEventRequestDto,
        @CurrentUserId ownerClientId: String
    ): ResponseEntity<EventRequest> {
        val eventRequest = eventRequestService.createEventRequest(request, ownerClientId)
        return ResponseEntity.status(HttpStatus.CREATED).body(eventRequest)
    }

    @GetMapping("/restaurant/{restaurantId}")
    @PreAuthorize("hasRole(\"${ROLE_RESTAURANT_OWNER}\")")
    fun getRestaurantEventRequests(
        @PathVariable restaurantId: UUID,
        @CurrentUserId ownerClientId: String
    ): ResponseEntity<List<EventRequest>> {
        val eventRequests = eventRequestService.getRestaurantEventRequests(ownerClientId, restaurantId)
        return ResponseEntity.ok(eventRequests)
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole(\"${ROLE_RESTAURANT_OWNER}\")")
    fun getAllMyEventRequests(
        @CurrentUserId ownerClientId: String
    ): ResponseEntity<List<EventRequest>> {
        val eventRequests = eventRequestService.getRestaurantEventRequests(ownerClientId)
        return ResponseEntity.ok(eventRequests)
    }

    @GetMapping("/customer/{customerId}")
    @PreAuthorize("hasRole(\"${ROLE_RESTAURANT_OWNER}\")")
    fun getCustomerEventRequests(
        @PathVariable customerId: UUID
    ): ResponseEntity<List<EventRequest>> {
        val eventRequests = eventRequestService.getCustomerEventRequests(customerId)
        return ResponseEntity.ok(eventRequests)
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole(\"${ROLE_RESTAURANT_OWNER}\")")
    fun updateEventRequestStatus(
        @PathVariable id: UUID,
        @Valid @RequestBody request: UpdateEventRequestStatusDto,
        @CurrentUserId ownerClientId: String
    ): ResponseEntity<EventRequest> {
        val status = EventRequestStatus.valueOf(request.status)
        val eventRequest = eventRequestService.updateEventRequestStatus(id, status, ownerClientId)
        return ResponseEntity.ok(eventRequest)
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole(\"${ROLE_RESTAURANT_OWNER}\")")
    fun cancelEventRequest(
        @PathVariable id: UUID,
        @CurrentUserId ownerClientId: String
    ): ResponseEntity<EventRequest> {
        val eventRequest = eventRequestService.cancelEventRequest(id, ownerClientId)
        return ResponseEntity.ok(eventRequest)
    }
}