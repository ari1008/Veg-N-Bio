package com.veg.bio.deserialize

import com.fasterxml.jackson.core.JsonParser
import com.fasterxml.jackson.databind.DeserializationContext
import com.fasterxml.jackson.databind.deser.std.StdDeserializer
import java.time.LocalDateTime

class LocalDateTimeFlexibleDeserializer : StdDeserializer<LocalDateTime>(LocalDateTime::class.java) {
    override fun deserialize(p: JsonParser?, ctxt: DeserializationContext?): LocalDateTime {
        var value = p?.text?.trim() ?: throw IllegalArgumentException("Invalid date format")

        // Nettoyer la chaîne de caractères
        value = value
            .replace("Z", "")                           // Enlever le Z (UTC)
            .replace(Regex("\\.\\d{1,6}"), "")          // Enlever les millisecondes (.000, .123456, etc.)
            .replace(Regex("\\+\\d{2}:\\d{2}$"), "")    // Enlever les offsets timezone (+02:00)
            .replace(Regex("-\\d{2}:\\d{2}$"), "")      // Enlever les offsets timezone (-05:00)

        // Si on a seulement YYYY-MM-DDTHH:mm, ajouter les secondes
        if (value.matches(Regex("\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}$"))) {
            value += ":00"
        }

        println("DEBUG: Original: '${p?.text}' -> Cleaned: '$value'") // Log temporaire
        return LocalDateTime.parse(value)
    }
}
