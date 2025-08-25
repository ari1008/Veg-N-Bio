package com.veg.bio.menu.domain

import com.veg.bio.menu.NotGoodPrice

data class Dish(
    val name: NameDish,
    val description: Description,
    val price: Double,
    val category: Category,
    val available: Boolean = true,
    val allergens: Set<Allergen> = emptySet(),

){
    init{
        validate()
    }


    private fun validate(){
        if(price !in 3.0..1000.0) throw NotGoodPrice()
    }
}
