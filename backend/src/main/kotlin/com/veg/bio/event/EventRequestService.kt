package com.veg.bio.event
import com.veg.bio.event.domain.EventRequest
import com.veg.bio.event.dto.CreateEventRequestDto
import com.veg.bio.event.mapper.EventRequestMapper
import com.veg.bio.infrastructure.repository.EventRequestRepository
import com.veg.bio.infrastructure.repository.RestaurantRepository
import com.veg.bio.infrastructure.repository.UserRepository
import com.veg.bio.infrastructure.repository.MeetingRoomRepository
import com.veg.bio.infrastructure.table.*
import com.veg.bio.keycloak.Role
import com.veg.bio.reservation.*
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.*

@Service
@Transactional
class EventRequestService(
    private val eventRequestRepository: EventRequestRepository,
    private val restaurantRepository: RestaurantRepository,
    private val userRepository: UserRepository,
    private val meetingRoomRepository: MeetingRoomRepository
) {

    fun createEventRequest(request: CreateEventRequestDto, ownerClientId: String): EventRequest {
        val owner = userRepository.findByClientId(ownerClientId)
            ?: throw CustomerNotFoundException("Utilisateur non trouvé")

        if (owner.role != Role.RESTAURANT_OWNER) {
            throw UnauthorizedReservationAccessException("Seuls les propriétaires de restaurant peuvent créer des demandes d'événements")
        }

        val customer = userRepository.findById(request.customerId)
            .orElseThrow { CustomerNotFoundException("Client non trouvé") }

        val restaurant = restaurantRepository.findById(request.restaurantId)
            .orElseThrow { RestaurantNotFoundException() }

        val meetingRoom = request.meetingRoomId?.let { roomId ->
            meetingRoomRepository.findById(roomId)
                .orElseThrow { throw RuntimeException("Salle de réunion non trouvée") }
        }

        val estimatedPrice = calculateEventPrice(request, restaurant, meetingRoom)

        val eventRequestEntity = EventRequestEntity(
            customer = customer,
            restaurant = restaurant,
            meetingRoom = meetingRoom,
            type = EventType.valueOf(request.type),
            startTime = request.startTime,
            endTime = request.endTime,
            numberOfPeople = request.numberOfPeople,
            title = request.title,
            description = request.description,
            contactPhone = request.contactPhone,
            specialRequests = request.specialRequests,
            estimatedPrice = estimatedPrice
        )

        val savedEventRequest = eventRequestRepository.save(eventRequestEntity)
        return EventRequestMapper.toDomain(savedEventRequest)
    }

    @Transactional(readOnly = true)
    fun getRestaurantEventRequests(ownerClientId: String, restaurantId: UUID? = null): List<EventRequest> {
        val owner = userRepository.findByClientId(ownerClientId)
            ?: throw CustomerNotFoundException("Utilisateur non trouvé")

        if (owner.role != Role.RESTAURANT_OWNER) {
            throw UnauthorizedReservationAccessException("Accès non autorisé")
        }

        return if (restaurantId != null) {
            eventRequestRepository.findByRestaurantIdOrderByCreatedAtDesc(restaurantId)
                .map { EventRequestMapper.toDomain(it) }
        } else {
            eventRequestRepository.findAllByOrderByCreatedAtDesc()
                .map { EventRequestMapper.toDomain(it) }
        }
    }

    @Transactional(readOnly = true)
    fun getCustomerEventRequests(customerId: UUID): List<EventRequest> {
        return eventRequestRepository.findByCustomerIdOrderByCreatedAtDesc(customerId)
            .map { EventRequestMapper.toDomain(it) }
    }

    fun updateEventRequestStatus(eventRequestId: UUID, newStatus: EventRequestStatus, ownerClientId: String): EventRequest {
        val owner = userRepository.findByClientId(ownerClientId)
            ?: throw CustomerNotFoundException("Utilisateur non trouvé")

        if (owner.role != Role.RESTAURANT_OWNER) {
            throw UnauthorizedReservationAccessException("Accès non autorisé")
        }

        val eventRequest = eventRequestRepository.findById(eventRequestId)
            .orElseThrow { RuntimeException("Demande d'événement non trouvée") }

        val updatedEventRequest = eventRequest.copy(status = newStatus)
        val savedEventRequest = eventRequestRepository.save(updatedEventRequest)

        return EventRequestMapper.toDomain(savedEventRequest)
    }

    fun cancelEventRequest(eventRequestId: UUID, ownerClientId: String): EventRequest {
        return updateEventRequestStatus(eventRequestId, EventRequestStatus.CANCELLED, ownerClientId)
    }

    private fun calculateEventPrice(request: CreateEventRequestDto, restaurant: RestaurantEntity, meetingRoom: MeetingRomEntity?): Double {
        // Logique simple de calcul de prix pour les événements
        var basePrice = 50.0 // Prix de base par heure
        val hours = java.time.Duration.between(request.startTime, request.endTime).toHours()

        var totalPrice = basePrice * hours

        // Supplément pour salle de réunion si nécessaire
        meetingRoom?.let {
            totalPrice += 20.0 * hours
        }

        // Supplément par personne
        totalPrice += request.numberOfPeople * 5.0

        return totalPrice
    }
}
