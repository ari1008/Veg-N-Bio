package com.veg.bio.configuration

import com.fasterxml.jackson.databind.DeserializationFeature
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.SerializationFeature
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer
import com.fasterxml.jackson.module.kotlin.KotlinFeature
import com.fasterxml.jackson.module.kotlin.KotlinModule
import com.veg.bio.deserialize.LocalDateTimeFlexibleDeserializer
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

@Configuration
class JacksonConfig {
    @Bean
    fun objectMapper(): ObjectMapper {
        val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss")

        val javaTimeModule = JavaTimeModule().apply {
            // Utiliser notre deserializer personnalisé au lieu du standard
            addDeserializer(LocalDateTime::class.java, LocalDateTimeFlexibleDeserializer())
            addSerializer(LocalDateTime::class.java, LocalDateTimeSerializer(formatter))
        }

        return ObjectMapper()
            .registerModule(
                KotlinModule.Builder()
                    .configure(KotlinFeature.StrictNullChecks, true)
                    .build()
            )
            .registerModule(javaTimeModule)
            // Configurations importantes pour éviter les conversions de timezone
            .configure(DeserializationFeature.ADJUST_DATES_TO_CONTEXT_TIME_ZONE, false)
            .configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false)
    }
}