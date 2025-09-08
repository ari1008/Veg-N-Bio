package com.veg.bio.event.dto

import jakarta.validation.constraints.*
import java.time.LocalDateTime
import java.util.*

data class CreateEventRequestDto(
    @field:NotNull(message = "L'ID du client est requis")
    val customerId: UUID,

    @field:NotNull(message = "L'ID du restaurant est requis")
    val restaurantId: UUID,

    val meetingRoomId: UUID? = null,

    @field:NotBlank(message = "Le type d'événement est requis")
    val type: String,

    @field:NotNull(message = "L'heure de début est requise")
    val startTime: LocalDateTime,

    @field:NotNull(message = "L'heure de fin est requise")
    val endTime: LocalDateTime,

    @field:Min(value = 1, message = "Au moins 1 personne requis")
    @field:Max(value = 500, message = "Maximum 500 personnes")
    val numberOfPeople: Int,

    @field:NotBlank(message = "Le titre est requis")
    @field:Size(max = 200, message = "Le titre ne peut pas dépasser 200 caractères")
    val title: String,

    @field:Size(max = 2000, message = "La description ne peut pas dépasser 2000 caractères")
    val description: String? = null,

    @field:Pattern(regexp = "^$|^[+]?[0-9]{10,15}$", message = "Format de téléphone invalide")
    val contactPhone: String? = null,

    @field:Size(max = 1000, message = "Les demandes spéciales ne peuvent pas dépasser 1000 caractères")
    val specialRequests: String? = null
)

data class UpdateEventRequestStatusDto(
    @field:NotBlank(message = "Le statut est requis")
    val status: String
)
