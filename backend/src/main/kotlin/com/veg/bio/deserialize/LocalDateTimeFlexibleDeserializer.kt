package com.veg.bio.deserialize

import com.fasterxml.jackson.core.JsonParser
import com.fasterxml.jackson.databind.DeserializationContext
import com.fasterxml.jackson.databind.deser.std.StdDeserializer
import java.time.LocalDateTime

class LocalDateTimeFlexibleDeserializer : StdDeserializer<LocalDateTime>(LocalDateTime::class.java) {
    override fun deserialize(p: JsonParser?, ctxt: DeserializationContext?): LocalDateTime {
        var value = p?.text?.trim() ?: throw IllegalArgumentException("Invalid date format")

        value = value
            .replace("Z", "")
            .replace(Regex("\\.\\d{1,6}"), "")
            .replace(Regex("\\+\\d{2}:\\d{2}$"), "")
            .replace(Regex("-\\d{2}:\\d{2}$"), "")
        if (value.matches(Regex("\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}$"))) {
            value += ":00"
        }
        return LocalDateTime.parse(value)
    }
}
