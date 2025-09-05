package com.veg.bio.reservation.dto

import com.veg.bio.infrastructure.table.ReservationStatus
import jakarta.validation.constraints.NotNull

data class UpdateReservationStatusDto(
    @field:NotNull(message = "Le statut est requis")
    val status: ReservationStatus
)
