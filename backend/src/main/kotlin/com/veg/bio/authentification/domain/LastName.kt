package com.veg.bio.authentification.domain

import com.fasterxml.jackson.core.JsonParser
import com.fasterxml.jackson.databind.DeserializationContext
import com.fasterxml.jackson.databind.JsonDeserializer
import com.fasterxml.jackson.databind.annotation.JsonDeserialize

class LastNameDeserializer : JsonDeserializer<LastName>() {
    override fun deserialize(p: JsonParser, ctxt: DeserializationContext): LastName {
        val value = p.valueAsString
        return LastName(value)
    }
}

@JsonDeserialize(using = LastNameDeserializer::class)
@JvmInline
value class LastName(val value: String) {
    init {
        require(value.length in 1..50) { "Last name is required (1–50 chars)." }
        require(NAME_REGEX.matches(value)) { "Invalid last name format: $value" }
    }

    override fun toString(): String = value

    companion object {
        private val NAME_REGEX = Regex("^[A-Z][a-zA-Z-'éèêëàâäïîôöùûüç ]*\$")
    }
}