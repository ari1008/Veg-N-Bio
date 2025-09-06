package com.veg.bio.reservation

import com.veg.bio.infrastructure.repository.ReservationRepository
import com.veg.bio.infrastructure.repository.RestaurantRepository
import com.veg.bio.infrastructure.repository.UserRepository
import com.veg.bio.infrastructure.table.*
import com.veg.bio.keycloak.Role
import com.veg.bio.reservation.domain.Reservation
import com.veg.bio.reservation.dto.CreateReservationDto
import com.veg.bio.reservation.mapper.ReservationMapper
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.util.*

@Service
@Transactional
class ReservationService(
    private val reservationRepository: ReservationRepository,
    private val restaurantRepository: RestaurantRepository,
    private val userRepository: UserRepository
) {

    fun createReservation(request: CreateReservationDto, ownerClientId: String): Reservation {
        val owner = userRepository.findByClientId(ownerClientId)
            ?: throw CustomerNotFoundException("Utilisateur non trouvé")

        if (owner.role != Role.RESTAURANT_OWNER) {
            throw UnauthorizedReservationAccessException("Seuls les propriétaires de restaurant peuvent créer des réservations")
        }

        val customer = userRepository.findById(request.customerId)
            .orElseThrow { CustomerNotFoundException("Client non trouvé") }

        val restaurant = restaurantRepository.findById(request.restaurantId)
            .orElseThrow { RestaurantNotFoundException() }


        validateOpeningHours(restaurant, request.startTime, request.endTime)

        validateAvailability(request)

        val meetingRoom = validateCapacityAndGetRoom(restaurant, request)

        val totalPrice = calculatePrice(request, restaurant, meetingRoom)

        val reservationEntity = ReservationEntity(
            customer = customer,
            restaurant = restaurant,
            meetingRoom = meetingRoom,
            type = request.type,
            startTime = request.startTime,
            endTime = request.endTime,
            numberOfPeople = request.numberOfPeople,
            notes = request.notes,
            totalPrice = totalPrice
        )

        val savedReservation = reservationRepository.save(reservationEntity)
        return ReservationMapper.toDomain(savedReservation)
    }

    @Transactional(readOnly = true)
    fun getRestaurantReservations(ownerClientId: String, restaurantId: UUID? = null): List<Reservation> {
        val owner = userRepository.findByClientId(ownerClientId)
            ?: throw CustomerNotFoundException("Utilisateur non trouvé")

        if (owner.role != Role.RESTAURANT_OWNER) {
            throw UnauthorizedReservationAccessException("Accès non autorisé")
        }

        return if (restaurantId != null) {
            reservationRepository.findByRestaurantIdOrderByCreatedAtDesc(restaurantId)
                .map { ReservationMapper.toDomain(it) }
        } else {

            reservationRepository.findAllByOrderByCreatedAtDesc()
                .map { ReservationMapper.toDomain(it) }
        }
    }

    @Transactional(readOnly = true)
    fun getCustomerReservations(customerId: UUID): List<Reservation> {
        return reservationRepository.findByCustomerIdOrderByCreatedAtDesc(customerId)
            .map { ReservationMapper.toDomain(it) }
    }

    fun updateReservationStatus(reservationId: UUID, newStatus: ReservationStatus, ownerClientId: String): Reservation {
        val owner = userRepository.findByClientId(ownerClientId)
            ?: throw CustomerNotFoundException("Utilisateur non trouvé")

        if (owner.role != Role.RESTAURANT_OWNER) {
            throw UnauthorizedReservationAccessException("Seuls les propriétaires peuvent modifier le statut")
        }

        val reservation = reservationRepository.findById(reservationId)
            .orElseThrow { ReservationNotFoundException() }

        validateStatusTransition(reservation.status, newStatus)

        val updatedReservation = reservation.copy(status = newStatus)
        val savedReservation = reservationRepository.save(updatedReservation)
        return ReservationMapper.toDomain(savedReservation)
    }

    fun cancelReservation(reservationId: UUID, ownerClientId: String): Reservation {
        return updateReservationStatus(reservationId, ReservationStatus.CANCELLED, ownerClientId)
    }

    private fun validateStatusTransition(currentStatus: ReservationStatus, newStatus: ReservationStatus) {
        val validTransitions = mapOf(
            ReservationStatus.PENDING to listOf(ReservationStatus.CONFIRMED, ReservationStatus.CANCELLED),
            ReservationStatus.CONFIRMED to listOf(ReservationStatus.COMPLETED, ReservationStatus.CANCELLED),
            ReservationStatus.CANCELLED to emptyList(),
            ReservationStatus.COMPLETED to emptyList()
        )

        if (newStatus !in validTransitions[currentStatus].orEmpty()) {
            throw InvalidReservationStateTransitionException(
                "Transition invalide de $currentStatus vers $newStatus"
            )
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

    private fun validateAvailability(request: CreateReservationDto) {
        when (request.type) {
            ReservationType.RESTAURANT_FULL -> {
                val conflicts = reservationRepository.findConflictingFullRestaurantReservations(
                    request.restaurantId, request.startTime, request.endTime
                )
                if (conflicts.isNotEmpty()) {
                    throw ReservationConflictException("Le restaurant est déjà réservé sur ce créneau")
                }

                val roomConflicts = reservationRepository.findConflictingReservations(
                    request.restaurantId, null, request.startTime, request.endTime
                )
                if (roomConflicts.isNotEmpty()) {
                    throw ReservationConflictException("Des salles sont déjà réservées sur ce créneau")
                }
            }

            ReservationType.MEETING_ROOM -> {
                val fullRestaurantConflicts = reservationRepository.findConflictingFullRestaurantReservations(
                    request.restaurantId, request.startTime, request.endTime
                )
                if (fullRestaurantConflicts.isNotEmpty()) {
                    throw ReservationConflictException("Le restaurant complet est réservé sur ce créneau")
                }

                val roomConflicts = reservationRepository.findConflictingReservations(
                    request.restaurantId, request.meetingRoomId, request.startTime, request.endTime
                )
                if (roomConflicts.isNotEmpty()) {
                    throw ReservationConflictException("Cette salle est déjà réservée sur ce créneau")
                }
            }
        }
    }

    private fun validateCapacityAndGetRoom(
        restaurant: RestaurantEntity,
        request: CreateReservationDto
    ): MeetingRomEntity? {
        return when (request.type) {
            ReservationType.RESTAURANT_FULL -> {
                if (request.numberOfPeople > restaurant.numberOfPlace.value) {
                    throw InsufficientCapacityException(
                        "Le restaurant peut accueillir maximum ${restaurant.numberOfPlace.value} personnes"
                    )
                }
                null
            }

            ReservationType.MEETING_ROOM -> {
                val meetingRoom = restaurant.meetingRoms.find { it.id == request.meetingRoomId }
                    ?: throw MeetingRoomNotFoundException()

                if (!meetingRoom.isReservable) {
                    throw IllegalStateException("Cette salle n'est pas réservable")
                }

                if (request.numberOfPeople > meetingRoom.numberMettingPlace.value) {
                    throw InsufficientCapacityException(
                        "Cette salle peut accueillir maximum ${meetingRoom.numberMettingPlace.value} personnes"
                    )
                }

                meetingRoom
            }
        }
    }

    private fun calculatePrice(
        request: CreateReservationDto,
        restaurant: RestaurantEntity,
        meetingRoom: MeetingRomEntity?
    ): Double {
        val basePrice = when (request.type) {
            ReservationType.RESTAURANT_FULL -> 500.0
            ReservationType.MEETING_ROOM -> 100.0
        }

        val durationHours = java.time.Duration.between(request.startTime, request.endTime).toHours()
        val peopleMultiplier = when {
            request.numberOfPeople <= 10 -> 1.0
            request.numberOfPeople <= 50 -> 1.5
            else -> 2.0
        }

        return basePrice * durationHours * peopleMultiplier
    }
}
