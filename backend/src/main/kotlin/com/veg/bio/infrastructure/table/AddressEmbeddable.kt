package com.veg.bio.infrastructure.table

import jakarta.persistence.Column
import jakarta.persistence.Embeddable

@Embeddable
data class AddressEmbeddable(
    @Column(name = "street_number")
    val streetNumber: Int,

    @Column(name = "street_name")
    val streetName: String,

    @Column(name = "postal_code")
    val postalCode: String,

    @Column(name = "city")
    val city: String,

    @Column(name = "country")
    val country: String = "France"
)