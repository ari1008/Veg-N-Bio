package com.veg.bio.configuration

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.kotlin.KotlinFeature
import com.fasterxml.jackson.module.kotlin.KotlinModule
import com.veg.bio.deserialize.LocalTimeDeserializerWith24
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import java.time.LocalTime

@Configuration
class JacksonConfig {
    @Bean
    fun objectMapper(): ObjectMapper {
        val javaTimeModule = JavaTimeModule().apply {
            addDeserializer(LocalTime::class.java, LocalTimeDeserializerWith24())
        }

        return ObjectMapper()
            .registerModule(
                KotlinModule.Builder()
                    .configure(KotlinFeature.StrictNullChecks, true)
                    .build()
            )
            .registerModule(javaTimeModule)
    }
}