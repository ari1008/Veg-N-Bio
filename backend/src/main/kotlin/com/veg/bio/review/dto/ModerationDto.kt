package com.veg.bio.review.dto

import com.veg.bio.infrastructure.table.ReviewStatus
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size

data class ModerationDto(
    @field:NotNull(message = "Le statut est requis")
    val status: ReviewStatus,

    @field:Size(max = 500, message = "La raison ne peut pas dépasser 500 caractères")
    val reason: String? = null
) {
    init {
        require(status in listOf(ReviewStatus.APPROVED, ReviewStatus.REJECTED)) {
            "Le statut doit être APPROVED ou REJECTED"
        }
        if (status == ReviewStatus.REJECTED) {
            require(!reason.isNullOrBlank()) { "Une raison est requise pour rejeter un avis" }
        }
    }
}
