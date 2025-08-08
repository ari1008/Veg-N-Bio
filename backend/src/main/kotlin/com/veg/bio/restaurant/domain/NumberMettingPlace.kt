package com.veg.bio.restaurant.domain

import com.fasterxml.jackson.core.JsonParser
import com.fasterxml.jackson.databind.DeserializationContext
import com.fasterxml.jackson.databind.JsonDeserializer
import com.fasterxml.jackson.databind.annotation.JsonDeserialize

const val maxNumberMettingPlace = 50
const val minNumberMettingPlace = 1


class NumberMettingPlaceDeserializer: JsonDeserializer<NumberMettingPlace>(){
    override fun deserialize(p: JsonParser, ctxt: DeserializationContext): NumberMettingPlace {
        val value = p.valueAsInt
        return NumberMettingPlace(value)
    }
}

@JsonDeserialize(using = NumberMettingPlaceDeserializer::class)
@JvmInline
value class NumberMettingPlace(val value: Int){
    init {
        require(value >= minNumberMettingPlace){
            "Impossible minus $minNumberPlace"
        }
        require(value <= maxNumberMettingPlace){
            "Impossible bigger $maxNumberMettingPlace"
        }
    }
    override fun toString(): String = value.toString()
    fun toInt(): Int = value
}