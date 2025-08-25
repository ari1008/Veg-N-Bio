package com.veg.bio.menu.dto

import com.veg.bio.menu.NotGoodPrice
import com.veg.bio.menu.domain.Allergen
import com.veg.bio.menu.domain.Category
import com.veg.bio.menu.domain.Description
import com.veg.bio.menu.domain.NameDish

data class DishPatchDto(
    val name: NameDish? = null,
    val description: Description? = null,
    val price: Double? = null,
    val category: Category? = null,
    val available: Boolean? = true,
    val allergens: Set<Allergen>? = null,
){
    init{
        validate()
    }


    private fun validate(){
        if(price!=null && price !in 3.0..1000.0) throw NotGoodPrice()
    }
}
