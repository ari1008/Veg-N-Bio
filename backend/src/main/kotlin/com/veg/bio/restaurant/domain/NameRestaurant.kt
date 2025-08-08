package com.veg.bio.restaurant.domain

import com.fasterxml.jackson.core.JsonParser
import com.fasterxml.jackson.databind.DeserializationContext
import com.fasterxml.jackson.databind.JsonDeserializer
import com.fasterxml.jackson.databind.annotation.JsonDeserialize


class NameRestaurantDeserializer : JsonDeserializer<NameRestaurant>(){
    override fun deserialize(
        p: JsonParser, ctxt: DeserializationContext
    ): NameRestaurant {
        val value = p.valueAsString
        return NameRestaurant(value = value)
    }

}

@JsonDeserialize(using = NameRestaurantDeserializer::class)
@JvmInline
value class NameRestaurant(val value: String) {
    init {
        require(value.isNotBlank()) { "The name of restaurant cannot be blank" }
        require(value.length <= 100) { "The name of restaurant is too big" }
        require(value.length > 2) { "The name of restaurant is too minus "}
    }

    override fun toString(): String = value
}