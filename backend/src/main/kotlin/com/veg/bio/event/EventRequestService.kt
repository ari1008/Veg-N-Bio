package com.veg.bio.event

import com.veg.bio.event.domain.EventRequest
import com.veg.bio.event.domain.ValidationException
import com.veg.bio.event.dto.CreateEventRequestDto
import com.veg.bio.event.mapper.EventRequestMapper
import com.veg.bio.infrastructure.repository.EventRequestRepository
import com.veg.bio.infrastructure.repository.ReservationRepository
import com.veg.bio.infrastructure.repository.RestaurantRepository
import com.veg.bio.infrastructure.repository.UserRepository
import com.veg.bio.infrastructure.repository.MeetingRoomRepository
import com.veg.bio.infrastructure.table.*
import com.veg.bio.keycloak.Role
import com.veg.bio.reservation.*
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.time.Duration
import java.util.*

@Service
@Transactional
class EventRequestService(
    private val eventRequestRepository: EventRequestRepository,
    private val reservationRepository: ReservationRepository,
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

        validateEventDates(request.startTime, request.endTime)
        validateOpeningHours(restaurant, request.startTime, request.endTime)

        val meetingRoom = request.meetingRoomId?.let { roomId ->
            meetingRoomRepository.findById(roomId)
                .orElseThrow { throw RuntimeException("Salle de réunion non trouvée") }
        }

        validateCapacity(request, restaurant, meetingRoom)
        validateAvailability(request)

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

    private fun validateEventDates(startTime: LocalDateTime, endTime: LocalDateTime) {
        if (startTime.isBefore(LocalDateTime.now())) {
            throw ValidationException("La date de début ne peut pas être dans le passé")
        }

        if (endTime.isBefore(startTime) || endTime.isEqual(startTime)) {
            throw ValidationException("La date de fin doit être après la date de début")
        }

        val duration = Duration.between(startTime, endTime)
        if (duration.toHours() > 24) {
            throw ValidationException("Un événement ne peut pas durer plus de 24 heures")
        }

        if (duration.toMinutes() < 30) {
            throw ValidationException("Un événement doit durer au moins 30 minutes")
        }
    }

    private fun validateOpeningHours(restaurant: RestaurantEntity, startTime: LocalDateTime, endTime: LocalDateTime) {
        val dayOfWeek = startTime.dayOfWeek
        val startHour = startTime.toLocalTime()
        val endHour = endTime.toLocalTime()

        val openingHour = restaurant.openingHours.find { it.dayOfWeek == dayOfWeek }
            ?: throw RestaurantClosedException("Le restaurant est fermé le ${dayOfWeek.name}")

        if (startHour.isBefore(openingHour.startTime) || endHour.isAfter(openingHour.endTime)) {
            throw RestaurantClosedException(
                "Le restaurant est ouvert de ${openingHour.startTime} à ${openingHour.endTime} le ${dayOfWeek.name}"
            )
        }
    }


    private fun validateCapacity(request: CreateEventRequestDto, restaurant: RestaurantEntity, meetingRoom: MeetingRomEntity?) {
        if (meetingRoom != null) {
            if (request.numberOfPeople > meetingRoom.numberMettingPlace.value) {
                throw InsufficientCapacityException(
                    "Trop de participants pour cette salle (max: ${meetingRoom.numberMettingPlace}, demandé: ${request.numberOfPeople})"
                )
            }
        } else {
            if (request.numberOfPeople > restaurant.numberOfPlace.value) {
                throw InsufficientCapacityException(
                    "Trop de participants pour ce restaurant (max: ${restaurant.numberOfPlace.value}, demandé: ${request.numberOfPeople})"
                )
            }
        }
    }

    private fun validateAvailability(request: CreateEventRequestDto) {
        checkReservationConflicts(request)

        checkEventConflicts(request)
    }

    private fun checkReservationConflicts(request: CreateEventRequestDto) {
        if (request.meetingRoomId != null) {
            val roomConflicts = reservationRepository.findConflictingReservations(
                request.restaurantId,
                request.meetingRoomId,
                request.startTime,
                request.endTime
            )
            if (roomConflicts.isNotEmpty()) {
                throw ReservationConflictException("Cette salle est déjà réservée sur ce créneau (réservation)")
            }
        } else {
            val anyReservationConflicts = reservationRepository.findConflictingReservations(
                request.restaurantId,
                null,
                request.startTime,
                request.endTime
            )
            if (anyReservationConflicts.isNotEmpty()) {
                throw ReservationConflictException("Des réservations existent déjà sur ce créneau")
            }
        }

        val fullRestaurantConflicts = reservationRepository.findConflictingFullRestaurantReservations(
            request.restaurantId,
            request.startTime,
            request.endTime
        )
        if (fullRestaurantConflicts.isNotEmpty()) {
            throw ReservationConflictException("Le restaurant complet est déjà réservé sur ce créneau")
        }
    }

    private fun checkEventConflicts(request: CreateEventRequestDto) {
        if (request.meetingRoomId != null) {
            val roomEventConflicts = eventRequestRepository.findConflictingEventRequests(
                request.meetingRoomId,
                request.startTime,
                request.endTime
            )
            if (roomEventConflicts.isNotEmpty()) {
                throw ReservationConflictException("Cette salle a déjà un événement prévu sur ce créneau")
            }
        } else {
            val restaurantEventConflicts = eventRequestRepository.findConflictingRestaurantEvents(
                request.restaurantId,
                request.startTime,
                request.endTime
            )
            if (restaurantEventConflicts.isNotEmpty()) {
                throw ReservationConflictException("Un événement est déjà prévu dans ce restaurant sur ce créneau")
            }
        }
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
        var basePrice = 50.0
        val hours = java.time.Duration.between(request.startTime, request.endTime).toHours().toDouble()

        var totalPrice = basePrice * hours

        meetingRoom?.let {
            totalPrice += 20.0 * hours
        }

        totalPrice += request.numberOfPeople * 5.0

        return totalPrice
    }
}
