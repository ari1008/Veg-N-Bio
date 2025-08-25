package com.veg.bio.menu.dto

import com.veg.bio.infrastructure.table.AddressEmbeddable
import java.util.UUID

data class RestaurantDto(
    val id: UUID,
    val name: String,
    val addressEmbeddable: AddressEmbeddable,
)
