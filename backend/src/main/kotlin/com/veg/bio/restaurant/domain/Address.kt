package com.veg.bio.restaurant.domain

data class Address(
    val streetNumber: Int,
    val streetName: String,
    val postalCode: String,
    val city: String,
    val country: String = "France"
){
    init {
        require(streetName.isNotBlank()) { "Le nom de la rue est obligatoire" }
        require(city.isNotBlank()) { "La ville est obligatoire" }
        require(postalCode.matches(Regex("\\d{5}"))) { "Code postal invalide" }
    }

    override fun toString(): String = "$streetNumber $streetName, $postalCode $city, $country"
}
