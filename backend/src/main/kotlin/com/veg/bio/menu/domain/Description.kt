package com.veg.bio.menu.domain

import com.fasterxml.jackson.core.JsonParser
import com.fasterxml.jackson.databind.DeserializationContext
import com.fasterxml.jackson.databind.JsonDeserializer
import com.fasterxml.jackson.databind.annotation.JsonDeserialize

class DescriptionDeserializer: JsonDeserializer<Description>(){
    override fun deserialize(
        p: JsonParser, ctxt: DeserializationContext
    ): Description {
        val value = p.valueAsString
        return Description(value = value)
    }
}

@JsonDeserialize(using = DescriptionDeserializer::class)
@JvmInline
value class Description(val value: String){
    init {
        require(value.isNotBlank()) { "The description cannot be blank" }
        require(value.length <= 200) { "The description is too big" }
        require(value.length > 20) { "The description is too minus "}
    }

    override fun toString(): String = value
}