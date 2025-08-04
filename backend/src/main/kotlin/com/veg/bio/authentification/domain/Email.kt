package com.veg.bio.authentification.domain

import com.fasterxml.jackson.core.JsonParser
import com.fasterxml.jackson.databind.DeserializationContext
import com.fasterxml.jackson.databind.JsonDeserializer
import com.fasterxml.jackson.databind.annotation.JsonDeserialize

class EmailDeserializer : JsonDeserializer<Email>() {
    override fun deserialize(p: JsonParser, ctxt: DeserializationContext): Email {
        val value = p.valueAsString
        return Email(value)
    }
}



@JsonDeserialize(using = EmailDeserializer::class)
@JvmInline
value class Email(val value: String) {
    init {
        require(EMAIL_REGEX.matches(value)) {
            "Invalid email format: $value"
        }
    }

    override fun toString(): String = value

    companion object {
        private val EMAIL_REGEX = Regex("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}$")
    }
}