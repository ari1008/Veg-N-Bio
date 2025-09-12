package com.veg.bio.deserialize

import com.fasterxml.jackson.core.JsonParser
import com.fasterxml.jackson.databind.DeserializationContext
import com.fasterxml.jackson.databind.deser.std.StdDeserializer
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

class LocalDateTimeDeserializerNoTz : StdDeserializer<LocalDateTime>(LocalDateTime::class.java) {

    private val formatters = listOf(
        DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss"),
        DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS"),
        DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm"),
        DateTimeFormatter.ISO_LOCAL_DATE_TIME
    )

    override fun deserialize(p: JsonParser, ctxt: DeserializationContext): LocalDateTime {
        val value = p.text.trim()

        for (formatter in formatters) {
            try {
                return LocalDateTime.parse(value, formatter)
            } catch (e: Exception) {

            }
        }

        return LocalDateTime.parse(value)
    }
}
