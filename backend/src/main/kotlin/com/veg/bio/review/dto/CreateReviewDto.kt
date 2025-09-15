package com.veg.bio.review.dto

import com.veg.bio.infrastructure.table.ResourceType
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size
import java.util.UUID

data class CreateReviewDto(
    @field:NotNull(message = "L'ID de l'utilisateur est requis")
    val userId: UUID,

    @field:NotNull(message = "Le type de ressource est requis")
    val resourceType: ResourceType,

    @field:NotNull(message = "L'ID de la ressource est requis")
    val resourceId: UUID,

    @field:NotNull(message = "La note est requise")
    @field:Min(value = 1, message = "La note minimum est 1")
    @field:Max(value = 5, message = "La note maximum est 5")
    val rating: Int,

    @field:Size(max = 1000, message = "Le commentaire ne peut pas dépasser 1000 caractères")
    val comment: String? = null
)
