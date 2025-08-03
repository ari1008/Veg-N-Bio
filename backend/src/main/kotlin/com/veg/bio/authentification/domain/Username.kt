package com.veg.bio.authentification.domain

import com.fasterxml.jackson.core.JsonParser
import com.fasterxml.jackson.databind.DeserializationContext
import com.fasterxml.jackson.databind.JsonDeserializer
import com.fasterxml.jackson.databind.annotation.JsonDeserialize

class UsernameDeserializer : JsonDeserializer<Username>() {
    override fun deserialize(p: JsonParser, ctxt: DeserializationContext): Username {
        val value = p.valueAsString
        return Username(value)
    }
}

@JsonDeserialize(using = UsernameDeserializer::class)
@JvmInline
value class Username(val value: String) {
    init {
        require(value.length in 3..30) { "Username must be between 3 and 30 characters." }
        require(USERNAME_REGEX.matches(value)) { "Invalid username format: $value" }
    }

    override fun toString(): String = value

    companion object {
        private val USERNAME_REGEX = Regex("^[a-zA-Z0-9_]+\$")
    }
}