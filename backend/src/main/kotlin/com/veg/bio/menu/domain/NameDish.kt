package com.veg.bio.menu.domain

import com.fasterxml.jackson.core.JsonParser
import com.fasterxml.jackson.databind.DeserializationContext
import com.fasterxml.jackson.databind.JsonDeserializer
import com.fasterxml.jackson.databind.annotation.JsonDeserialize


class NameDishDeserializer: JsonDeserializer<NameDish>(){
    override fun deserialize(
        p: JsonParser, ctxt: DeserializationContext
    ): NameDish {
        val value = p.valueAsString
        return NameDish(value = value)
    }
}

@JsonDeserialize(using = NameDishDeserializer::class)
@JvmInline
value class NameDish(val value: String){
    init {
        require(value.isNotBlank()) { "The name of dish cannot be blank" }
        require(value.length <= 100) { "The name of dish is too big" }
        require(value.length > 2) { "The name of dish is too minus "}
    }

    override fun toString(): String = value
}