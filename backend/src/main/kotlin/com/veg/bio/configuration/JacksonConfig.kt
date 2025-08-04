package com.veg.bio.configuration

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.KotlinFeature
import com.fasterxml.jackson.module.kotlin.KotlinModule
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class JacksonConfig {
    @Bean
    fun objectMapper(): ObjectMapper {
        return ObjectMapper()
            .registerModule(
                KotlinModule.Builder()
                    .configure(KotlinFeature.StrictNullChecks, true)
                .build()
            )
    }
}