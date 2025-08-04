package com.veg.bio.authentification.domain

import com.fasterxml.jackson.core.JsonParser
import com.fasterxml.jackson.databind.DeserializationContext
import com.fasterxml.jackson.databind.JsonDeserializer
import com.fasterxml.jackson.databind.annotation.JsonDeserialize

class PasswordNameDeserializer : JsonDeserializer<Password>() {
    override fun deserialize(p: JsonParser, ctxt: DeserializationContext): Password {
        val value = p.valueAsString
        return Password(value)
    }
}

@JsonDeserialize(using = PasswordNameDeserializer::class)
@JvmInline
value class Password(val value: String) {
    init {
        require(value.length >= 8) { "Password Must Be bigger  seven length " }
        require(PASSWORD_REGEX.matches(value)) { "Invalid password format: $value" }
    }

    override fun toString(): String = value

    companion object {
        private val PASSWORD_REGEX = Regex(
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@\$!%*?&.#^\\-])[A-Za-z\\d@\$!%*?&.#^\\-]{8,}$"
        )
    }
}