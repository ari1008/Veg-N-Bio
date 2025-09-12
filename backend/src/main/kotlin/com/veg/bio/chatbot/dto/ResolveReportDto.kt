package com.veg.bio.chatbot.dto

import jakarta.validation.constraints.NotBlank

data class ResolveReportDto(
    @field:NotBlank val resolution: String,
    val updateDisease: Boolean = false
)
