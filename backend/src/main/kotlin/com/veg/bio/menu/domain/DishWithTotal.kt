package com.veg.bio.menu.domain

import com.veg.bio.infrastructure.table.DishEntity


data class DishWithTotal(
    val dish: DishEntity,
    val total: Int
)
