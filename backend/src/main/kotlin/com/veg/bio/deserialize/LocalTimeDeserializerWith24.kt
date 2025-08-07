package com.veg.bio.deserialize

import com.fasterxml.jackson.core.JsonParser
import com.fasterxml.jackson.databind.DeserializationContext
import com.fasterxml.jackson.databind.deser.std.StdDeserializer
import java.time.LocalTime

class LocalTimeDeserializerWith24 : StdDeserializer<LocalTime>(LocalTime::class.java) {
    override fun deserialize(p: JsonParser, ctxt: DeserializationContext): LocalTime {
        val value = p.text.trim()
        return if (value == "24:00") LocalTime.MIDNIGHT else LocalTime.parse(value)
    }
}
