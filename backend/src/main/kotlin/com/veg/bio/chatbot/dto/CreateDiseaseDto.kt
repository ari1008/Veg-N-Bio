package com.veg.bio.chatbot.dto

import com.veg.bio.infrastructure.table.UrgencyLevel
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotEmpty
import jakarta.validation.constraints.NotNull

data class CreateDiseaseDto(
    @field:NotBlank val name: String,
    @field:NotBlank val description: String,
    @field:NotEmpty val symptoms: List<String>,
    @field:NotEmpty val affectedRaces: List<String>,
    @field:NotNull val urgency: UrgencyLevel,
    @field:NotBlank val advice: String,
    val prevention: String? = null
)