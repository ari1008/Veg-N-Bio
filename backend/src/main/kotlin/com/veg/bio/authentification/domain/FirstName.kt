package com.veg.bio.authentification.domain

import com.fasterxml.jackson.core.JsonParser
import com.fasterxml.jackson.databind.DeserializationContext
import com.fasterxml.jackson.databind.JsonDeserializer
import com.fasterxml.jackson.databind.annotation.JsonDeserialize

class FirstNameDeserializer : JsonDeserializer<FirstName>() {
    override fun deserialize(p: JsonParser, ctxt: DeserializationContext): FirstName {
        val value = p.valueAsString
        return FirstName(value)
    }
}

@JsonDeserialize(using = FirstNameDeserializer::class)
@JvmInline
value class FirstName(val value: String) {
    init {
        require(value.length in 1..50) { "First name is required (1–50 chars)." }
        require(NAME_REGEX.matches(value)) { "Invalid first name format: $value" }
    }

    override fun toString(): String = value

    companion object {
        private val NAME_REGEX = Regex("^[a-zA-Z-'éèêëàâäïîôöùûüç ]*\$")
    }
}