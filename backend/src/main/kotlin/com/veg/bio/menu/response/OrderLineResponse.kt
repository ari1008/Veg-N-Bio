package com.veg.bio.menu.response

import com.veg.bio.menu.domain.Allergen
import java.util.UUID

data class OrderLineResponse(
    val id: UUID?,
    val dishName: String,
    val unitPrice: Double,
    val quantity: Int,
    val lineTotal: Double,
    val allergens: Set<Allergen>
)
