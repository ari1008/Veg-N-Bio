package com.veg.bio.menu.domain

import com.fasterxml.jackson.core.JsonParser
import com.fasterxml.jackson.databind.DeserializationContext
import com.fasterxml.jackson.databind.JsonDeserializer
import com.fasterxml.jackson.databind.annotation.JsonDeserialize


class NumberDishDeserializer: JsonDeserializer<NumberDish>(){
    override fun deserialize(
        p: JsonParser, ctxt: DeserializationContext
    ): NumberDish {
        val value = p.valueAsInt
        return NumberDish(value = value)
    }
}

@JsonDeserialize(using = NumberDishDeserializer::class)
@JvmInline
value class NumberDish(val value: Int){
    init {
        require(value>=1){"The number dish is min equal 1"}
        require(value<=20){"The number dish is max equal 20"}
    }

    override fun toString(): String = value.toString()
}