package com.veg.bio.menu.dto

import java.util.UUID

data class Order(
    val idRestaurant: UUID,
    val idUser: UUID,
    val listDishNumber: List<DishNumber>
)
