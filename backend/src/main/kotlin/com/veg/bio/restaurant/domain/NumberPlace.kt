package com.veg.bio.restaurant.domain

import com.fasterxml.jackson.core.JsonParser
import com.fasterxml.jackson.databind.DeserializationContext
import com.fasterxml.jackson.databind.JsonDeserializer
import com.fasterxml.jackson.databind.annotation.JsonDeserialize

const val maxNumberPlace = 500
const val minNumberPlace = 10


class NumberPlaceDeserializer : JsonDeserializer<NumberPlace>(){
    override fun deserialize(p: JsonParser, ctxt: DeserializationContext): NumberPlace {
        val value = p.valueAsInt
        return NumberPlace(value)
    }
}

@JsonDeserialize(using = NumberPlaceDeserializer::class)
@JvmInline
value class NumberPlace(val value: Int){
    init {
        require(value >= minNumberPlace){
            "Impossible minus $minNumberPlace"
        }
        require(value <= maxNumberPlace){
            "Impossible bigger $maxNumberPlace"
        }
    }

    override fun toString(): String = value.toString()
    fun toInt(): Int = value
}