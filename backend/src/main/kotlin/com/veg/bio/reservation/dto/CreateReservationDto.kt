package com.veg.bio.reservation.dto

import com.veg.bio.infrastructure.table.ReservationType
import jakarta.validation.constraints.*
import java.time.LocalDateTime
import java.util.*

data class CreateReservationDto(
    @field:NotNull(message = "L'ID du client est requis")
    val customerId: UUID,

    @field:NotNull(message = "L'ID du restaurant est requis")
    val restaurantId: UUID,

    val meetingRoomId: UUID? = null,

    @field:NotNull(message = "Le type de réservation est requis")
    val type: ReservationType,

    @field:NotNull(message = "L'heure de début est requise")
    @field:Future(message = "L'heure de début doit être dans le futur")
    val startTime: LocalDateTime,

    @field:NotNull(message = "L'heure de fin est requise")
    val endTime: LocalDateTime,

    @field:Min(value = 1, message = "Il faut au moins 1 personne")
    @field:Max(value = 200, message = "Maximum 200 personnes")
    val numberOfPeople: Int,

    @field:Size(max = 1000, message = "Les notes ne peuvent pas dépasser 1000 caractères")
    val notes: String? = null
) {
    init {
        require(endTime.isAfter(startTime)) {
            "L'heure de fin doit être après l'heure de début"
        }

        if (type == ReservationType.MEETING_ROOM) {
            requireNotNull(meetingRoomId) {
                "L'ID de la salle de réunion est requis pour ce type de réservation"
            }
        }
    }
}